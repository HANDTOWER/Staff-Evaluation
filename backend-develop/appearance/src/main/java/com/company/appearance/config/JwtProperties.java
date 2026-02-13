package com.company.appearance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for JWT settings.
 * Binds properties with prefix "app.jwt" from application.properties.
 * 
 * This class eliminates "unknown property" warnings in IDE and provides
 * type-safe access to JWT configuration values.
 */
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /**
     * JWT secret key for signing tokens (must be at least 512 bits for HS512).
     */
    private String secret;

    /**
     * Access token expiration time in seconds (default: 36000 = 10 hours).
     */
    private Long expirationSeconds;

    /**
     * Refresh token expiration time in seconds (default: 604800 = 7 days).
     */
    private Long refreshExpirationSeconds;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public Long getExpirationSeconds() {
        return expirationSeconds;
    }

    public void setExpirationSeconds(Long expirationSeconds) {
        this.expirationSeconds = expirationSeconds;
    }

    public Long getRefreshExpirationSeconds() {
        return refreshExpirationSeconds;
    }

    public void setRefreshExpirationSeconds(Long refreshExpirationSeconds) {
        this.refreshExpirationSeconds = refreshExpirationSeconds;
    }
}
