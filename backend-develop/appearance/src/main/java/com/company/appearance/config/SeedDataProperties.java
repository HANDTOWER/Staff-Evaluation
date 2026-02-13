package com.company.appearance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for seed data settings.
 * Binds properties with prefix "app.seed" from application.properties.
 * 
 * Used for creating default admin and evaluator accounts in development.
 */
@Component
@ConfigurationProperties(prefix = "app.seed")
public class SeedDataProperties {

    /**
     * Enable/disable seed data creation.
     */
    private boolean enabled;

    /**
     * Admin account configuration.
     */
    private AdminConfig admin = new AdminConfig();

    /**
     * Evaluator account configuration.
     */
    private EvaluatorConfig evaluator = new EvaluatorConfig();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public AdminConfig getAdmin() {
        return admin;
    }

    public void setAdmin(AdminConfig admin) {
        this.admin = admin;
    }

    public EvaluatorConfig getEvaluator() {
        return evaluator;
    }

    public void setEvaluator(EvaluatorConfig evaluator) {
        this.evaluator = evaluator;
    }

    /**
     * Admin account configuration nested class.
     */
    public static class AdminConfig {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    /**
     * Evaluator account configuration nested class.
     */
    public static class EvaluatorConfig {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
