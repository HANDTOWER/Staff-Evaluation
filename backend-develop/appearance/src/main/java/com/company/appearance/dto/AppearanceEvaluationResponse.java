package com.company.appearance.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.company.appearance.model.AppearanceCriteria;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * DTO for appearance evaluation response.
 *
 * This class represents the evaluation result returned to frontend.
 */
@JsonPropertyOrder({
        "id",
        "employeeId",
        "pose",
        "poseStraight",
        "clothingEvaluated",
        "criteria",
        "passed",
        "score",
        "violations",
        "evaluatedAt"
})
public class AppearanceEvaluationResponse {

    private Long id;
    private String employeeId;
    private boolean passed;
    private int score;
    private List<String> violations;
    private LocalDateTime evaluatedAt;
    private AppearanceCriteria criteria;
    private PoseData pose;
    private boolean poseStraight;
    private boolean clothingEvaluated;

    /**
     * Default constructor.
     */
    public AppearanceEvaluationResponse() {
    }

    /**
     * Constructor with all fields.
     *
     * @param passed      evaluation result
     * @param score       calculated score
     * @param violations  list of violated appearance rules
     * @param evaluatedAt evaluation timestamp
     */
    public AppearanceEvaluationResponse(
            boolean passed,
            int score,
            List<String> violations,
            LocalDateTime evaluatedAt) {
        this.passed = passed;
        this.score = score;
        this.violations = violations;
        this.evaluatedAt = evaluatedAt;
    }

    /**
     * Constructor with all fields including ID and employeeId.
     *
     * @param id          evaluation ID
     * @param employeeId  employee ID
     * @param passed      evaluation result
     * @param score       calculated score
     * @param violations  list of violated appearance rules
     * @param evaluatedAt evaluation timestamp
     */
    public AppearanceEvaluationResponse(
            Long id,
            String employeeId,
            boolean passed,
            int score,
            List<String> violations,
            LocalDateTime evaluatedAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.passed = passed;
        this.score = score;
        this.violations = violations;
        this.evaluatedAt = evaluatedAt;
    }

    /**
     * Constructor with all fields including criteria and pose data.
     *
     * @param id                evaluation ID
     * @param employeeId        employee ID
     * @param passed            evaluation result
     * @param score             calculated score
     * @param violations        list of violated appearance rules
     * @param evaluatedAt       evaluation timestamp
     * @param criteria          clothing criteria
     * @param pose              pose data
     * @param poseStraight      whether pose is straight
     * @param clothingEvaluated whether clothing evaluation was performed
     */
    public AppearanceEvaluationResponse(
            Long id,
            String employeeId,
            boolean passed,
            int score,
            List<String> violations,
            LocalDateTime evaluatedAt,
            AppearanceCriteria criteria,
            PoseData pose,
            boolean poseStraight,
            boolean clothingEvaluated) {
        this.id = id;
        this.employeeId = employeeId;
        this.passed = passed;
        this.score = score;
        this.violations = violations;
        this.evaluatedAt = evaluatedAt;
        this.criteria = criteria;
        this.pose = pose;
        this.poseStraight = poseStraight;
        this.clothingEvaluated = clothingEvaluated;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }

    public void setEvaluatedAt(LocalDateTime evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }

    public List<String> getViolations() {
        return violations;
    }

    public void setViolations(List<String> violations) {
        this.violations = violations;
    }

    public AppearanceCriteria getCriteria() {
        return criteria;
    }

    public void setCriteria(AppearanceCriteria criteria) {
        this.criteria = criteria;
    }

    public PoseData getPose() {
        return pose;
    }

    public void setPose(PoseData pose) {
        this.pose = pose;
    }

    public boolean isPoseStraight() {
        return poseStraight;
    }

    public void setPoseStraight(boolean poseStraight) {
        this.poseStraight = poseStraight;
    }

    public boolean isClothingEvaluated() {
        return clothingEvaluated;
    }

    public void setClothingEvaluated(boolean clothingEvaluated) {
        this.clothingEvaluated = clothingEvaluated;
    }
}
