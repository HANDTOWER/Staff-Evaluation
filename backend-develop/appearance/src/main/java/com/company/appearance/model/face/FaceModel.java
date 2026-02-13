package com.company.appearance.model.face;

import com.company.appearance.exception.face.InvalidFaceModelException;

import java.util.Locale;

/**
 * Enumeration of supported face recognition models.
 * Provides validation and normalization for model parameter.
 */
public enum FaceModel {
    MAGFACE("magface"),
    QMAGFACE("qmagface");

    private final String value;

    FaceModel(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    /**
     * Normalizes and validates a model string.
     * Trims whitespace, converts to lowercase, and validates against allowed values.
     *
     * @param model Model string (may be null, have whitespace, or mixed case)
     * @param defaultModel Default model to use if input is null/blank
     * @return Normalized model string (lowercase, trimmed)
     * @throws InvalidFaceModelException if model is invalid after normalization
     */
    public static String normalizeAndValidate(String model, String defaultModel) {
        // Use default if null or blank
        if (model == null || model.isBlank()) {
            model = defaultModel;
        }

        // Normalize: trim and lowercase
        String normalized = model.trim().toLowerCase(Locale.ROOT);

        // Validate against enum values
        for (FaceModel faceModel : values()) {
            if (faceModel.getValue().equals(normalized)) {
                return normalized;
            }
        }

        // Invalid model
        throw new InvalidFaceModelException(
            "Invalid model '" + model + "'. Must be 'magface' or 'qmagface'"
        );
    }

    /**
     * Parses a model string to FaceModel enum.
     *
     * @param model Model string
     * @return FaceModel enum
     * @throws InvalidFaceModelException if model is invalid
     */
    public static FaceModel fromString(String model) {
        String normalized = normalizeAndValidate(model, MAGFACE.getValue());
        
        for (FaceModel faceModel : values()) {
            if (faceModel.getValue().equals(normalized)) {
                return faceModel;
            }
        }
        
        // Should never reach here due to validation above
        throw new InvalidFaceModelException("Invalid model: " + model);
    }

    @Override
    public String toString() {
        return value;
    }
}
