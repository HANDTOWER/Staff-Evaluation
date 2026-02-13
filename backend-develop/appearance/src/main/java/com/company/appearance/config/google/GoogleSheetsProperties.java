package com.company.appearance.config.google;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Google Sheets integration.
 * Binds properties with prefix "google.sheets" from application.properties.
 */
@Component
@ConfigurationProperties(prefix = "google.sheets")
public class GoogleSheetsProperties {

    /**
     * Enable/disable Google Sheets export.
     */
    private boolean enabled = false;

    /**
     * Google Sheets spreadsheet ID (from the URL).
     */
    private String spreadsheetId;

    /**
     * Sheet/tab name within the spreadsheet.
     */
    private String sheetName = "Evaluations";

    /**
     * Path to service account credentials JSON file.
     * Can be absolute path or classpath: resource.
     */
    private String credentialsFile;

    /**
     * Base64-encoded service account credentials JSON.
     * Alternative to credentialsFile.
     */
    private String credentialsJsonBase64;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getSpreadsheetId() {
        return spreadsheetId;
    }

    public void setSpreadsheetId(String spreadsheetId) {
        this.spreadsheetId = spreadsheetId;
    }

    public String getSheetName() {
        return sheetName;
    }

    public void setSheetName(String sheetName) {
        this.sheetName = sheetName;
    }

    public String getCredentialsFile() {
        return credentialsFile;
    }

    public void setCredentialsFile(String credentialsFile) {
        this.credentialsFile = credentialsFile;
    }

    public String getCredentialsJsonBase64() {
        return credentialsJsonBase64;
    }

    public void setCredentialsJsonBase64(String credentialsJsonBase64) {
        this.credentialsJsonBase64 = credentialsJsonBase64;
    }
}
