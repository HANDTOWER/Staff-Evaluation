package com.company.appearance.model.face;

/**
 * Result of face detection operation containing bounding box and cropped image.
 */
public class FaceDetectionResult {
    private final FaceBox faceBox;
    private final byte[] croppedImage;

    public FaceDetectionResult(FaceBox faceBox, byte[] croppedImage) {
        this.faceBox = faceBox;
        this.croppedImage = croppedImage;
    }

    public FaceBox getFaceBox() {
        return faceBox;
    }

    public byte[] getCroppedImage() {
        return croppedImage;
    }
}
