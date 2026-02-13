package com.company.appearance.util.face;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * Utility class for validating uploaded files.
 */
@Component
public class FileValidationUtil {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/bmp", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Validates that a file is not null, not empty, and is an image.
     *
     * @param file File to validate
     * @param fieldName Name of the field for error messages
     * @throws IllegalArgumentException if validation fails
     */
    public void validateImageFile(MultipartFile file, String fieldName) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required and cannot be empty");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                fieldName + " must be a valid image file (JPEG, PNG, BMP, GIF, or WebP). " +
                "Received content type: " + contentType
            );
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                fieldName + " exceeds maximum allowed size of " + (MAX_FILE_SIZE / 1024 / 1024) + "MB"
            );
        }

        // Validate original filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " must have a valid filename");
        }
    }

    /**
     * Validates multiple image files.
     *
     * @param files Array of files to validate
     * @param fieldNames Array of field names (must match files length)
     * @throws IllegalArgumentException if validation fails
     */
    public void validateImageFiles(MultipartFile[] files, String[] fieldNames) {
        if (files.length != fieldNames.length) {
            throw new IllegalArgumentException("Files and field names arrays must have the same length");
        }

        for (int i = 0; i < files.length; i++) {
            validateImageFile(files[i], fieldNames[i]);
        }
    }
}
