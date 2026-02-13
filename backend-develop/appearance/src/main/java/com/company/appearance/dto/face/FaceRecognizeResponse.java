package com.company.appearance.dto.face;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for face recognition endpoint.
 */
public class FaceRecognizeResponse {
    private String recognizedName;
    private Double confidence;
    private List<Map<String, Object>> matches;
    private Map<String, Object> details;

    public FaceRecognizeResponse() {
    }

    public FaceRecognizeResponse(String recognizedName, Double confidence, 
                                  List<Map<String, Object>> matches, 
                                  Map<String, Object> details) {
        this.recognizedName = recognizedName;
        this.confidence = confidence;
        this.matches = matches;
        this.details = details;
    }

    public String getRecognizedName() {
        return recognizedName;
    }

    public void setRecognizedName(String recognizedName) {
        this.recognizedName = recognizedName;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public List<Map<String, Object>> getMatches() {
        return matches;
    }

    public void setMatches(List<Map<String, Object>> matches) {
        this.matches = matches;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}
