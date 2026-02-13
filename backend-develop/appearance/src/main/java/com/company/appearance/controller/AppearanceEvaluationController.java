package com.company.appearance.controller;

import com.company.appearance.dto.AppearanceEvaluationRequest;
import com.company.appearance.dto.AppearanceEvaluationResponse;
import com.company.appearance.model.AppearanceEvaluation;
import com.company.appearance.service.AppearanceEvaluationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for appearance evaluation APIs.
 *
 * This controller only handles HTTP requests and responses.
 * All business logic is delegated to the service layer.
 */
@RestController
@RequestMapping("/api/evaluations")
@Tag(name = "Appearance Evaluation", description = "Evaluate employee appearance based on criteria")
public class AppearanceEvaluationController {

    private final AppearanceEvaluationService service;

    /**
     * Constructor for injecting AppearanceEvaluationService.
     *
     * @param service the AppearanceEvaluationService instance
     */
    public AppearanceEvaluationController(AppearanceEvaluationService service) {
        this.service = service;
    }

    /**
     * Evaluates employee appearance based on input criteria.
     *
     * @param request JSON request containing employeeId and appearance criteria
     * @return evaluation result including score and violations
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EVALUATOR')")
    @Operation(summary="Create an appearance evaluation for an employee",
        description="Evaluates employee appearance based on provided criteria and returns the evaluation result."
    )
    public AppearanceEvaluationResponse evaluate(
            @RequestBody AppearanceEvaluationRequest request) {

        // Delegate evaluation logic to service layer
        return service.evaluate(request);
    }

    @GetMapping()
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EVALUATOR')")
    @Operation(summary="Get all appearance evaluations",
        description="Retrieves a list of all appearance evaluations in the system."
    )
    public List<AppearanceEvaluation> getAll() {
        return service.getAll();

    }

    @GetMapping("/employee/by-id/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EVALUATOR')")
    @Operation(summary="Get evaluations by employee ID",
        description="Retrieves all appearance evaluations for a specific employee by their ID."
    )
    public List<AppearanceEvaluation> getEvaluationsByEmployeeId(@PathVariable String employeeId) {
        return service.getEvaluationsByEmployeeId(employeeId);
    }

    @GetMapping("/employee/by-name/{name}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EVALUATOR')")
    @Operation(summary="Get evaluations by employee name",
        description="Retrieves all appearance evaluations for a specific employee by their name."
    )
    public List<AppearanceEvaluation> getEvaluationsByEmployeeName(@PathVariable String name) {
        return service.getEvaluationsByEmployeeName(name);
    }

}