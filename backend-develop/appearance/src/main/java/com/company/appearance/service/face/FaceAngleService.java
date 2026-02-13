package com.company.appearance.service.face;

import org.springframework.stereotype.Service;

import com.company.appearance.model.face.FaceAngle;

/**
 * Service for managing face angle operations and validation.
 */
@Service
public class FaceAngleService {

    /**
     * Validates that all required angles are present.
     *
     * @param hasFront Whether front angle is provided
     * @param hasLeft Whether left angle is provided
     * @param hasRight Whether right angle is provided
     * @param hasUp Whether up angle is provided
     * @param hasDown Whether down angle is provided
     * @throws IllegalArgumentException if any angle is missing
     */
    public void validateAllAngles(boolean hasfront, boolean hasLeft, 
                                   boolean hasRight, boolean hasUp, boolean hasDown) {
        StringBuilder missing = new StringBuilder();
        
        if (!hasfront) missing.append("front, ");
        if (!hasLeft) missing.append("left, ");
        if (!hasRight) missing.append("right, ");
        if (!hasUp) missing.append("up, ");
        if (!hasDown) missing.append("down, ");
        
        if (missing.length() > 0) {
            missing.setLength(missing.length() - 2); // Remove trailing comma
            throw new IllegalArgumentException(
                "Missing required face angles: " + missing + ". All 5 angles must be provided.");
        }
    }

    /**
     * Gets filename for a face angle.
     *
     * @param angle Face angle
     * @return Filename (e.g., "front.jpg")
     */
    public String getFilename(FaceAngle angle) {
        return angle.getKey() + ".jpg";
    }
}
