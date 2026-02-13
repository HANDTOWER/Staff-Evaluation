package com.company.appearance.config.face;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for face detection settings.
 * Binds properties with prefix "face.detection" from application.properties.
 */
@Component
@ConfigurationProperties(prefix = "face.detection")
public class FaceDetectionProperties {

    /**
     * Horizontal margin percentage to add on left and right of detected face (e.g., 0.2 = 20%).
     */
    private Double marginHorizontal = 0.2;

    /**
     * Vertical margin percentage to add on top and bottom of detected face (e.g., 0.3 = 30%).
     */
    private Double marginVertical = 0.3;

    /**
     * Minimum face size in pixels for detection.
     */
    private Integer minFaceSize = 80;

    /**
     * Dataset root directory for folder-based registration.
     */
    private String datasetRoot = "data/face-dataset";

    public Double getMarginHorizontal() {
        return marginHorizontal;
    }

    public void setMarginHorizontal(Double marginHorizontal) {
        this.marginHorizontal = marginHorizontal;
    }

    public Double getMarginVertical() {
        return marginVertical;
    }

    public void setMarginVertical(Double marginVertical) {
        this.marginVertical = marginVertical;
    }

    public Integer getMinFaceSize() {
        return minFaceSize;
    }

    public void setMinFaceSize(Integer minFaceSize) {
        this.minFaceSize = minFaceSize;
    }

    public String getDatasetRoot() {
        return datasetRoot;
    }

    public void setDatasetRoot(String datasetRoot) {
        this.datasetRoot = datasetRoot;
    }
}
