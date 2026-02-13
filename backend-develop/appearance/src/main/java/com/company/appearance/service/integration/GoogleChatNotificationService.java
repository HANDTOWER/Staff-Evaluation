package com.company.appearance.service.integration;

import com.company.appearance.config.google.GoogleChatProperties;
import com.company.appearance.dto.integration.AppearanceEvaluationSnapshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Service for sending appearance evaluation notifications to Google Chat.
 * Uses Google Chat incoming webhooks for simple message posting.
 */
@Service
public class GoogleChatNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleChatNotificationService.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final GoogleChatProperties properties;
    private final RestClient restClient;

    public GoogleChatNotificationService(GoogleChatProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    /**
     * Sends evaluation notification to Google Chat (async, best-effort).
     * 
     * @param snapshot Immutable evaluation snapshot
     */
    @Async
    public void notify(AppearanceEvaluationSnapshot snapshot) {
        if (!properties.isEnabled()) {
            logger.debug("Google Chat notifications disabled, skipping");
            return;
        }

        if (properties.getWebhookUrl() == null || properties.getWebhookUrl().isBlank()) {
            logger.warn("Google Chat webhook URL not configured, skipping notification");
            return;
        }

        // Check if we should only notify on failures
        if (properties.isOnlyOnFail() && snapshot.isPassed()) {
            logger.debug("Evaluation passed and only-on-fail is enabled, skipping notification for evaluation ID: {}", 
                    snapshot.getEvaluationId());
            return;
        }

        try {
            String message = buildMessage(snapshot);
            sendToChat(message);
            logger.info("Successfully sent Google Chat notification for evaluation ID: {}", snapshot.getEvaluationId());
        } catch (Exception e) {
            // Best-effort: log error but don't throw (avoid breaking evaluation creation)
            logger.error("Failed to send Google Chat notification for evaluation ID: {}, employee ID: {}. Error: {}", 
                    snapshot.getEvaluationId(), snapshot.getEmployeeId(), e.getMessage(), e);
        }
    }

    /**
     * Builds formatted message for Google Chat.
     */
    String buildMessage(AppearanceEvaluationSnapshot snapshot) {
        String status = snapshot.isPassed() ? "✅ PASSED" : "❌ FAILED";
        String violationsText = snapshot.getViolations().isEmpty() 
                ? "No violations" 
                : String.join(", ", snapshot.getViolations());
        
        StringBuilder sb = new StringBuilder();
        sb.append("*Appearance Evaluation Result*\n\n");
        sb.append("*Status:* ").append(status).append("\n");
        sb.append("*Evaluation ID:* ").append(snapshot.getEvaluationId()).append("\n");
        sb.append("*Employee:* ").append(snapshot.getEmployeeName()).append("\n");
        sb.append("*Employee ID:* ").append(snapshot.getEmployeeId()).append("\n");
        sb.append("*Department:* ").append(snapshot.getDepartment()).append("\n");
        sb.append("*Position:* ").append(snapshot.getPosition()).append("\n");
        sb.append("*Score:* ").append(snapshot.getScore()).append("\n");
        sb.append("*Violations:* ").append(violationsText).append("\n");
        sb.append("*Evaluated At:* ").append(snapshot.getEvaluatedAt().format(FORMATTER)).append("\n");
        
        if (snapshot.getEvaluatorUsername() != null && !snapshot.getEvaluatorUsername().isBlank()) {
            sb.append("*Evaluator:* ").append(snapshot.getEvaluatorUsername()).append("\n");
        }
        
        return sb.toString();
    }

    /**
     * Sends message to Google Chat webhook.
     */
    private void sendToChat(String message) {
        Map<String, String> payload = Map.of("text", message);
        
        restClient.post()
                .uri(properties.getWebhookUrl())
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }
}
