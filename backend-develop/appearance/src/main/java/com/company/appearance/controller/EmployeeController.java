// REST controller for Employee endpoints
package com.company.appearance.controller;

import com.company.appearance.dto.CreateEmployeeWithFaceRequest;
import com.company.appearance.dto.DeleteEmployeeResponse;
import com.company.appearance.dto.UpdateEmployeeRequest;
import com.company.appearance.dto.EmployeeResponse;
import com.company.appearance.dto.face.FaceRegisterResponse;
import com.company.appearance.dto.face.FaceDatabaseDeleteResponse;
import com.company.appearance.model.Employee;
import com.company.appearance.service.EmployeeService;
import com.company.appearance.service.face.FaceAngleService;
import com.company.appearance.service.face.FacePipelineService;
import com.company.appearance.util.face.FileValidationUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * EmployeeController provides REST endpoints for Employee operations.
 */
@RestController
@RequestMapping("/api/employees")
@Tag(name = "Manage Employees", description = "Employee management API")
public class EmployeeController {

    /**
     * Service dependency for employee operations.
     */
    private final EmployeeService service;
    private final FacePipelineService facePipelineService;
    private final FaceAngleService faceAngleService;
    private final FileValidationUtil fileValidationUtil;

    /**
     * Constructor for injecting Employee dependencies.
     * 
     * @param service the EmployeeService instance
     * @param facePipelineService the FacePipelineService instance
     * @param faceAngleService the FaceAngleService instance
     * @param fileValidationUtil the FileValidationUtil instance
     */
    public EmployeeController(EmployeeService service, 
                              FacePipelineService facePipelineService,
                              FaceAngleService faceAngleService,
                              FileValidationUtil fileValidationUtil) {
        this.service = service;
        this.facePipelineService = facePipelineService;
        this.faceAngleService = faceAngleService;
        this.fileValidationUtil = fileValidationUtil;
    }

