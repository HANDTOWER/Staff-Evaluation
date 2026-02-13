// Utility class for generating Employee IDs
package com.company.appearance.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * EmployeeIdGenerator generates unique employee IDs based on employee names.
 * Format: LastName (normalized) + sequential number (e.g., Phu01, Phu02)
 */
public class EmployeeIdGenerator {

    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{M}");

    /**
     * Generates an employee ID from the given name and sequence number.
     * Example: "Trần Phước Phú" with sequence 1 → "Phu01"
     * 
     * @param fullName the full name of the employee
     * @param sequenceNumber the sequence number for this last name
     * @return the generated employee ID
     */
    public static String generateId(String fullName, int sequenceNumber) {
        String lastName = extractLastName(fullName);
        String normalized = removeDiacritics(lastName);
        String capitalized = capitalize(normalized);
        return String.format("%s%02d", capitalized, sequenceNumber);
    }

    /**
     * Extracts the last name from a full name.
     * Example: "Trần Phước Phú" → "Phú"
     * 
     * @param fullName the full name
     * @return the last name
     */
    private static String extractLastName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "Unknown";
        }
        String[] parts = fullName.trim().split("\\s+");
        return parts[parts.length - 1];
    }

    /**
     * Removes Vietnamese diacritics from a string.
     * Example: "Phú" → "Phu"
     * 
     * @param text the text with diacritics
     * @return the text without diacritics
     */
    private static String removeDiacritics(String text) {
        if (text == null) {
            return "";
        }
        // Normalize to NFD (decomposed form)
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        // Remove combining diacritical marks
        String withoutDiacritics = DIACRITICS_PATTERN.matcher(normalized).replaceAll("");
        // Handle special Vietnamese characters
        return withoutDiacritics
                .replace('đ', 'd')
                .replace('Đ', 'D');
    }

    /**
     * Capitalizes the first letter and lowercases the rest.
     * Example: "PHU" → "Phu"
     * 
     * @param text the text to capitalize
     * @return the capitalized text
     */
    private static String capitalize(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase();
    }

    /**
     * Extracts the normalized last name without sequence number.
     * Used to find existing employees with the same last name.
     * Example: "Trần Phước Phú" → "Phu"
     * 
     * @param fullName the full name
     * @return the normalized last name
     */
    public static String getNormalizedLastName(String fullName) {
        String lastName = extractLastName(fullName);
        String normalized = removeDiacritics(lastName);
        return capitalize(normalized);
    }
}
