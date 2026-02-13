package com.company.appearance.dto.face;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Response DTO from external Face API (http://192.168.2.242:8000/face/register).
 */
public class ExternalFaceApiRegisterResponse {
    private boolean success;
    private String name;
    
    @JsonProperty("model_used")
    private String modelUsed;
    
    private String message;
    
    @JsonProperty("total_registered")
    private int totalRegistered;
    
    @JsonProperty("failed_count")
    private int failedCount;
    
    private List<Double> qualities;

    public ExternalFaceApiRegisterResponse() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTotalRegistered() {
        return totalRegistered;
    }

    public void setTotalRegistered(int totalRegistered) {
        this.totalRegistered = totalRegistered;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(int failedCount) {
        this.failedCount = failedCount;
    }

    public List<Double> getQualities() {
        return qualities;
    }

    public void setQualities(List<Double> qualities) {
        this.qualities = qualities;
    }
}
