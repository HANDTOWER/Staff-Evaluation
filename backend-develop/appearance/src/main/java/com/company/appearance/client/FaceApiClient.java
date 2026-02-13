package com.company.appearance.client;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.company.appearance.config.face.FaceApiProperties;
import com.company.appearance.dto.face.ExternalFaceApiRegisterResponse;
import com.company.appearance.dto.face.FaceDatabaseSaveResponse;
import com.company.appearance.dto.face.FaceDatabaseDeleteResponse;
import com.company.appearance.exception.face.FaceApiException;
import com.company.appearance.util.face.MultipartUtil;

/**
 * Client for communicating with the external Face API service.
 * Uses Spring's RestClient for synchronous HTTP operations.
 */
@Component
public class FaceApiClient {

    private static final Logger logger = LoggerFactory.getLogger(FaceApiClient.class);

    private final RestClient restClient;
    private final MultipartUtil multipartUtil;

    public FaceApiClient(FaceApiProperties properties, MultipartUtil multipartUtil) {
        this.multipartUtil = multipartUtil;
        this.restClient = RestClient.builder()
            .baseUrl(properties.getBaseUrl())
            .build();
        
        logger.info("Initialized Face API client with base URL: {}", properties.getBaseUrl());
    }

    /**
     * Registers a person with multiple face images.
     * POST /register with multipart form data.
     *
     * @param name Person name
     * @param croppedFaceImages List of cropped face images (5 angles)
     * @param model Model type (already normalized: magface or qmagface)
     * @param minQuality Minimum quality (for qmagface)
     * @return Response from Face API
     */
    public ExternalFaceApiRegisterResponse registerFaces(String name, List<byte[]> croppedFaceImages, 
                                              String model, Integer minQuality) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Add all face images as files[]
            for (int i = 0; i < croppedFaceImages.size(); i++) {
                byte[] imageBytes = croppedFaceImages.get(i);
                String filename = "face_" + i + ".jpg";
                HttpEntity<Resource> fileEntity = multipartUtil.createFileEntity(imageBytes, filename);
                body.add("files", fileEntity);
            }

            // Add name as form field
            body.add("name", name);

            // Build URI safely with UriComponentsBuilder
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromPath("/register")
                .queryParam("model", model);
            
            // Only add min_quality for qmagface model
            if ("qmagface".equals(model) && minQuality != null) {
                uriBuilder.queryParam("min_quality", minQuality);
            }
            
            String uri = uriBuilder.build().toUriString();

            logger.info("Registering faces for person '{}' with model '{}' and min_quality '{}'", 
                name, model, minQuality != null ? minQuality : "default");

            ResponseEntity<ExternalFaceApiRegisterResponse> response = restClient.post()
                .uri(uri)
                .body(body)
                .retrieve()
                .toEntity(ExternalFaceApiRegisterResponse.class);

