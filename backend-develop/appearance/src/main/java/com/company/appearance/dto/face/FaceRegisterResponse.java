package com.company.appearance.dto.face;

import java.util.List;

/**
 * Response DTO for face registration endpoint.
 */
public class FaceRegisterResponse {
    private boolean success;
    private String name;
    private String modelUsed;
    private String message;
    private int totalRegistered;
    private int failedCount;
    private List<Double> qualities;

    public FaceRegisterResponse() {
    }

    public FaceRegisterResponse(boolean success, String name, String modelUsed, String message, 
                                int totalRegistered, int failedCount, List<Double> qualities) {
        this.success = success;
        this.name = name;
        this.modelUsed = modelUsed;
        this.message = message;
        this.totalRegistered = totalRegistered;
        this.failedCount = failedCount;
        this.qualities = qualities;
    }

    /**
     * Creates FaceRegisterResponse from ExternalFaceApiRegisterResponse.
     */
    public static FaceRegisterResponse fromExternal(ExternalFaceApiRegisterResponse external) {
        return new FaceRegisterResponse(
            external.isSuccess(),
            external.getName(),
            external.getModelUsed(),
            external.getMessage(),
            external.getTotalRegistered(),
            external.getFailedCount(),
            external.getQualities()
        );
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
