package com.company.appearance.service.face;

import com.company.appearance.client.FaceApiClient;
import com.company.appearance.config.face.FaceApiProperties;
import com.company.appearance.dto.face.FaceDatabaseInfoResponse;
import com.company.appearance.dto.face.FaceDatabaseSaveResponse;
import com.company.appearance.dto.face.FaceDatabaseDeleteResponse;
import com.company.appearance.model.face.FaceModel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service for face database operations.
 */
@Service
public class FaceDatabaseService {

    private static final Logger logger = LoggerFactory.getLogger(FaceDatabaseService.class);

    private final FaceApiClient apiClient;
    private final FaceApiProperties apiProperties;

    public FaceDatabaseService(FaceApiClient apiClient, FaceApiProperties apiProperties) {
        this.apiClient = apiClient;
        this.apiProperties = apiProperties;
    }

    /**
     * Gets database information.
     *
     * @param model Model type (will be normalized and validated)
     * @return Database info response
     */
    public FaceDatabaseInfoResponse getDatabaseInfo(String model) {
        // Normalize and validate model parameter
        String normalizedModel = FaceModel.normalizeAndValidate(model, apiProperties.getDefaultModel());

        logger.info("Getting database info for model '{}'", normalizedModel);

        Map<String, Object> apiResponse = apiClient.getDatabaseInfo(normalizedModel);

        // Map response
        FaceDatabaseInfoResponse response = new FaceDatabaseInfoResponse();
        response.setModel(normalizedModel);
        
        if (apiResponse.containsKey("total_persons")) {
            Object totalPersons = apiResponse.get("total_persons");
            if (totalPersons instanceof Number) {
                response.setTotalPersons(((Number) totalPersons).intValue());
            }
        }
        if (apiResponse.containsKey("total_faces")) {
            Object totalFaces = apiResponse.get("total_faces");
            if (totalFaces instanceof Number) {
                response.setTotalFaces(((Number) totalFaces).intValue());
            }
        }
        response.setDetails(apiResponse);

        logger.info("Database info: {} persons, {} faces", 
            response.getTotalPersons(), response.getTotalFaces());

        return response;
    }

    /**
     * Saves the face database.
     *
     * @param path Optional custom save path
     * @return Save result response
     */
    public FaceDatabaseSaveResponse saveDatabase(String path) {
        logger.info("Saving face database" + (path != null ? " to: " + path : ""));
        
        FaceDatabaseSaveResponse result = apiClient.saveFaceDatabase(path);
        
        logger.info("Database save result - success: {}, message: {}", result.isSuccess(), result.getMessage());
        
        return result;
    }

    /**
     * Deletes a person from the face database.
     *
     * @param name Person name to remove
     * @param model Model type (will be normalized and validated)
     * @return Delete result response
     */
    public FaceDatabaseDeleteResponse deletePerson(String name, String model) {
        // Normalize and validate model parameter
        String normalizedModel = FaceModel.normalizeAndValidate(model, apiProperties.getDefaultModel());
        
        logger.info("Deleting person '{}' from {} database", name, normalizedModel);
        
        FaceDatabaseDeleteResponse result = apiClient.deletePerson(name, normalizedModel);
        
        logger.info("Delete result - success: {}, message: {}", result.isSuccess(), result.getMessage());
        
        return result;
    }
}
