package com.company.appearance.config.face;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Face API integration.
 * Binds properties with prefix "face.api" from application.properties.
 */
@Component
@ConfigurationProperties(prefix = "face.api")
public class FaceApiProperties {

    /**
     * Base URL of the external Face API service.
     */
    private String baseUrl = "http://192.168.2.242:8000";

    /**
     * Default model for face recognition (magface or qmagface).
     */
    private String defaultModel = "magface";

    /**
     * Default threshold for face recognition.
     */
    private Double defaultThreshold = 0.5;

    /**
     * Default minimum quality for qmagface model.
     */
    private Integer defaultMinQuality = 1;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getDefaultModel() {
        return defaultModel;
    }

    public void setDefaultModel(String defaultModel) {
        this.defaultModel = defaultModel;
    }

    public Double getDefaultThreshold() {
        return defaultThreshold;
    }

    public void setDefaultThreshold(Double defaultThreshold) {
        this.defaultThreshold = defaultThreshold;
    }

    public Integer getDefaultMinQuality() {
        return defaultMinQuality;
    }

    public void setDefaultMinQuality(Integer defaultMinQuality) {
        this.defaultMinQuality = defaultMinQuality;
    }
}
