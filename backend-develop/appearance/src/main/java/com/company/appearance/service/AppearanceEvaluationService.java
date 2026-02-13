package com.company.appearance.service;

import com.company.appearance.config.RuleConfig;
import com.company.appearance.config.RuleConfigLoader;
import com.company.appearance.dto.AppearanceEvaluationRequest;
import com.company.appearance.dto.AppearanceEvaluationResponse;
import com.company.appearance.dto.PoseData;
import com.company.appearance.dto.integration.AppearanceEvaluationSnapshot;
import com.company.appearance.model.AppearanceCriteria;
import com.company.appearance.model.AppearanceEvaluation;
import com.company.appearance.model.Employee;
import com.company.appearance.repository.AppearanceEvaluationRepository;
import com.company.appearance.repository.EmployeeRepository;
import com.company.appearance.service.integration.GoogleChatNotificationService;
import com.company.appearance.service.integration.GoogleSheetsExportService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service class responsible for rule-based appearance evaluation.
 * 
 * This service does NOT save data to database.
 * It evaluates appearance based on dynamic rules from rule-config.json.
 */
@Service
public class AppearanceEvaluationService {

    private final AppearanceEvaluationRepository appearanceEvaluationRepository;
    private final EmployeeRepository employeeRepository;
    private final RuleConfigLoader ruleConfigLoader;
    private final GoogleChatNotificationService googleChatNotificationService;
    private final GoogleSheetsExportService googleSheetsExportService;

    // Mapping rule → user-friendly message
    private static final Map<String, String> VIOLATION_MESSAGES = Map.of(
            "shirt", "Shirt does not meet the dress code",
            "pants", "Pants do not meet the dress code",
            "shoes", "Shoes do not meet the dress code",
            "tie", "Tie does not meet the dress code",
            "hat", "Hat does not meet the dress code",
            "hair", "Hair style does not meet the dress code");

    public AppearanceEvaluationService(RuleConfigLoader ruleConfigLoader,
            AppearanceEvaluationRepository appearanceEvaluationRepository,
            EmployeeRepository employeeRepository,
            GoogleChatNotificationService googleChatNotificationService,
            GoogleSheetsExportService googleSheetsExportService) {
        this.ruleConfigLoader = ruleConfigLoader;
        this.appearanceEvaluationRepository = appearanceEvaluationRepository;
        this.employeeRepository = employeeRepository;
        this.googleChatNotificationService = googleChatNotificationService;
        this.googleSheetsExportService = googleSheetsExportService;
    }

    /**
     * Evaluate appearance based on rule-config.json and save to database
     */
    public AppearanceEvaluationResponse evaluate(AppearanceEvaluationRequest request) {
        AppearanceCriteria criteria = request.getCriteria();
        PoseData pose = request.getPose();
        RuleConfig ruleConfig = ruleConfigLoader.getRuleConfig();
        boolean poseStraight = isPoseStraight(pose, ruleConfig.getPose());

        if (!poseStraight) {
            List<String> violations = buildPoseViolations(pose, ruleConfig.getPose());

            return new AppearanceEvaluationResponse(
                    null,
                    request.getEmployeeId(),
                    false,
                    0,
                    violations,
                    LocalDateTime.now(),
                    criteria,
                    pose,
                    false,
                    false);
        }

        List<String> violations = new ArrayList<>();

        // Check required rules dynamically
        for (String rule : ruleConfig.getRequired()) {
            if (!isCriteriaSatisfied(criteria, rule)) {
                violations.add(VIOLATION_MESSAGES.getOrDefault(rule, rule));
            }
        }

        boolean passed = violations.isEmpty();

        int baseScore = ruleConfig.getScore().getBase();
        int penalty = ruleConfig.getScore().getPenaltyPerViolation();
        int minScore = ruleConfig.getScore().getMinScore();

        int score = Math.max(baseScore - violations.size() * penalty, minScore);

        LocalDateTime evaluatedAt = LocalDateTime.now();

        // Find employee by ID
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(
                        () -> new IllegalArgumentException("Employee not found with ID: " + request.getEmployeeId()));

        // Create and save AppearanceEvaluation entity
        AppearanceEvaluation evaluation = new AppearanceEvaluation(
                employee,
                criteria,
                passed,
                score,
                violations,
                null, // note can be null for now
                evaluatedAt);

        AppearanceEvaluation savedEvaluation = appearanceEvaluationRepository.save(evaluation);

        // Build immutable snapshot to avoid LAZY loading issues in async methods
        AppearanceEvaluationSnapshot snapshot = buildSnapshot(savedEvaluation, employee, criteria);

        // Send Google Chat notification (async, best-effort)
        googleChatNotificationService.notify(snapshot);

        // Export to Google Sheets (async, best-effort)
        googleSheetsExportService.append(snapshot);

        // Return response with all fields populated
        return new AppearanceEvaluationResponse(
                savedEvaluation.getId(),
                savedEvaluation.getEmployee().getId(),
                savedEvaluation.isPassed(),
                savedEvaluation.getScore(),
                savedEvaluation.getViolations(),
                savedEvaluation.getEvaluatedAt(),
                criteria,
                pose,
                true,
                true);
    }

