package com.company.appearance.dto.face;

/**
 * Response DTO for database delete person endpoint.
 * Matches external Face API response format.
 */
public class FaceDatabaseDeleteResponse {
    private boolean success;
    private String message;

    public FaceDatabaseDeleteResponse() {
    }

    public FaceDatabaseDeleteResponse(boolean success, String message) {
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
