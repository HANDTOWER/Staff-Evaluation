// Repository interface for AppearanceEvaluation persistence operations
package com.company.appearance.repository;

import com.company.appearance.model.AppearanceEvaluation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * AppearanceEvaluationRepository provides persistence operations for
 * AppearanceEvaluation entities.
 */
public interface AppearanceEvaluationRepository
        extends JpaRepository<AppearanceEvaluation, Long> {

    List<AppearanceEvaluation> findByEmployeeIdOrderByEvaluatedAtDesc(String employeeId);

    List<AppearanceEvaluation> findByEvaluatedAtBetween(
            java.time.LocalDateTime start,
            java.time.LocalDateTime end);

    List<AppearanceEvaluation> findByPassed(boolean passed);

    List<AppearanceEvaluation> findByScoreGreaterThanEqual(int score);

    List<AppearanceEvaluation> findByScoreLessThanEqual(int score);

    List<AppearanceEvaluation> findByViolationsContaining(String violation);

    List<AppearanceEvaluation> findByEmployeeIdAndEvaluatedAtBetween(
            String employeeId,
            java.time.LocalDateTime start,
            java.time.LocalDateTime end);

    List<AppearanceEvaluation> findByEmployeeIdAndPassed(
            String employeeId,
            boolean passed);

    List<AppearanceEvaluation> findByEmployee_NameContainingIgnoreCaseOrderByEvaluatedAtDesc(String name);

    /**
     * Deletes all evaluations for a specific employee.
     * Used when updating employee ID to maintain data integrity.
     * 
     * @param employeeId the employee ID
     */
    void deleteByEmployeeId(String employeeId);

    List<AppearanceEvaluation> findAllByOrderByEvaluatedAtDesc();

}
