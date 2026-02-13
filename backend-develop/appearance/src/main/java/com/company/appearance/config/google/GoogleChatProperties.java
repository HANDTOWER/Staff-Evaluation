package com.company.appearance.config.google;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Google Chat integration.
 * Binds properties with prefix "google.chat" from application.properties.
 */
@Component
@ConfigurationProperties(prefix = "google.chat")
public class GoogleChatProperties {

    /**
     * Enable/disable Google Chat notifications.
     */
    private boolean enabled = false;

    /**
     * Google Chat webhook URL for incoming webhooks.
     */
    private String webhookUrl;

    /**
     * If true, only send notifications when evaluation fails (passed = false).
     */
    private boolean onlyOnFail = false;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getWebhookUrl() {
        return webhookUrl;
    }

    public void setWebhookUrl(String webhookUrl) {
        this.webhookUrl = webhookUrl;
    }

    public boolean isOnlyOnFail() {
        return onlyOnFail;
    }

    public void setOnlyOnFail(boolean onlyOnFail) {
        this.onlyOnFail = onlyOnFail;
    }
}
