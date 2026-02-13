package com.company.appearance.dto.integration;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Immutable snapshot DTO for appearance evaluation data.
 * Contains all fields needed for Google Chat and Google Sheets integration.
 * Built immediately after saving evaluation to avoid LAZY loading issues.
 */
public class AppearanceEvaluationSnapshot {

    private final Long evaluationId;
    private final String employeeId;
    private final String employeeName;
    private final String department;
    private final String position;
    private final boolean passed;
    private final int score;
    private final List<String> violations;
    private final LocalDateTime evaluatedAt;
    private final String note;
    
    // Criteria fields
    private final boolean criteriaHat;
    private final boolean criteriaHair;
    private final boolean criteriaTie;
    private final boolean criteriaShirt;
    private final boolean criteriaPants;
    private final boolean criteriaShoes;
    
    // Optional: evaluator username from SecurityContext
    private final String evaluatorUsername;

    public AppearanceEvaluationSnapshot(
            Long evaluationId,
            String employeeId,
            String employeeName,
            String department,
            String position,
            boolean passed,
            int score,
            List<String> violations,
            LocalDateTime evaluatedAt,
            String note,
            boolean criteriaHat,
            boolean criteriaHair,
            boolean criteriaTie,
            boolean criteriaShirt,
            boolean criteriaPants,
            boolean criteriaShoes,
            String evaluatorUsername) {
        this.evaluationId = evaluationId;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.department = department;
        this.position = position;
        this.passed = passed;
        this.score = score;
        this.violations = List.copyOf(violations != null ? violations : List.of());
        this.evaluatedAt = evaluatedAt;
        this.note = note;
        this.criteriaHat = criteriaHat;
        this.criteriaHair = criteriaHair;
        this.criteriaTie = criteriaTie;
        this.criteriaShirt = criteriaShirt;
        this.criteriaPants = criteriaPants;
        this.criteriaShoes = criteriaShoes;
        this.evaluatorUsername = evaluatorUsername;
    }

    public Long getEvaluationId() {
        return evaluationId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public String getPosition() {
        return position;
    }

    public boolean isPassed() {
        return passed;
    }

    public int getScore() {
        return score;
    }

    public List<String> getViolations() {
        return violations;
    }

    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }

    public String getNote() {
        return note;
    }

    public boolean isCriteriaHat() {
        return criteriaHat;
    }

    public boolean isCriteriaHair() {
        return criteriaHair;
    }

    public boolean isCriteriaTie() {
        return criteriaTie;
    }

    public boolean isCriteriaShirt() {
        return criteriaShirt;
    }

    public boolean isCriteriaPants() {
        return criteriaPants;
    }

    public boolean isCriteriaShoes() {
        return criteriaShoes;
    }

    public String getEvaluatorUsername() {
        return evaluatorUsername;
    }
}
