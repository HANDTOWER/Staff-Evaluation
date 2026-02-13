package com.company.appearance.dto.face;

/**
 * DTO for face bounding box information.
 */
public class FaceBoxDto {
    private int x;
    private int y;
    private int width;
    private int height;
    private double confidence;

    public FaceBoxDto() {
    }

    public FaceBoxDto(int x, int y, int width, int height, double confidence) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.confidence = confidence;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
}
