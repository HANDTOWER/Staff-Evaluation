package com.company.appearance.dto.face;

import java.util.Map;

/**
 * Response DTO for database info endpoint.
 */
public class FaceDatabaseInfoResponse {
    private Integer totalPersons;
    private Integer totalFaces;
    private String model;
    private Map<String, Object> details;

    public FaceDatabaseInfoResponse() {
    }

    public FaceDatabaseInfoResponse(Integer totalPersons, Integer totalFaces, 
                                     String model, Map<String, Object> details) {
        this.totalPersons = totalPersons;
        this.totalFaces = totalFaces;
        this.model = model;
        this.details = details;
    }

    public Integer getTotalPersons() {
        return totalPersons;
    }

    public void setTotalPersons(Integer totalPersons) {
        this.totalPersons = totalPersons;
    }

    public Integer getTotalFaces() {
        return totalFaces;
    }

    public void setTotalFaces(Integer totalFaces) {
        this.totalFaces = totalFaces;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}
