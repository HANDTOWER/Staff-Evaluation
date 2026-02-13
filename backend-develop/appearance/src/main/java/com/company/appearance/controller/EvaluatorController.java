// REST controller for Evaluator management endpoints
package com.company.appearance.controller;

import com.company.appearance.dto.EvaluatorResponse;
import com.company.appearance.model.UserAccount;
import com.company.appearance.service.EvaluatorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * EvaluatorController provides REST endpoints for managing evaluator accounts.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/api/evaluators")
@Tag(name = "Evaluator Management", description = "Evaluator account management API (Admin only)")
public class EvaluatorController {

    private final EvaluatorService evaluatorService;

    public EvaluatorController(EvaluatorService evaluatorService) {
        this.evaluatorService = evaluatorService;
    }

    /**
     * Gets all evaluator accounts.
     * 
     * @return List of all evaluator accounts
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all evaluators", 
               description = "Retrieves a list of all evaluator accounts in the system. Only accessible by administrators.")
    public ResponseEntity<List<EvaluatorResponse>> getAllEvaluators() {
        List<UserAccount> evaluators = evaluatorService.getAllEvaluators();
        
        List<EvaluatorResponse> response = evaluators.stream()
                .map(evaluator -> new EvaluatorResponse(
                        evaluator.getId(),
                        evaluator.getUsername(),
                        evaluator.getRole().name()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Gets an evaluator by ID.
     * 
     * @param id The evaluator ID
     * @return The evaluator details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get evaluator by ID", 
               description = "Retrieves an evaluator account by their unique identifier.")
    public ResponseEntity<EvaluatorResponse> getEvaluatorById(
            @PathVariable @Parameter(description = "Evaluator ID", required = true) Long id) {
        UserAccount evaluator = evaluatorService.getEvaluatorById(id);
        
        EvaluatorResponse response = new EvaluatorResponse(
                evaluator.getId(),
                evaluator.getUsername(),
                evaluator.getRole().name());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes an evaluator account.
     * 
     * @param id The evaluator ID to delete
     * @return Success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete an evaluator", 
               description = "Deletes an evaluator account by their unique identifier. Only EVALUATOR role accounts can be deleted, not ADMIN accounts.")
    public ResponseEntity<String> deleteEvaluator(
            @PathVariable @Parameter(description = "Evaluator ID", required = true) Long id) {
        evaluatorService.deleteEvaluator(id);
        return ResponseEntity.ok("Evaluator with ID " + id + " deleted successfully");
    }
}
