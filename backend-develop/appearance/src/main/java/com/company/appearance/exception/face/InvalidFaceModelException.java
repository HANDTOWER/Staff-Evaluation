package com.company.appearance.exception.face;

/**
 * Exception thrown when an invalid face model is provided.
 * Should result in HTTP 400 Bad Request.
 */
public class InvalidFaceModelException extends RuntimeException {

    public InvalidFaceModelException(String message) {
        super(message);
    }

    public InvalidFaceModelException(String message, Throwable cause) {
        super(message, cause);
    }
}
