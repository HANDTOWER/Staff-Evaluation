package com.company.appearance.service.face;

import com.company.appearance.client.FaceApiClient;
import com.company.appearance.config.face.FaceApiProperties;
import com.company.appearance.dto.face.FaceRecognizeResponse;
import com.company.appearance.model.face.FaceBox;
import com.company.appearance.model.face.FaceModel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Service for face recognition operations.
 */
@Service
public class FaceRecognitionService {

    private static final Logger logger = LoggerFactory.getLogger(FaceRecognitionService.class);

    private final FaceDetectionService detectionService;
    private final FaceCropService cropService;
    private final FaceApiClient apiClient;
    private final FaceApiProperties apiProperties;

    public FaceRecognitionService(FaceDetectionService detectionService,
                                   FaceCropService cropService,
                                   FaceApiClient apiClient,
                                   FaceApiProperties apiProperties) {
        this.detectionService = detectionService;
        this.cropService = cropService;
        this.apiClient = apiClient;
        this.apiProperties = apiProperties;
    }

    /**
     * Recognizes a person from a full-body image.
     *
     * @param image Full-body image
     * @param model Model type (will be normalized and validated)
     * @param threshold Recognition threshold (optional)
     * @return Recognition response
     */
    @SuppressWarnings("unchecked")
    public FaceRecognizeResponse recognizePerson(MultipartFile image, String model, Double threshold) {
        // Normalize and validate model parameter
        String normalizedModel = FaceModel.normalizeAndValidate(model, apiProperties.getDefaultModel());
        
        // Use default threshold if not provided
        if (threshold == null) {
            threshold = apiProperties.getDefaultThreshold();
        }

        logger.info("Recognizing person with model '{}', threshold {}", normalizedModel, threshold);

        // Detect and crop face
        FaceBox faceBox = detectionService.detectBestFace(image);
        byte[] croppedFace = cropService.cropFace(image, faceBox);

        // Call Face API for recognition (with normalized model)
        Map<String, Object> apiResponse = apiClient.recognizeFace(croppedFace, normalizedModel, threshold);

        // Map response
        FaceRecognizeResponse response = new FaceRecognizeResponse();
        
        // Extract fields from API response
        if (apiResponse.containsKey("name")) {
            response.setRecognizedName((String) apiResponse.get("name"));
        }
        if (apiResponse.containsKey("confidence")) {
            Object conf = apiResponse.get("confidence");
            if (conf instanceof Number) {
                response.setConfidence(((Number) conf).doubleValue());
            }
        }
        if (apiResponse.containsKey("matches")) {
            response.setMatches((List<Map<String, Object>>) apiResponse.get("matches"));
        }
        response.setDetails(apiResponse);

        logger.info("Recognition result: {} (confidence: {})", 
            response.getRecognizedName(), response.getConfidence());

        return response;
    }
}
