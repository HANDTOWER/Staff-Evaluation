package com.company.appearance.service.face;

import com.company.appearance.dto.face.*;
import com.company.appearance.model.face.FaceBox;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

/**
 * Pipeline service that orchestrates face operations.
 * This service coordinates detection, cropping, and API calls.
 */
@Service
public class FacePipelineService {

    private static final Logger logger = LoggerFactory.getLogger(FacePipelineService.class);

    private final FaceDetectionService detectionService;
    private final FaceCropService cropService;
    private final FaceRegistrationService registrationService;
    private final FaceRecognitionService recognitionService;
    private final FaceDatabaseService databaseService;

    public FacePipelineService(FaceDetectionService detectionService,
                                FaceCropService cropService,
                                FaceRegistrationService registrationService,
                                FaceRecognitionService recognitionService,
                                FaceDatabaseService databaseService) {
        this.detectionService = detectionService;
        this.cropService = cropService;
        this.registrationService = registrationService;
        this.recognitionService = recognitionService;
        this.databaseService = databaseService;
    }

    /**
     * Debug endpoint: detects face and optionally returns cropped image.
     *
     * @param image Image file
     * @param includeCrop Whether to include Base64-encoded cropped image
     * @return Detection response
     */
    public FaceDetectResponse detectFace(MultipartFile image, boolean includeCrop) {
        logger.info("Detecting face in image: {}", image.getOriginalFilename());

        FaceBox faceBox = detectionService.detectBestFace(image);
        
        FaceBoxDto boxDto = new FaceBoxDto(
            faceBox.getX(),
            faceBox.getY(),
            faceBox.getWidth(),
            faceBox.getHeight(),
            faceBox.getConfidence()
        );

        FaceDetectResponse response = new FaceDetectResponse();
        response.setBoundingBox(boxDto);

        if (includeCrop) {
            byte[] croppedImage = cropService.cropFace(image, faceBox);
            String base64Crop = Base64.getEncoder().encodeToString(croppedImage);
            response.setCroppedImageBase64(base64Crop);
            
            // Save cropped image to disk
            String savedPath = saveCroppedImageToDisk(croppedImage, image.getOriginalFilename());
            response.setCroppedImageSavedPath(savedPath);
        }

        logger.info("Face detected: {}", faceBox);

        return response;
    }

    /**
     * Saves cropped face image to disk in the images directory.
     * Creates the directory if it doesn't exist.
     *
     * @param croppedImageBytes Cropped image as JPEG bytes
     * @param originalFilename Original filename for reference
     * @return Saved file path (relative to user.dir) or null if save failed
     */
    private String saveCroppedImageToDisk(byte[] croppedImageBytes, String originalFilename) {
        try {
            // Create output directory if it doesn't exist
            Path outputDir = Paths.get(System.getProperty("user.dir"),
                "appearance", "src", "main", "java", "com", "company", "appearance", "images");
            Files.createDirectories(outputDir);
            
            // Generate unique filename
            String sanitizedBaseName = sanitizeFilename(originalFilename);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uuid = UUID.randomUUID().toString().substring(0, 8);
            String filename = String.format("detect_crop_%s_%s_%s.jpg", sanitizedBaseName, timestamp, uuid);
            
            // Save file
            Path outputPath = outputDir.resolve(filename);
            Files.write(outputPath, croppedImageBytes);
            
            // Return relative path from user.dir
            String relativePath = Paths.get(System.getProperty("user.dir")).relativize(outputPath).toString();
            logger.info("Cropped image saved to: {}", relativePath);
            
            return relativePath;
        } catch (IOException e) {
            logger.warn("Failed to save cropped image to disk: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Sanitizes filename to remove unsafe characters.
     *
     * @param filename Original filename
     * @return Sanitized filename (base name without extension)
     */
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "unknown";
        }
        
        // Remove extension
        int dotIndex = filename.lastIndexOf('.');
        String baseName = dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
        
        // Replace unsafe characters with underscore
        baseName = baseName.replaceAll("[^a-zA-Z0-9_-]", "_");
        
        // Limit length
        if (baseName.length() > 50) {
            baseName = baseName.substring(0, 50);
        }
        
        return baseName.isEmpty() ? "unknown" : baseName;
    }

    /**
     * Validates that all 5 images contain detectable faces.
     * This method should be called BEFORE creating an employee to ensure data consistency.
     * Throws IllegalArgumentException if any image does not contain a face.
     *
     * @param front Front view image
     * @param left Left profile image
     * @param right Right profile image
     * @param up Upward tilt image
     * @param down Downward tilt image
     * @throws IllegalArgumentException if any image does not contain a detectable face
     */
    public void validateAllFacesDetectable(MultipartFile front,
                                           MultipartFile left,
                                           MultipartFile right,
                                           MultipartFile up,
                                           MultipartFile down) {
        logger.info("Validating face detection in all 5 images before employee creation");
        
        try {
            detectBestFaceWithContext(front, "front");
            detectBestFaceWithContext(left, "left");
            detectBestFaceWithContext(right, "right");
            detectBestFaceWithContext(up, "up");
            detectBestFaceWithContext(down, "down");
        } catch (IllegalArgumentException e) {
            // Re-throw with clearer context
            throw new IllegalArgumentException(
                "Face validation failed: " + e.getMessage() + 
                ". All 5 images must contain clearly visible faces before creating employee.", e);
        }
        
        logger.info("All 5 images passed face detection validation");
    }

    /**
     * Helper method to detect face with angle context for better error messages.
     */
    private void detectBestFaceWithContext(MultipartFile image, String angleName) {
        try {
            detectionService.detectBestFace(image);
            logger.debug("Face detected successfully in {} angle", angleName);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                "No face detected in " + angleName + " angle image", e);
        }
    }

    /**
     * Registers a person with 5 face angles.
     */
    public FaceRegisterResponse registerPerson(String name,
                                                 MultipartFile front,
                                                 MultipartFile left,
                                                 MultipartFile right,
                                                 MultipartFile up,
                                                 MultipartFile down,
                                                 String model,
                                                 Integer minQuality) {
        return registrationService.registerPerson(name, front, left, right, up, down, model, minQuality);
    }

    /**
     * Recognizes a person from an image.
     */
    public FaceRecognizeResponse recognizePerson(MultipartFile image, String model, Double threshold) {
        return recognitionService.recognizePerson(image, model, threshold);
    }

    /**
     * Gets database information.
     */
    public FaceDatabaseInfoResponse getDatabaseInfo(String model) {
        return databaseService.getDatabaseInfo(model);
    }

    /**
     * Saves the database.
     */
    public FaceDatabaseSaveResponse saveDatabase(String path) {
        return databaseService.saveDatabase(path);
    }

    /**
     * Deletes a person from the database.
     */
    public FaceDatabaseDeleteResponse deletePerson(String name, String model) {
        return databaseService.deletePerson(name, model);
    }
}