    private boolean isPoseStraight(PoseData pose, RuleConfig.Pose poseRule) {
        // Basic pose check: all metrics must be in "green" range.
        if (pose == null) {
            return true;
        }

        if (poseRule == null) {
            throw new IllegalStateException("Pose rules are missing in rule-config.json");
        }

        return Math.abs(pose.getHeadTilt()) <= poseRule.getHeadGoodMax()
                && Math.abs(pose.getShoulderTilt()) <= poseRule.getShoulderGoodMax()
                && Math.abs(pose.getSpineAngle()) <= poseRule.getBackGoodMax()
                && Math.abs(pose.getForwardHeadZ()) < poseRule.getForwardHeadGoodMax()
                && pose.getStabilityScore() >= poseRule.getStabilityGoodMin();
    }

    private List<String> buildPoseViolations(PoseData pose, RuleConfig.Pose poseRule) {
        // Build detailed pose warnings based on green/yellow/red thresholds.
        List<String> violations = new ArrayList<>();

        if (pose == null) {
            violations.add("Pose data is missing");
            return violations;
        }

        if (poseRule == null) {
            violations.add("Pose rules are missing in rule-config.json");
            return violations;
        }

        double head = Math.abs(pose.getHeadTilt());
        if (head > poseRule.getHeadWarnMax()) {
            violations.add("Head deviation is critical");
        } else if (head > poseRule.getHeadGoodMax()) {
            violations.add("Head deviation warning");
        }

        double shoulder = Math.abs(pose.getShoulderTilt());
        if (shoulder > poseRule.getShoulderWarnMax()) {
            violations.add("Shoulder tilt is critical");
        } else if (shoulder > poseRule.getShoulderGoodMax()) {
            violations.add("Shoulder tilt warning");
        }

        double back = Math.abs(pose.getSpineAngle());
        if (back > poseRule.getBackWarnMax()) {
            violations.add("Back deviation is critical");
        } else if (back > poseRule.getBackGoodMax()) {
            violations.add("Back deviation warning");
        }

        double forwardHead = Math.abs(pose.getForwardHeadZ());
        if (forwardHead >= poseRule.getForwardHeadWarnMax()) {
            violations.add("Forward head posture is critical");
        } else if (forwardHead >= poseRule.getForwardHeadGoodMax()) {
            violations.add("Forward head posture warning");
        }

        double stability = pose.getStabilityScore();
        if (stability < poseRule.getStabilityWarnMin()) {
            violations.add("Stability score is critical");
        } else if (stability < poseRule.getStabilityGoodMin()) {
            violations.add("Stability score warning");
        }

        double arm = Math.abs(pose.getMaxArmAngle());
        if (arm > poseRule.getArmBadMin()) {
            violations.add("Arm angle is critical");
        } else if (arm > poseRule.getArmWarnMin()) {
            violations.add("Arm angle warning");
        }

        double leg = Math.abs(pose.getMaxLegAngle());
        if (leg > poseRule.getLegBadMin()) {
            violations.add("Leg angle is critical");
        } else if (leg > poseRule.getLegWarnMin()) {
            violations.add("Leg angle warning");
        }

        if (violations.isEmpty()) {
            // Fallback message if nothing matched (should rarely happen).
            violations.add("Pose is not straight");
        }

        return violations;
    }

    /**
     * Builds immutable snapshot from saved evaluation entity.
     * Must be called within transaction while employee and violations are accessible.
     */
    private AppearanceEvaluationSnapshot buildSnapshot(
            AppearanceEvaluation savedEvaluation, 
            Employee employee, 
            AppearanceCriteria criteria) {
        
        // Get evaluator username from SecurityContext if available
        String evaluatorUsername = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            evaluatorUsername = authentication.getName();
        }

        return new AppearanceEvaluationSnapshot(
                savedEvaluation.getId(),
                employee.getId(),
                employee.getName(),
                employee.getDepartment(),
                employee.getPosition(),
                savedEvaluation.isPassed(),
                savedEvaluation.getScore(),
                new ArrayList<>(savedEvaluation.getViolations()), // Copy to avoid LAZY issues
                savedEvaluation.getEvaluatedAt(),
                savedEvaluation.getNote(),
                criteria.isHat(),
                criteria.isHair(),
                criteria.isTie(),
                criteria.isShirt(),
                criteria.isPants(),
                criteria.isShoes(),
                evaluatorUsername
        );
    }

    /**
     * Dynamically checks criteria like isShirt(), isPants(), ...
     */
    private boolean isCriteriaSatisfied(AppearanceCriteria criteria, String rule) {
        try {
            String methodName = "is" + rule.substring(0, 1).toUpperCase() + rule.substring(1);
            Method method = AppearanceCriteria.class.getMethod(methodName);
            return (boolean) method.invoke(criteria);
        } catch (Exception e) {
            return false;
        }
    }

    public List<AppearanceEvaluation> getAll() {
        return appearanceEvaluationRepository.findAllByOrderByEvaluatedAtDesc();
    }

    public List<AppearanceEvaluation> getEvaluationsByEmployeeId(String employeeId) {
        return appearanceEvaluationRepository.findByEmployeeIdOrderByEvaluatedAtDesc(employeeId);
    }

    public List<AppearanceEvaluation> getEvaluationsByEmployeeName(String name) {
        return appearanceEvaluationRepository.findByEmployee_NameContainingIgnoreCaseOrderByEvaluatedAtDesc(name);
    }
}
