package com.company.appearance.dto.face;

/**
 * Response DTO for face detection endpoint.
 */
public class FaceDetectResponse {
    private FaceBoxDto boundingBox;
    private String croppedImageBase64;
    private String croppedImageSavedPath;

    public FaceDetectResponse() {
    }

    public FaceDetectResponse(FaceBoxDto boundingBox, String croppedImageBase64) {
        this.boundingBox = boundingBox;
        this.croppedImageBase64 = croppedImageBase64;
    }

    public FaceDetectResponse(FaceBoxDto boundingBox, String croppedImageBase64, String croppedImageSavedPath) {
        this.boundingBox = boundingBox;
        this.croppedImageBase64 = croppedImageBase64;
        this.croppedImageSavedPath = croppedImageSavedPath;
    }

    public FaceBoxDto getBoundingBox() {
        return boundingBox;
    }

    public void setBoundingBox(FaceBoxDto boundingBox) {
        this.boundingBox = boundingBox;
    }

    public String getCroppedImageBase64() {
        return croppedImageBase64;
    }

    public void setCroppedImageBase64(String croppedImageBase64) {
        this.croppedImageBase64 = croppedImageBase64;
    }

    public String getCroppedImageSavedPath() {
        return croppedImageSavedPath;
    }

    public void setCroppedImageSavedPath(String croppedImageSavedPath) {
        this.croppedImageSavedPath = croppedImageSavedPath;
    }
}
