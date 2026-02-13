package com.company.appearance.model.face;

/**
 * Represents a face bounding box in an image.
 */
public class FaceBox {
    private final int x;
    private final int y;
    private final int width;
    private final int height;
    private final double confidence;

    public FaceBox(int x, int y, int width, int height, double confidence) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.confidence = confidence;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public double getConfidence() {
        return confidence;
    }

    public int getArea() {
        return width * height;
    }

    @Override
    public String toString() {
        return String.format("FaceBox[x=%d, y=%d, w=%d, h=%d, conf=%.2f]", 
            x, y, width, height, confidence);
    }
}
