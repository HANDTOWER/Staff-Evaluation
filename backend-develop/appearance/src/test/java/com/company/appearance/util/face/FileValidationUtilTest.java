package com.company.appearance.util.face;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for FileValidationUtil.
 */
class FileValidationUtilTest {

    private FileValidationUtil fileValidationUtil;

    @BeforeEach
    void setUp() {
        fileValidationUtil = new FileValidationUtil();
    }

    @Test
    void validateImageFile_withValidJpegFile_shouldNotThrow() {
        // Arrange
        MockMultipartFile validFile = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", new byte[]{1, 2, 3, 4}
        );

        // Act & Assert
        assertDoesNotThrow(() -> fileValidationUtil.validateImageFile(validFile, "testFile"));
    }

    @Test
    void validateImageFile_withValidPngFile_shouldNotThrow() {
        // Arrange
        MockMultipartFile validFile = new MockMultipartFile(
            "file", "test.png", "image/png", new byte[]{1, 2, 3, 4}
        );

        // Act & Assert
        assertDoesNotThrow(() -> fileValidationUtil.validateImageFile(validFile, "testFile"));
    }

    @Test
    void validateImageFile_withNullFile_shouldThrowException() {
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationUtil.validateImageFile(null, "nullFile")
        );
        assertTrue(exception.getMessage().contains("nullFile is required"));
    }

    @Test
    void validateImageFile_withEmptyFile_shouldThrowException() {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file", "empty.jpg", "image/jpeg", new byte[0]
        );

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationUtil.validateImageFile(emptyFile, "emptyFile")
        );
        assertTrue(exception.getMessage().contains("emptyFile is required"));
    }

    @Test
    void validateImageFile_withInvalidContentType_shouldThrowException() {
        // Arrange
        MockMultipartFile textFile = new MockMultipartFile(
            "file", "document.txt", "text/plain", "content".getBytes()
        );

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationUtil.validateImageFile(textFile, "textFile")
        );
        assertTrue(exception.getMessage().contains("must be a valid image file"));
        assertTrue(exception.getMessage().contains("text/plain"));
    }

    @Test
    void validateImageFile_withNullContentType_shouldThrowException() {
        // Arrange
        MockMultipartFile fileWithNullContentType = new MockMultipartFile(
            "file", "test.jpg", null, new byte[]{1, 2, 3}
        );

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationUtil.validateImageFile(fileWithNullContentType, "fileWithNullType")
        );
        assertTrue(exception.getMessage().contains("must be a valid image file"));
    }

    @Test
    void validateImageFile_withFileTooLarge_shouldThrowException() {
        // Arrange - create a file larger than 10MB
        byte[] largeContent = new byte[11 * 1024 * 1024]; // 11MB
        MockMultipartFile largeFile = new MockMultipartFile(
            "file", "large.jpg", "image/jpeg", largeContent
        );

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationUtil.validateImageFile(largeFile, "largeFile")
        );
        assertTrue(exception.getMessage().contains("exceeds maximum allowed size"));
    }

    @Test
    void validateImageFile_withNullFilename_shouldThrowException() {
        // Arrange
        MockMultipartFile fileWithNullName = new MockMultipartFile(
            "file", null, "image/jpeg", new byte[]{1, 2, 3}
        );

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationUtil.validateImageFile(fileWithNullName, "fileWithNullName")
        );
        assertTrue(exception.getMessage().contains("must have a valid filename"));
    }

    @Test
    void validateImageFiles_withValidFiles_shouldNotThrow() {
        // Arrange
        MultipartFile[] files = {
            new MockMultipartFile("file1", "test1.jpg", "image/jpeg", new byte[]{1, 2, 3}),
            new MockMultipartFile("file2", "test2.png", "image/png", new byte[]{4, 5, 6}),
            new MockMultipartFile("file3", "test3.jpg", "image/jpeg", new byte[]{7, 8, 9})
        };
        String[] fieldNames = {"file1", "file2", "file3"};

        // Act & Assert
        assertDoesNotThrow(() -> fileValidationUtil.validateImageFiles(files, fieldNames));
    }

    @Test
    void validateImageFiles_withMismatchedArrayLength_shouldThrowException() {
        // Arrange
        MultipartFile[] files = {
            new MockMultipartFile("file1", "test1.jpg", "image/jpeg", new byte[]{1, 2, 3})
        };
        String[] fieldNames = {"file1", "file2"};

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationUtil.validateImageFiles(files, fieldNames)
        );
        assertTrue(exception.getMessage().contains("same length"));
    }

    @Test
    void validateImageFiles_withOneInvalidFile_shouldThrowException() {
        // Arrange
        MultipartFile[] files = {
            new MockMultipartFile("file1", "test1.jpg", "image/jpeg", new byte[]{1, 2, 3}),
            new MockMultipartFile("file2", "test2.txt", "text/plain", new byte[]{4, 5, 6})
        };
        String[] fieldNames = {"file1", "file2"};

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationUtil.validateImageFiles(files, fieldNames)
        );
        assertTrue(exception.getMessage().contains("file2"));
    }

    @Test
    void validateImageFile_withWebpImage_shouldNotThrow() {
        // Arrange
        MockMultipartFile webpFile = new MockMultipartFile(
            "file", "test.webp", "image/webp", new byte[]{1, 2, 3, 4}
        );

        // Act & Assert
        assertDoesNotThrow(() -> fileValidationUtil.validateImageFile(webpFile, "webpFile"));
    }

    @Test
    void validateImageFile_withBmpImage_shouldNotThrow() {
        // Arrange
        MockMultipartFile bmpFile = new MockMultipartFile(
            "file", "test.bmp", "image/bmp", new byte[]{1, 2, 3, 4}
        );

        // Act & Assert
        assertDoesNotThrow(() -> fileValidationUtil.validateImageFile(bmpFile, "bmpFile"));
    }
}
