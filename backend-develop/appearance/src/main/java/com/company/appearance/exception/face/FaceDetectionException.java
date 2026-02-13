package com.company.appearance.exception.face;

/**
 * Exception thrown when face detection fails or encounters errors.
 */
public class FaceDetectionException extends RuntimeException {
    
    public FaceDetectionException(String message) {
        super(message);
    }

    public FaceDetectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
