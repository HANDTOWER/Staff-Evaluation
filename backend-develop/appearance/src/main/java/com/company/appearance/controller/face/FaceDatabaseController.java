package com.company.appearance.controller.face;

import com.company.appearance.dto.face.FaceDatabaseInfoResponse;
import com.company.appearance.dto.face.FaceDatabaseSaveResponse;
import com.company.appearance.service.face.FacePipelineService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for face database administration endpoints.
 */
@RestController
@RequestMapping("/api/face")
@Tag(name = "Face Database", description = "Face database information and management endpoints")
public class FaceDatabaseController {

    private final FacePipelineService pipelineService;

    public FaceDatabaseController(FacePipelineService pipelineService) {
        this.pipelineService = pipelineService;
    }

    /**
     * Gets face database information.
     *
     * @param model Model type (optional, default: magface)
     * @return Database info
     */
    @GetMapping("/database/info")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EVALUATOR')")
    @Operation(
        summary = "Get face database information",
        description = "Retrieves information about the face database including total persons and faces"
    )
    public ResponseEntity<FaceDatabaseInfoResponse> getDatabaseInfo(
            @RequestParam(required = false) 
            @Parameter(
                description = "Face recognition model",
                schema = @Schema(
                    allowableValues = {"magface", "qmagface"},
                    defaultValue = "magface",
                    type = "string"
                )
            ) String model) {

        FaceDatabaseInfoResponse response = pipelineService.getDatabaseInfo(model);

        return ResponseEntity.ok(response);
    }

    /**
     * Saves the face database.
     *
     * @param path Optional custom save path
     * @return Save result with success status and message
     */
    @PostMapping("/database/save")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EVALUATOR')")
    @Operation(
        summary = "Save face database",
        description = "Saves the current face database to disk. Note: Both MagFace and QMagFace share the same database."
    )
    public ResponseEntity<FaceDatabaseSaveResponse> saveDatabase(
            @RequestParam(required = false) @Parameter(description = "Custom save path (optional)") String path) {

        FaceDatabaseSaveResponse result = pipelineService.saveDatabase(path);

        return ResponseEntity.ok(result);
    }
}