    /**
     * Handles GET requests for employee operations.
     * 
     * @return a ResponseEntity containing the operation result
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EVALUATOR')")
    @Operation(summary = "Get all employees", description = "Retrieves a list of all employees in the system.")
    public List<EmployeeResponse> getAll() {
        return service.getAll()
                .stream()
                .map(e -> new EmployeeResponse(
                        e.getId(),
                        e.getName(),
                        e.getDepartment(),
                        e.getPosition()))
                .collect(Collectors.toList());
    }

    /**
     * Searches for employees by name.
     * Returns all employees whose name contains the search term (case-insensitive).
     * 
     * @param name the search term to match against employee names
     * @return a list of EmployeeResponse objects matching the search criteria
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EVALUATOR')")
    @Operation(summary = "Search employees by name", description = "Returns all employees whose name contains the search term (case-insensitive).")
    public List<EmployeeResponse> findByName(@RequestParam String name) {
        return service.findByName(name)
                .stream()
                .map(e -> new EmployeeResponse(
                        e.getId(),
                        e.getName(),
                        e.getDepartment(),
                        e.getPosition()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EVALUATOR')")
    @Operation(summary = "Get employee by ID", description = "Retrieves an employee by their unique identifier.")
    public List<EmployeeResponse> getById(@PathVariable String id) {
        return service.findById(id)
                .stream()
                .map(e -> new EmployeeResponse(
                        e.getId(),
                        e.getName(),
                        e.getDepartment(),
                        e.getPosition()))
                .collect(Collectors.toList());

    }

    /**
     * Handles POST requests for employee operations with face registration.
     * Creates a new employee and registers their face with 5 angles.
     * 
     * @param name Employee name
     * @param department Employee department
     * @param position Employee position
     * @param front Front view image
     * @param left Left profile image
     * @param right Right profile image
     * @param up Upward tilt image
     * @param down Downward tilt image
     * @param model Face recognition model (optional)
     * @param minQuality Minimum quality for qmagface model (optional)
     * @return a ResponseEntity containing the operation result
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create a new employee with face registration", 
               description = "Creates a new employee and registers their face with 5 angles (front, left, right, up, down). All 5 images are required.")
    public ResponseEntity<CreateEmployeeWithFaceRequest> create(
            @RequestParam @Parameter(description = "Employee name", required = true) String name,
            @RequestParam @Parameter(description = "Employee department", required = true) String department,
            @RequestParam @Parameter(description = "Employee position", required = true) String position,
            @RequestPart @Parameter(description = "Front view full-body image", required = true,
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                schema = @Schema(type = "string", format = "binary"))) MultipartFile front,
            @RequestPart @Parameter(description = "Left profile full-body image", required = true,
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                schema = @Schema(type = "string", format = "binary"))) MultipartFile left,
            @RequestPart @Parameter(description = "Right profile full-body image", required = true,
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                schema = @Schema(type = "string", format = "binary"))) MultipartFile right,
            @RequestPart @Parameter(description = "Upward tilt full-body image", required = true,
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                schema = @Schema(type = "string", format = "binary"))) MultipartFile up,
            @RequestPart @Parameter(description = "Downward tilt full-body image", required = true,
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                schema = @Schema(type = "string", format = "binary"))) MultipartFile down,
            @RequestParam(required = false) 
            @Parameter(
                description = "Face recognition model",
                schema = @Schema(
                    allowableValues = {"magface", "qmagface"},
                    defaultValue = "magface",
                    type = "string"
                )
            ) String model,
            @RequestParam(required = false) @Parameter(description = "Minimum quality (1-5, for qmagface only)") Integer minQuality) {

        // Validate required text parameters
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Employee name is required and cannot be empty");
        }
        if (department == null || department.trim().isEmpty()) {
            throw new IllegalArgumentException("Employee department is required and cannot be empty");
        }
        if (position == null || position.trim().isEmpty()) {
            throw new IllegalArgumentException("Employee position is required and cannot be empty");
        }

        // Validate that all required image files are provided and not empty
        if (front == null || front.isEmpty()) {
            throw new IllegalArgumentException("Front view image is required");
        }
        if (left == null || left.isEmpty()) {
            throw new IllegalArgumentException("Left profile image is required");
        }
        if (right == null || right.isEmpty()) {
            throw new IllegalArgumentException("Right profile image is required");
        }
        if (up == null || up.isEmpty()) {
            throw new IllegalArgumentException("Upward tilt image is required");
        }
        if (down == null || down.isEmpty()) {
            throw new IllegalArgumentException("Downward tilt image is required");
        }

        // Validate file uploads
        fileValidationUtil.validateImageFiles(
            new MultipartFile[]{front, left, right, up, down},
            new String[]{"front", "left", "right", "up", "down"}
        );

        // Validate all angles are provided
        faceAngleService.validateAllAngles(
            front != null && !front.isEmpty(),
            left != null && !left.isEmpty(),
            right != null && !right.isEmpty(),
            up != null && !up.isEmpty(),
            down != null && !down.isEmpty()
        );

        // CRITICAL: Validate that ALL 5 images contain detectable faces BEFORE creating employee
        // This prevents creating orphaned employee records if face registration fails
        facePipelineService.validateAllFacesDetectable(front, left, right, up, down);

        // Only create employee AFTER confirming all faces are detectable
        Employee employee = new Employee(
                null, // ID will be auto-generated
                name.trim(),
                department.trim(),
                position.trim());

        Employee saved = service.create(employee);

        // Register face with the generated employee ID
        // At this point we know all faces are detectable, so registration should succeed
        FaceRegisterResponse faceResponse = facePipelineService.registerPerson(
            saved.getId(), front, left, right, up, down, model, minQuality);

        // Build response
        CreateEmployeeWithFaceRequest response = new CreateEmployeeWithFaceRequest(
                saved.getId(),
                saved.getName(),
                saved.getDepartment(),
                saved.getPosition(),
                faceResponse);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete an employee", 
               description = "Deletes an employee by their unique identifier and removes them from the face database.")
    public ResponseEntity<DeleteEmployeeResponse> delete(@PathVariable String id) {
        // Try to delete from face database first (using employee ID as person name)
        FaceDatabaseDeleteResponse faceDbResult;
        try {
            faceDbResult = facePipelineService.deletePerson(id, null);
        } catch (Exception e) {
            // If person not found in facial database, continue with employee deletion
            // This handles the case where employee exists but face data doesn't
            faceDbResult = new FaceDatabaseDeleteResponse(
                false,
                "Person not found in facial database: " + e.getMessage()
            );
        }
        
        // Delete employee from database (always execute regardless of face deletion result)
        service.delete(id);
        
        // Build response
        DeleteEmployeeResponse response = new DeleteEmployeeResponse(
            "Employee deleted successfully",
            faceDbResult
        );
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update an employee", description = "Updates an existing employee with the provided details.")
    public EmployeeResponse update(@PathVariable String id, @RequestBody UpdateEmployeeRequest request) {
        Employee employee = new Employee();
        employee.setName(request.getName());
        employee.setDepartment(request.getDepartment());
        employee.setPosition(request.getPosition());
        
        Employee updatedEmployee = service.update(id, employee);
        if (updatedEmployee == null) {
            return null;
        }
        
        return new EmployeeResponse(
                updatedEmployee.getId(),
                updatedEmployee.getName(),
                updatedEmployee.getDepartment(),
                updatedEmployee.getPosition());
    }

}