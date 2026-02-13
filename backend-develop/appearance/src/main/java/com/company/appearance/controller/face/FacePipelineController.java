package com.company.appearance.controller.face;

import com.company.appearance.dto.face.FaceDetectResponse;
import com.company.appearance.dto.face.FaceRecognizeResponse;
import com.company.appearance.dto.face.FaceRegisterResponse;
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

/**
 * REST controller for face pipeline operations (user-facing endpoints).
 * Handles face registration and recognition with 5-angle support.
 */
@RestController
@RequestMapping("/api/face")
@Tag(name = "Face Recognition", description = "Face detection, registration, and recognition endpoints")
public class FacePipelineController {

    private final FacePipelineService pipelineService;
    private final FaceAngleService angleService;
    private final FileValidationUtil fileValidationUtil;

    public FacePipelineController(FacePipelineService pipelineService, 
                                   FaceAngleService angleService,
                                   FileValidationUtil fileValidationUtil) {
        this.pipelineService = pipelineService;
        this.angleService = angleService;
        this.fileValidationUtil = fileValidationUtil;
    }

    /**
     * Registers a person with 5 face angles.
     * Detects and crops faces from all 5 images, then registers them.
     *
     * @param name Person name
     * @param front Front view image
     * @param left Left profile image
     * @param right Right profile image
     * @param up Upward tilt image
     * @param down Downward tilt image
     * @param model Recognition model (optional)
     * @param minQuality Minimum quality for qmagface model (optional)
     * @return Registration response
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EVALUATOR')")
    @Operation(
        summary = "Register a person with 5 face angles",
        description = "Detects and crops faces from 5 full-body images, then registers them with the Face API. All 5 angles (front, left, right, up, down) are required."
    )
    public ResponseEntity<FaceRegisterResponse> registerPerson(
            @RequestParam @Parameter(description = "Person name", required = true) String name,
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

        // Validate file uploads
        fileValidationUtil.validateImageFiles(
            new MultipartFile[]{front, left, right, up, down},
            new String[]{"front", "left", "right", "up", "down"}
        );

        // Validate all angles are provided
        angleService.validateAllAngles(
            front != null && !front.isEmpty(),
            left != null && !left.isEmpty(),
            right != null && !right.isEmpty(),
            up != null && !up.isEmpty(),
            down != null && !down.isEmpty()
        );

        FaceRegisterResponse response = pipelineService.registerPerson(
            name, front, left, right, up, down, model, minQuality);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Recognizes a person from a full-body image.
     *
     * @param file Full-body image file
     * @param model Recognition model (optional)
     * @param threshold Recognition threshold (optional)
     * @return Recognition response
     */
    @PostMapping(value = "/recognize", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EVALUATOR')")
    @Operation(
        summary = "Recognize a person from image",
        description = "Detects and crops face from full-body image, then recognizes the person using Face API"
    )
    public ResponseEntity<FaceRecognizeResponse> recognizePerson(
            @RequestPart @Parameter(description = "Full-body image file", required = true,
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                schema = @Schema(type = "string", format = "binary"))) MultipartFile file,
            @RequestParam(required = false) 
            @Parameter(
                description = "Face recognition model",
                schema = @Schema(
                    allowableValues = {"magface", "qmagface"},
                    defaultValue = "magface",
                    type = "string"
                )
            ) String model,
            @RequestParam(required = false) @Parameter(description = "Recognition threshold") Double threshold) {

        // Validate file upload
        fileValidationUtil.validateImageFile(file, "file");

        FaceRecognizeResponse response = pipelineService.recognizePerson(file, model, threshold);

        return ResponseEntity.ok(response);
    }

    /**
     * Debug endpoint: detects face and returns bounding box (optionally with cropped image).
     *
     * @param file Image file
     * @param includeCrop Whether to include Base64-encoded cropped image and save to disk
     * @return Detection response
     */
    @PostMapping(value = "/detect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EVALUATOR')")
    @Operation(
        summary = "Detect face in image (debug)",
        description = "Detects face and returns bounding box. When includeCrop=true, returns cropped face as Base64 and saves it to disk in appearance/src/main/java/com/company/appearance/images/"
    )
    public ResponseEntity<FaceDetectResponse> detectFace(
            @RequestPart @Parameter(description = "Image file", required = true,
                content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                schema = @Schema(type = "string", format = "binary"))) MultipartFile file,
            @RequestParam(required = false, defaultValue = "false") 
            @Parameter(description = "Include Base64-encoded cropped image and save to disk") boolean includeCrop) {

        // Validate file upload
        fileValidationUtil.validateImageFile(file, "file");

        FaceDetectResponse response = pipelineService.detectFace(file, includeCrop);

        return ResponseEntity.ok(response);
    }
}
