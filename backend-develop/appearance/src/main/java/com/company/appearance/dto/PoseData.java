package com.company.appearance.dto;

/**
 * DTO representing pose metrics sent from frontend.
 */
public class PoseData {

    /**
     * Head tilt in degrees.
     */
    private double headTilt;
    /**
     * Shoulder tilt in degrees.
     */
    private double shoulderTilt;
    /**
     * Spine angle (back deviation) in degrees.
     */
    private double spineAngle;
    /**
     * Stability score (0-100).
     */
    private double stabilityScore;
    /**
     * Forward head posture score.
     */
    private double forwardHeadZ;
    /**
     * Maximum arm angle in degrees.
     */
    private double maxArmAngle;
    /**
     * Maximum leg angle in degrees.
     */
    private double maxLegAngle;

    public PoseData() {
    }

    public double getHeadTilt() {
        return headTilt;
    }

    public void setHeadTilt(double headTilt) {
        this.headTilt = headTilt;
    }

    public double getShoulderTilt() {
        return shoulderTilt;
    }

    public void setShoulderTilt(double shoulderTilt) {
        this.shoulderTilt = shoulderTilt;
    }

    public double getSpineAngle() {
        return spineAngle;
    }

    public void setSpineAngle(double spineAngle) {
        this.spineAngle = spineAngle;
    }

    public double getStabilityScore() {
        return stabilityScore;
    }

    public void setStabilityScore(double stabilityScore) {
        this.stabilityScore = stabilityScore;
    }

    public double getForwardHeadZ() {
        return forwardHeadZ;
    }

    public void setForwardHeadZ(double forwardHeadZ) {
        this.forwardHeadZ = forwardHeadZ;
    }

    public double getMaxArmAngle() {
        return maxArmAngle;
    }

    public void setMaxArmAngle(double maxArmAngle) {
        this.maxArmAngle = maxArmAngle;
    }

    public double getMaxLegAngle() {
        return maxLegAngle;
    }

    public void setMaxLegAngle(double maxLegAngle) {
        this.maxLegAngle = maxLegAngle;
    }
}
