package com.company.appearance.service.face;

import com.company.appearance.client.FaceApiClient;
import com.company.appearance.config.face.FaceApiProperties;
import com.company.appearance.dto.face.ExternalFaceApiRegisterResponse;
import com.company.appearance.dto.face.FaceRegisterResponse;
import com.company.appearance.model.face.FaceBox;
import com.company.appearance.model.face.FaceModel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for face registration operations.
 */
@Service
public class FaceRegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(FaceRegistrationService.class);

    private final FaceDetectionService detectionService;
    private final FaceCropService cropService;
    private final FaceApiClient apiClient;
    private final FaceApiProperties apiProperties;

    public FaceRegistrationService(FaceDetectionService detectionService,
                                   FaceCropService cropService,
                                   FaceApiClient apiClient,
                                   FaceApiProperties apiProperties) {
        this.detectionService = detectionService;
        this.cropService = cropService;
        this.apiClient = apiClient;
        this.apiProperties = apiProperties;
    }    /**
     * Registers a person with 5 face angles.
     *
     * @param name Person name
     * @param frontImage Front view image
     * @param leftImage Left profile image
     * @param rightImage Right profile image
     * @param upImage Upward tilt image
     * @param downImage Downward tilt image
     * @param model Model type (will be normalized and validated)
     * @param minQuality Minimum quality (optional)
     * @return Registration response
     */
    public FaceRegisterResponse registerPerson(String name,
                                                 MultipartFile frontImage,
                                                 MultipartFile leftImage,
                                                 MultipartFile rightImage,
                                                 MultipartFile upImage,
                                                 MultipartFile downImage,
                                                 String model,
                                                 Integer minQuality) {
        // Normalize and validate model parameter
        String normalizedModel = FaceModel.normalizeAndValidate(model, apiProperties.getDefaultModel());
        
        // Use default minQuality if not provided
        if (minQuality == null) {
            minQuality = apiProperties.getDefaultMinQuality();
        }

        logger.info("Registering person '{}' with model '{}', minQuality {}", name, normalizedModel, minQuality);

        // Detect and crop all 5 angles
        List<byte[]> croppedFaces = new ArrayList<>();
        
        try {
            croppedFaces.add(detectAndCropFace(frontImage, "front"));
            croppedFaces.add(detectAndCropFace(leftImage, "left"));
            croppedFaces.add(detectAndCropFace(rightImage, "right"));
            croppedFaces.add(detectAndCropFace(upImage, "up"));
            croppedFaces.add(detectAndCropFace(downImage, "down"));
        } catch (IllegalArgumentException e) {
            // Re-throw with clearer context
            throw new IllegalArgumentException(
                "Face registration failed: " + e.getMessage() + 
                ". All 5 images must contain clearly visible faces.", e);
        }

        // Call Face API to register (with normalized model)
        ExternalFaceApiRegisterResponse apiResponse = apiClient.registerFaces(name, croppedFaces, normalizedModel, minQuality);

        // Map response
        FaceRegisterResponse response = FaceRegisterResponse.fromExternal(apiResponse);

        logger.info("Successfully registered person '{}' with {} face images", name, croppedFaces.size());

        return response;
    }

    /**
     * Detects and crops a face from an image.
     */
    private byte[] detectAndCropFace(MultipartFile image, String angleName) {
        logger.debug("Processing {} angle image", angleName);
        FaceBox faceBox = detectionService.detectBestFace(image);
        return cropService.cropFace(image, faceBox);
    }
}
