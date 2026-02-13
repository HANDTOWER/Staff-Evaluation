// Data Transfer Object for AppearanceEvaluationRequest
package com.company.appearance.dto;

import com.company.appearance.model.AppearanceCriteria;
import com.company.appearance.dto.PoseData;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * AppearanceEvaluationRequest is a Data Transfer Object used in API requests
 * and responses.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder({ "employeeId", "pose", "criteria" })
public class AppearanceEvaluationRequest {

    /**
     * EmployeeId field.
     */
    private String employeeId;
    /**
     * Criteria field.
     */
    private AppearanceCriteria criteria;
    /**
     * Pose data field.
     */
    private PoseData pose;

    /**
     * Flag to avoid overriding stability value when stability_norm is already
     * provided.
     */
    private boolean stabilityNormProvided = false;

    /**
     * Constructor for injecting AppearanceEvaluationRequest dependencies.
     */
    public AppearanceEvaluationRequest() {
    }

    /**
     * Gets the employeeId.
     * 
     * @return the employeeId value
     */
    public String getEmployeeId() {
        return employeeId;
    }

    /**
     * Gets the criteria.
     * 
     * @return the criteria value
     */
    public AppearanceCriteria getCriteria() {
        return criteria;
    }

    /**
     * Gets the pose.
     * 
     * @return the pose value
     */
    public PoseData getPose() {
        return pose;
    }

    /**
     * Sets the employeeId.
     * 
     * @param employeeId the employeeId value
     */
    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    /**
     * Sets the criteria.
     * 
     * @param criteria the criteria value
     */
    public void setCriteria(AppearanceCriteria criteria) {
        this.criteria = criteria;
    }

    /**
     * Sets the pose.
     * 
     * @param pose the pose value
     */
    public void setPose(PoseData pose) {
        this.pose = pose;
    }

    @JsonProperty("angles")
    public void setAngles(Angles angles) {
        // Map nested angle values from frontend JSON into pose fields.
        if (angles == null) {
            return;
        }

        ensurePose();
        this.pose.setHeadTilt(angles.getHeadDeviation());
        this.pose.setShoulderTilt(angles.getShoulderTilt());
        this.pose.setSpineAngle(angles.getBackDeviation());
        this.pose.setForwardHeadZ(angles.getForwardHeadZ());
        if (!this.stabilityNormProvided && angles.getStabilityNorm() > 0) {
            if (angles.getStabilityNorm() <= 1.0) {
                this.pose.setStabilityScore(angles.getStabilityNorm() * 100.0);
            } else {
                this.pose.setStabilityScore(angles.getStabilityNorm());
            }
            this.stabilityNormProvided = true;
        }
    }

    @JsonProperty("stability_norm")
    public void setStabilityNorm(double stabilityNorm) {
        // Frontend may send normalized stability (0..1), convert to 0..100.
        ensurePose();
        if (stabilityNorm <= 1.0) {
            this.pose.setStabilityScore(stabilityNorm * 100.0);
        } else {
            this.pose.setStabilityScore(stabilityNorm);
        }
        this.stabilityNormProvided = true;
    }

    @JsonProperty("stability_score")
    public void setStabilityScore(double stabilityScore) {
        // Ignore raw stability score if stability_norm is already provided.
        if (this.stabilityNormProvided) {
            return;
        }

        ensurePose();
        if (stabilityScore <= 1.0) {
            this.pose.setStabilityScore(stabilityScore * 100.0);
        } else {
            this.pose.setStabilityScore(stabilityScore);
        }
    }

    @JsonProperty("clothing")
    public void setClothing(Clothing clothing) {
        // Map clothing labels into boolean criteria flags.
        if (clothing == null) {
            return;
        }

        if (this.criteria == null) {
            this.criteria = new AppearanceCriteria();
            this.criteria.setHair(true);
            this.criteria.setTie(true);
        }

        this.criteria.setShirt(isPresentClothing(clothing.getTop()));
        this.criteria.setPants(isPresentClothing(clothing.getBottom()));
        this.criteria.setShoes(isPresentClothing(clothing.getFoot()));
        this.criteria.setHat(isPresentClothing(clothing.getHead()));
    }

    public AppearanceEvaluationRequest(String employeeId) {
        this.employeeId = employeeId;
    }

    private void ensurePose() {
        // Initialize pose object if missing.
        if (this.pose == null) {
            this.pose = new PoseData();
        }
    }

    private boolean isPresentClothing(String value) {
        // Consider common "not wearing" labels as false.
        if (value == null) {
            return false;
        }

        String normalized = value.trim().toLowerCase();
        return !normalized.isEmpty()
                && !normalized.equals("none")
                && !normalized.equals("no")
                && !normalized.equals("no hat")
                && !normalized.equals("bare feet")
                && !normalized.equals("barefoot");
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Angles {
        @JsonProperty("head_deviation")
        private double headDeviation;
        @JsonProperty("shoulder_tilt")
        private double shoulderTilt;
        @JsonProperty("forward_head_z")
        private double forwardHeadZ;
        @JsonProperty("back_deviation")
        private double backDeviation;
        @JsonProperty("stability_norm")
        private double stabilityNorm;

        public double getHeadDeviation() {
            return headDeviation;
        }

        public void setHeadDeviation(double headDeviation) {
            this.headDeviation = headDeviation;
        }

        public double getShoulderTilt() {
            return shoulderTilt;
        }

        public void setShoulderTilt(double shoulderTilt) {
            this.shoulderTilt = shoulderTilt;
        }

        public double getForwardHeadZ() {
            return forwardHeadZ;
        }

        public void setForwardHeadZ(double forwardHeadZ) {
            this.forwardHeadZ = forwardHeadZ;
        }

        public double getBackDeviation() {
            return backDeviation;
        }

        public void setBackDeviation(double backDeviation) {
            this.backDeviation = backDeviation;
        }

        public double getStabilityNorm() {
            return stabilityNorm;
        }

        public void setStabilityNorm(double stabilityNorm) {
            this.stabilityNorm = stabilityNorm;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Clothing {
        private String top;
        private String bottom;
        private String foot;
        private String head;

        public String getTop() {
            return top;
        }

        public void setTop(String top) {
            this.top = top;
        }

        public String getBottom() {
            return bottom;
        }

        public void setBottom(String bottom) {
            this.bottom = bottom;
        }

        public String getFoot() {
            return foot;
        }

        public void setFoot(String foot) {
            this.foot = foot;
        }

        public String getHead() {
            return head;
        }

        public void setHead(String head) {
            this.head = head;
        }
    }

}
