// Data Transfer Object for CreateEmployeeWithFaceRequest
package com.company.appearance.dto;

import com.company.appearance.dto.face.FaceRegisterResponse;

/**
 * Response DTO for creating employee with face registration.
 */
public class CreateEmployeeWithFaceRequest {

    private String id;
    private String name;
    private String department;
    private String position;
    private FaceRegisterResponse faceRegistration;

    public CreateEmployeeWithFaceRequest() {
    }

    public CreateEmployeeWithFaceRequest(String id, String name,
            String department, String position, FaceRegisterResponse faceRegistration) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.position = position;
        this.faceRegistration = faceRegistration;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public FaceRegisterResponse getFaceRegistration() {
        return faceRegistration;
    }

    public void setFaceRegistration(FaceRegisterResponse faceRegistration) {
        this.faceRegistration = faceRegistration;
    }
}
