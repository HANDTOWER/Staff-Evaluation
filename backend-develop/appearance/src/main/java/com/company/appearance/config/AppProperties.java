package com.company.appearance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Seed seed = new Seed();

    public Jwt getJwt() { return jwt; }
    public void setJwt(Jwt jwt) { this.jwt = jwt; }

    public Seed getSeed() { return seed; }
    public void setSeed(Seed seed) { this.seed = seed; }

    public static class Jwt {
        private String secret;
        private long expirationSeconds;
        private long refreshExpirationSeconds;

        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }

        public long getExpirationSeconds() { return expirationSeconds; }
        public void setExpirationSeconds(long expirationSeconds) { this.expirationSeconds = expirationSeconds; }

        public long getRefreshExpirationSeconds() { return refreshExpirationSeconds; }
        public void setRefreshExpirationSeconds(long refreshExpirationSeconds) { this.refreshExpirationSeconds = refreshExpirationSeconds; }
    }

    public static class Seed {
        private boolean enabled;
        private Admin admin = new Admin();
        private Evaluator evaluator = new Evaluator();

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public Admin getAdmin() { return admin; }
        public void setAdmin(Admin admin) { this.admin = admin; }

        public Evaluator getEvaluator() { return evaluator; }
        public void setEvaluator(Evaluator evaluator) { this.evaluator = evaluator; }

        public static class Admin {
            private String username;
            private String password;

            public String getUsername() { return username; }
            public void setUsername(String username) { this.username = username; }

            public String getPassword() { return password; }
            public void setPassword(String password) { this.password = password; }
        }

        public static class Evaluator {
            private String username;
            private String password;

            public String getUsername() { return username; }
            public void setUsername(String username) { this.username = username; }

            public String getPassword() { return password; }
            public void setPassword(String password) { this.password = password; }
        }
    }
}
