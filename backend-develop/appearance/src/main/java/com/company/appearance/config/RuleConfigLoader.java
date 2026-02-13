package com.company.appearance.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;

/**
 * Loads rule configuration from rule-config.json.
 */
@Component
public class RuleConfigLoader {

    private RuleConfig ruleConfig;

    public RuleConfigLoader() {
        loadRules();
    }

    private void loadRules() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream inputStream = new ClassPathResource("rule-config.json").getInputStream();
            this.ruleConfig = mapper.readValue(inputStream, RuleConfig.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load rule-config.json", e);
        }
    }

    public RuleConfig getRuleConfig() {
        return ruleConfig;
    }
}
