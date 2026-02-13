package com.company.appearance.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * AppearanceEvaluation represents a persistent entity in the application domain.
 */
@Entity
@Table(name = "appearance_evaluations")
public class AppearanceEvaluation {

    /**
     * Id field.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Employee relationship - many evaluations belong to one employee.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", referencedColumnName = "id")
    private Employee employee;

    /**
     * Criteria field.
     */
    @Embedded
    private AppearanceCriteria criteria;

    /**
     * Passed field.
     */
    private boolean passed;
    /**
     * Score field.
     */
    private int score;
    
    /**
     * Violations field - list of violated appearance rules.
     */
    @ElementCollection
    @CollectionTable(name = "appearance_evaluation_violations", joinColumns = @JoinColumn(name = "evaluation_id"))
    @Column(name = "violation")
    private List<String> violations;
    
    /**
     * Note field.
     */
    private String note;
    /**
     * EvaluatedAt field.
     */
    private LocalDateTime evaluatedAt;

    /**
     * Constructor for injecting AppearanceEvaluation dependencies.
     */
    public AppearanceEvaluation() {
    }

    public AppearanceEvaluation(Employee employee,
            AppearanceCriteria criteria,
            boolean passed,
            int score,
            List<String> violations,
            String note,
            LocalDateTime evaluatedAt) {
        this.employee = employee;
        this.criteria = criteria;
        this.passed = passed;
        this.score = score;
        this.violations = violations;
        this.note = note;
        this.evaluatedAt = evaluatedAt;
    }

    /**
     * Gets the id.
     * @return the id value
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the id.
     * @param id the entity identifier
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the employee.
     * @return the employee value
     */
    public Employee getEmployee() {
        return employee;
    }

    /**
     * Gets the criteria.
     * @return the criteria value
     */
    public AppearanceCriteria getCriteria() {
        return criteria;
    }

    /**
     * Checks whether passed is true.
     * @return boolean result
     */
    public boolean isPassed() {
        return passed;
    }

    /**
     * Gets the score.
     * @return the score value
     */
    public int getScore() {
        return score;
    }

    /**
     * Gets the violations.
     * @return the violations list
     */
    public List<String> getViolations() {
        return violations;
    }

    /**
     * Gets the note.
     * @return the note value
     */
    public String getNote() {
        return note;
    }

    /**
     * Gets the evaluatedAt.
     * @return the evaluatedAt value
     */
    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }

    /**
     * Sets the employee.
     * @param employee the employee value
     */
    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    /**
     * Sets the criteria.
     * @param criteria the criteria value
     */
    public void setCriteria(AppearanceCriteria criteria) {
        this.criteria = criteria;
    }

    /**
     * Sets the passed.
     * @param passed the passed value
     */
    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    /**
     * Sets the score.
     * @param score the score value
     */
    public void setScore(int score) {
        this.score = score;
    }

    /**
     * Sets the violations.
     * @param violations the violations list
     */
    public void setViolations(List<String> violations) {
        this.violations = violations;
    }

    /**
     * Sets the note.
     * @param note the note value
     */
    public void setNote(String note) {
        this.note = note;
    }

    /**
     * Sets the evaluatedAt.
     * @param evaluatedAt the evaluatedAt value
     */
    public void setEvaluatedAt(LocalDateTime evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }

    public AppearanceEvaluation(Long id, Employee employee, AppearanceCriteria criteria, boolean passed, int score,
            List<String> violations, String note, LocalDateTime evaluatedAt) {
        this.id = id;
        this.employee = employee;
        this.criteria = criteria;
        this.passed = passed;
        this.score = score;
        this.violations = violations;
        this.note = note;
        this.evaluatedAt = evaluatedAt;
    }

    @Override
    public String toString() {
        return "AppearanceEvaluation [id=" + id + ", employee=" + employee + ", criteria=" + criteria + ", passed="
                + passed + ", score=" + score + ", violations=" + violations + ", note=" + note + ", evaluatedAt=" + evaluatedAt + "]";
    }

}