            return response.getBody();

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new FaceApiException(
                "Face API registration failed: " + e.getStatusCode() + " - " + e.getMessage(),
                e.getStatusCode().value(),
                e.getResponseBodyAsString()
            );
        } catch (RestClientException e) {
            throw new FaceApiException(
                "Failed to communicate with Face API: " + e.getMessage(), e);
        }
    }

    /**
     * Recognizes a face in an image.
     * POST /recognize with multipart form data.
     *
     * @param croppedFaceImage Cropped face image bytes
     * @param model Model type (already normalized)
     * @param threshold Recognition threshold
     * @return Response map from Face API
     */
    public Map<String, Object> recognizeFace(byte[] croppedFaceImage, String model, Double threshold) {
        try {
            HttpEntity<Resource> fileEntity = multipartUtil.createFileEntity(croppedFaceImage, "face.jpg");
            MultiValueMap<String, Object> body = multipartUtil.createMultipartBody("file", fileEntity);

            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromPath("/recognize")
                .queryParam("model", model)
                .queryParam("threshold", threshold);
            
            String uri = uriBuilder.build().toUriString();

            logger.info("Recognizing face with model '{}' and threshold {}", model, threshold);

            ResponseEntity<Map<String, Object>> response = restClient.post()
                .uri(uri)
                .body(body)
                .retrieve()
                .toEntity(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

            return response.getBody();

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new FaceApiException(
                "Face API recognition failed: " + e.getStatusCode() + " - " + e.getMessage(),
                e.getStatusCode().value(),
                e.getResponseBodyAsString()
            );
        } catch (RestClientException e) {
            throw new FaceApiException(
                "Failed to communicate with Face API: " + e.getMessage(), e);
        }
    }

    /**
     * Gets database information.
     * GET /database/info
     *
     * @param model Model type (already normalized)
     * @return Response map from Face API
     */
    public Map<String, Object> getDatabaseInfo(String model) {
        try {
            String uri = UriComponentsBuilder.fromPath("/database/info")
                .queryParam("model", model)
                .build()
                .toUriString();

            logger.info("Getting database info for model '{}'", model);

            ResponseEntity<Map<String, Object>> response = restClient.get()
                .uri(uri)
                .retrieve()
                .toEntity(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

            return response.getBody();

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new FaceApiException(
                "Face API database info failed: " + e.getStatusCode() + " - " + e.getMessage(),
                e.getStatusCode().value(),
                e.getResponseBodyAsString()
            );
        } catch (RestClientException e) {
            throw new FaceApiException(
                "Failed to communicate with Face API: " + e.getMessage(), e);
        }
    }

    /**
     * Saves the face database.
     * POST /database/save
     *
     * @param path Optional custom save path
     * @return Response from Face API with success status and message
     */
    public FaceDatabaseSaveResponse saveFaceDatabase(String path) {
        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromPath("/database/save");
            
            if (path != null && !path.isEmpty()) {
                uriBuilder.queryParam("path", path);
            }
            
            String uri = uriBuilder.build().toUriString();

            logger.info("Saving face database" + (path != null ? " to path: " + path : ""));

            ResponseEntity<FaceDatabaseSaveResponse> response = restClient.post()
                .uri(uri)
                .retrieve()
                .toEntity(FaceDatabaseSaveResponse.class);

            return response.getBody();

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new FaceApiException(
                "Face API database save failed: " + e.getStatusCode() + " - " + e.getMessage(),
                e.getStatusCode().value(),
                e.getResponseBodyAsString()
            );
        } catch (RestClientException e) {
            throw new FaceApiException(
                "Failed to communicate with Face API: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a person from the face database.
     * DELETE /database/{name}
     *
     * @param name Person name to remove
     * @param model Model type (already normalized)
     * @return Response from Face API with success status and message
     */
    public FaceDatabaseDeleteResponse deletePerson(String name, String model) {
        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromPath("/database/{name}")
                .queryParam("model", model);
            
            String uri = uriBuilder.buildAndExpand(name).toUriString();

            logger.info("Deleting person '{}' from {} database", name, model);

            ResponseEntity<FaceDatabaseDeleteResponse> response = restClient.delete()
                .uri(uri)
                .retrieve()
                .toEntity(FaceDatabaseDeleteResponse.class);

            return response.getBody();

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 404) {
                // Parse error message from response body
                String errorBody = e.getResponseBodyAsString();
                String message = "Person '" + name + "' not found in database";
                
                // Try to extract message from JSON response
                if (errorBody.contains("detail")) {
                    try {
                        int startIdx = errorBody.indexOf("detail\": \"") + 10;
                        int endIdx = errorBody.indexOf("\"", startIdx);
                        if (startIdx > 0 && endIdx > startIdx) {
                            message = errorBody.substring(startIdx, endIdx);
                        }
                    } catch (Exception ex) {
                        logger.warn("Failed to parse error message from response", ex);
                    }
                }
                
                // Return unsuccessful response instead of throwing exception
                logger.warn("Person '{}' not found in facial database: {}", name, message);
                return new FaceDatabaseDeleteResponse(false, message);
            }
            throw new FaceApiException(
                "Face API delete person failed: " + e.getStatusCode() + " - " + e.getMessage(),
                e.getStatusCode().value(),
                e.getResponseBodyAsString()
            );
        } catch (HttpServerErrorException e) {
            throw new FaceApiException(
                "Face API delete person failed: " + e.getStatusCode() + " - " + e.getMessage(),
                e.getStatusCode().value(),
                e.getResponseBodyAsString()
            );
        } catch (RestClientException e) {
            throw new FaceApiException(
                "Failed to communicate with Face API: " + e.getMessage(), e);
        }
    }
}
