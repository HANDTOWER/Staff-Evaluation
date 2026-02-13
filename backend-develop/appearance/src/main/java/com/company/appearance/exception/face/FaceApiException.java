package com.company.appearance.exception.face;

/**
 * Exception thrown when the external Face API returns an error.
 */
public class FaceApiException extends RuntimeException {
    private final int statusCode;
    private final String responseBody;

    public FaceApiException(String message, int statusCode, String responseBody) {
        super(message);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }

    public FaceApiException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 0;
        this.responseBody = null;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getResponseBody() {
        return responseBody;
    }
}
