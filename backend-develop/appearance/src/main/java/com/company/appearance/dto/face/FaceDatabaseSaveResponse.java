package com.company.appearance.dto.face;

/**
 * Response DTO for database save endpoint.
 * Matches external Face API response format.
 */
public class FaceDatabaseSaveResponse {
    private boolean success;
    private String message;

    public FaceDatabaseSaveResponse() {
    }

    public FaceDatabaseSaveResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
