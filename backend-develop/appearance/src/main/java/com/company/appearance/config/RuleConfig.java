package com.company.appearance.config;

import java.util.List;

/**
 * RuleConfig represents appearance evaluation rules
 * loaded from rule-config.json.
 */
public class RuleConfig {

    private List<String> required;
    private Score score;
    private Pose pose;

    public List<String> getRequired() {
        return required;
    }

    public void setRequired(List<String> required) {
        this.required = required;
    }

    public Score getScore() {
        return score;
    }

    public void setScore(Score score) {
        this.score = score;
    }

    public Pose getPose() {
        return pose;
    }

    public void setPose(Pose pose) {
        this.pose = pose;
    }

    public static class Score {
        private int base;
        private int penaltyPerViolation;
        private int minScore;

        public int getBase() {
            return base;
        }

        public void setBase(int base) {
            this.base = base;
        }

        public int getPenaltyPerViolation() {
            return penaltyPerViolation;
        }

        public void setPenaltyPerViolation(int penaltyPerViolation) {
            this.penaltyPerViolation = penaltyPerViolation;
        }

        public int getMinScore() {
            return minScore;
        }

        public void setMinScore(int minScore) {
            this.minScore = minScore;
        }
    }

    public static class Pose {
        /**
         * Head deviation threshold for green status (degrees).
         */
        private double headGoodMax;
        /**
         * Head deviation threshold for yellow status (degrees).
         */
        private double headWarnMax;
        /**
         * Shoulder tilt threshold for green status (degrees).
         */
        private double shoulderGoodMax;
        /**
         * Shoulder tilt threshold for yellow status (degrees).
         */
        private double shoulderWarnMax;
        /**
         * Forward head Z threshold for green status (score).
         */
        private double forwardHeadGoodMax;
        /**
         * Forward head Z threshold for yellow status (score).
         */
        private double forwardHeadWarnMax;
        /**
         * Back deviation threshold for green status (degrees).
         */
        private double backGoodMax;
        /**
         * Back deviation threshold for yellow status (degrees).
         */
        private double backWarnMax;
        /**
         * Stability score threshold for green status (0-100).
         */
        private double stabilityGoodMin;
        /**
         * Stability score threshold for yellow status (0-100).
         */
        private double stabilityWarnMin;
        /**
         * Arm angle threshold for yellow status (degrees).
         */
        private double armWarnMin;
        /**
         * Arm angle threshold for red status (degrees).
         */
        private double armBadMin;
        /**
         * Leg angle threshold for yellow status (degrees).
         */
        private double legWarnMin;
        /**
         * Leg angle threshold for red status (degrees).
         */
        private double legBadMin;

        public double getHeadGoodMax() {
            return headGoodMax;
        }

        public void setHeadGoodMax(double headGoodMax) {
            this.headGoodMax = headGoodMax;
        }

        public double getHeadWarnMax() {
            return headWarnMax;
        }

        public void setHeadWarnMax(double headWarnMax) {
            this.headWarnMax = headWarnMax;
        }

        public double getShoulderGoodMax() {
            return shoulderGoodMax;
        }

        public void setShoulderGoodMax(double shoulderGoodMax) {
            this.shoulderGoodMax = shoulderGoodMax;
        }

        public double getShoulderWarnMax() {
            return shoulderWarnMax;
        }

        public void setShoulderWarnMax(double shoulderWarnMax) {
            this.shoulderWarnMax = shoulderWarnMax;
        }

        public double getForwardHeadGoodMax() {
            return forwardHeadGoodMax;
        }

        public void setForwardHeadGoodMax(double forwardHeadGoodMax) {
            this.forwardHeadGoodMax = forwardHeadGoodMax;
        }

        public double getForwardHeadWarnMax() {
            return forwardHeadWarnMax;
        }

        public void setForwardHeadWarnMax(double forwardHeadWarnMax) {
            this.forwardHeadWarnMax = forwardHeadWarnMax;
        }

        public double getBackGoodMax() {
            return backGoodMax;
        }

        public void setBackGoodMax(double backGoodMax) {
            this.backGoodMax = backGoodMax;
        }

        public double getBackWarnMax() {
            return backWarnMax;
        }

        public void setBackWarnMax(double backWarnMax) {
            this.backWarnMax = backWarnMax;
        }

        public double getStabilityGoodMin() {
            return stabilityGoodMin;
        }

        public void setStabilityGoodMin(double stabilityGoodMin) {
            this.stabilityGoodMin = stabilityGoodMin;
        }

        public double getStabilityWarnMin() {
            return stabilityWarnMin;
        }

        public void setStabilityWarnMin(double stabilityWarnMin) {
            this.stabilityWarnMin = stabilityWarnMin;
        }

        public double getArmWarnMin() {
            return armWarnMin;
        }

        public void setArmWarnMin(double armWarnMin) {
            this.armWarnMin = armWarnMin;
        }

        public double getArmBadMin() {
            return armBadMin;
        }

        public void setArmBadMin(double armBadMin) {
            this.armBadMin = armBadMin;
        }

        public double getLegWarnMin() {
            return legWarnMin;
        }

        public void setLegWarnMin(double legWarnMin) {
            this.legWarnMin = legWarnMin;
        }

        public double getLegBadMin() {
            return legBadMin;
        }

        public void setLegBadMin(double legBadMin) {
            this.legBadMin = legBadMin;
        }
    }
}
