package com.company.appearance.exception.face;

/**
 * Exception thrown when a person is not found in the face database.
 * Should result in HTTP 404 Not Found.
 */
public class PersonNotFoundException extends RuntimeException {

    public PersonNotFoundException(String message) {
        super(message);
    }

    public PersonNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
