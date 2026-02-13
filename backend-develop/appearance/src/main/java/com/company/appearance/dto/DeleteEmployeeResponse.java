// Data Transfer Object for DeleteEmployeeResponse
package com.company.appearance.dto;

import com.company.appearance.dto.face.FaceDatabaseDeleteResponse;

/**
 * Response DTO for deleting employee with face database removal.
 */
public class DeleteEmployeeResponse {

    private String message;
    private FaceDatabaseDeleteResponse faceDbDeletion;

    public DeleteEmployeeResponse() {
    }

    public DeleteEmployeeResponse(String message, FaceDatabaseDeleteResponse faceDbDeletion) {
        this.message = message;
        this.faceDbDeletion = faceDbDeletion;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public FaceDatabaseDeleteResponse getFaceDbDeletion() {
        return faceDbDeletion;
    }

    public void setFaceDbDeletion(FaceDatabaseDeleteResponse faceDbDeletion) {
        this.faceDbDeletion = faceDbDeletion;
    }
}
