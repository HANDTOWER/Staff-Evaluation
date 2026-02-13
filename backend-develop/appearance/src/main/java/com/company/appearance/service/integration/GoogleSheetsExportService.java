package com.company.appearance.service.integration;

import com.company.appearance.config.google.GoogleSheetsProperties;
import com.company.appearance.dto.integration.AppearanceEvaluationSnapshot;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.*;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for exporting appearance evaluation results to Google Sheets.
 * Uses Google Sheets API v4 with service account authentication.
 */
@Service
public class GoogleSheetsExportService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleSheetsExportService.class);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final String APPLICATION_NAME = "Appearance Evaluation System";
    
    private static final List<String> HEADER_ROW = List.of(
        "evaluatedAt", "evaluationId", "employeeId", "employeeName",
        "department", "position", "passed", "score", "violations",
        "criteria_hat", "criteria_hair", "criteria_tie", "criteria_shirt",
        "criteria_pants", "criteria_shoes", "evaluatorUsername", "note"
    );

    private final GoogleSheetsProperties properties;
    private Sheets sheetsService;
    private boolean initialized = false;

    public GoogleSheetsExportService(GoogleSheetsProperties properties) {
        this.properties = properties;
    }

    /**
     * Initializes Google Sheets service after bean construction.
     * Only initializes if enabled and credentials are configured.
     */
    @PostConstruct
    public void init() {
        if (!properties.isEnabled()) {
            logger.info("Google Sheets export is disabled");
            return;
        }

        try {
            GoogleCredentials credentials = loadCredentials();
            if (credentials == null) {
                logger.warn("Google Sheets credentials not configured properly, export will be skipped");
                return;
            }

            sheetsService = new Sheets.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(credentials))
                    .setApplicationName(APPLICATION_NAME)
                    .build();

            initialized = true;
            logger.info("Google Sheets export service initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Google Sheets service: {}", e.getMessage(), e);
        }
    }

    /**
     * Loads Google credentials from configured source (file or base64).
     */
    private GoogleCredentials loadCredentials() throws IOException {
        // Try base64-encoded credentials first
        if (properties.getCredentialsJsonBase64() != null && !properties.getCredentialsJsonBase64().isBlank()) {
            logger.debug("Loading credentials from base64-encoded JSON");
            byte[] credentialsBytes = Base64.getDecoder().decode(properties.getCredentialsJsonBase64());
            try (InputStream stream = new ByteArrayInputStream(credentialsBytes)) {
                return GoogleCredentials.fromStream(stream)
                        .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS));
            }
        }

        // Try file-based credentials
        if (properties.getCredentialsFile() != null && !properties.getCredentialsFile().isBlank()) {
            logger.debug("Loading credentials from file: {}", properties.getCredentialsFile());
            InputStream stream = getCredentialsInputStream(properties.getCredentialsFile());
            if (stream != null) {
                return GoogleCredentials.fromStream(stream)
                        .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS));
            }
        }

        logger.warn("No valid credentials configuration found");
        return null;
    }

    /**
     * Gets InputStream for credentials file (supports classpath: and absolute paths).
     */
    private InputStream getCredentialsInputStream(String path) throws IOException {
        if (path.startsWith("classpath:")) {
            String resourcePath = path.substring("classpath:".length());
            Resource resource = new ClassPathResource(resourcePath);
            if (resource.exists()) {
                return resource.getInputStream();
            }
        } else {
            // Try as absolute path
            if (Files.exists(Paths.get(path))) {
                Resource resource = new FileSystemResource(path);
                return resource.getInputStream();
            }
        }
        return null;
    }

    /**
     * Appends evaluation snapshot to Google Sheet (async, best-effort).
     * 
     * @param snapshot Immutable evaluation snapshot
     */
    @Async
    public void append(AppearanceEvaluationSnapshot snapshot) {
        if (!properties.isEnabled()) {
            logger.debug("Google Sheets export disabled, skipping");
            return;
        }

        if (!initialized) {
            logger.warn("Google Sheets service not initialized, skipping export for evaluation ID: {}", 
                    snapshot.getEvaluationId());
            return;
        }

        try {
            ensureSheetExists();
            ensureHeaderExists();
            appendRow(snapshot);
            logger.info("Successfully appended evaluation ID: {} to Google Sheet", snapshot.getEvaluationId());
        } catch (Exception e) {
            // Best-effort: log error but don't throw
            logger.error("Failed to append evaluation ID: {} to Google Sheet. Error: {}", 
                    snapshot.getEvaluationId(), e.getMessage(), e);
        }
    }

    /**
     * Ensures the configured sheet/tab exists, creates it if missing.
     */
    private void ensureSheetExists() throws IOException {
        Spreadsheet spreadsheet = sheetsService.spreadsheets()
                .get(properties.getSpreadsheetId())
                .execute();

        boolean sheetExists = spreadsheet.getSheets().stream()
                .anyMatch(sheet -> properties.getSheetName().equals(sheet.getProperties().getTitle()));

        if (!sheetExists) {
            logger.info("Sheet '{}' does not exist, creating it", properties.getSheetName());
            createSheet();
        }
    }

    /**
     * Creates a new sheet/tab in the spreadsheet.
     */
    private void createSheet() throws IOException {
        AddSheetRequest addSheetRequest = new AddSheetRequest()
                .setProperties(new SheetProperties().setTitle(properties.getSheetName()));

        BatchUpdateSpreadsheetRequest batchRequest = new BatchUpdateSpreadsheetRequest()
                .setRequests(Collections.singletonList(new Request().setAddSheet(addSheetRequest)));

        sheetsService.spreadsheets()
                .batchUpdate(properties.getSpreadsheetId(), batchRequest)
                .execute();

        logger.info("Created new sheet: {}", properties.getSheetName());
    }

    /**
     * Ensures header row exists, writes it if missing.
     */
    private void ensureHeaderExists() throws IOException {
        String range = properties.getSheetName() + "!A1:R1";
        ValueRange response = sheetsService.spreadsheets().values()
                .get(properties.getSpreadsheetId(), range)
                .execute();

        List<List<Object>> values = response.getValues();
        if (values == null || values.isEmpty() || values.get(0).isEmpty()) {
            logger.info("Header row missing, writing header");
            writeHeader();
        }
    }

    /**
     * Writes header row to the sheet.
     */
    private void writeHeader() throws IOException {
        ValueRange headerRange = new ValueRange()
                .setValues(Collections.singletonList(new ArrayList<>(HEADER_ROW)));

        sheetsService.spreadsheets().values()
                .update(properties.getSpreadsheetId(), 
                        properties.getSheetName() + "!A1", 
                        headerRange)
                .setValueInputOption("RAW")
                .execute();
    }

    /**
     * Appends evaluation data as a new row.
     */
    private void appendRow(AppearanceEvaluationSnapshot snapshot) throws IOException {
        List<Object> row = buildRow(snapshot);
        ValueRange body = new ValueRange()
                .setValues(Collections.singletonList(row));

        sheetsService.spreadsheets().values()
                .append(properties.getSpreadsheetId(), 
                        properties.getSheetName() + "!A:R", 
                        body)
                .setValueInputOption("USER_ENTERED")
                .setInsertDataOption("INSERT_ROWS")
                .execute();
    }

    /**
     * Builds row data from evaluation snapshot.
     * Column order matches HEADER_ROW.
     */
    List<Object> buildRow(AppearanceEvaluationSnapshot snapshot) {
        String violationsText = snapshot.getViolations().isEmpty() 
                ? "" 
                : String.join("; ", snapshot.getViolations());

        return Arrays.asList(
            snapshot.getEvaluatedAt().format(ISO_FORMATTER),  // evaluatedAt
            snapshot.getEvaluationId(),                        // evaluationId
            snapshot.getEmployeeId(),                          // employeeId
            snapshot.getEmployeeName(),                        // employeeName
            snapshot.getDepartment(),                          // department
            snapshot.getPosition(),                            // position
            snapshot.isPassed(),                               // passed
            snapshot.getScore(),                               // score
            violationsText,                                    // violations
            snapshot.isCriteriaHat(),                          // criteria_hat
            snapshot.isCriteriaHair(),                         // criteria_hair
            snapshot.isCriteriaTie(),                          // criteria_tie
            snapshot.isCriteriaShirt(),                        // criteria_shirt
            snapshot.isCriteriaPants(),                        // criteria_pants
            snapshot.isCriteriaShoes(),                        // criteria_shoes
            snapshot.getEvaluatorUsername() != null ? snapshot.getEvaluatorUsername() : "", // evaluatorUsername
            snapshot.getNote() != null ? snapshot.getNote() : ""  // note
        );
    }
}
