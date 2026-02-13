package com.company.appearance.model.face;

/**
 * Enum representing the 5 required face angles for registration.
 */
public enum FaceAngle {
    FRONT("front"),
    LEFT("left"),
    RIGHT("right"),
    UP("up"),
    DOWN("down");

    private final String key;

    FaceAngle(String key) {
        this.key = key;
    }

    public String getKey() {
        return key;
    }

    public static FaceAngle fromKey(String key) {
        for (FaceAngle angle : values()) {
            if (angle.key.equalsIgnoreCase(key)) {
                return angle;
            }
        }
        throw new IllegalArgumentException("Invalid face angle key: " + key);
    }
}
