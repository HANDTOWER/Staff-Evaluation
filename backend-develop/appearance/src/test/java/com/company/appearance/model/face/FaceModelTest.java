package com.company.appearance.model.face;

import com.company.appearance.exception.face.InvalidFaceModelException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for FaceModel enum normalization and validation.
 */
class FaceModelTest {

    @Test
    void normalizeAndValidate_withNull_shouldUseDefault() {
        String result = FaceModel.normalizeAndValidate(null, "magface");
        assertEquals("magface", result);
    }

    @Test
    void normalizeAndValidate_withBlank_shouldUseDefault() {
        String result = FaceModel.normalizeAndValidate("   ", "qmagface");
        assertEquals("qmagface", result);
    }

    @Test
    void normalizeAndValidate_withEmpty_shouldUseDefault() {
        String result = FaceModel.normalizeAndValidate("", "magface");
        assertEquals("magface", result);
    }

    @ParameterizedTest
    @ValueSource(strings = {"magface", "MAGFACE", "MagFace", " magface ", "  MAGFACE  "})
    void normalizeAndValidate_withValidMagfaceVariants_shouldReturnNormalized(String input) {
        String result = FaceModel.normalizeAndValidate(input, "magface");
        assertEquals("magface", result, "Failed for input: " + input);
    }

    @ParameterizedTest
    @ValueSource(strings = {"qmagface", "QMAGFACE", "QMagFace", " qmagface ", "  QMAGFACE  "})
    void normalizeAndValidate_withValidQmagfaceVariants_shouldReturnNormalized(String input) {
        String result = FaceModel.normalizeAndValidate(input, "magface");
        assertEquals("qmagface", result, "Failed for input: " + input);
    }

    @Test
    void normalizeAndValidate_withTrailingSpace_shouldTrimAndValidate() {
        String result = FaceModel.normalizeAndValidate("magface ", "magface");
        assertEquals("magface", result);
    }

    @Test
    void normalizeAndValidate_withLeadingSpace_shouldTrimAndValidate() {
        String result = FaceModel.normalizeAndValidate(" qmagface", "magface");
        assertEquals("qmagface", result);
    }

    @Test
    void normalizeAndValidate_withMultipleSpaces_shouldTrimAndValidate() {
        String result = FaceModel.normalizeAndValidate("  magface  ", "magface");
        assertEquals("magface", result);
    }

    @ParameterizedTest
    @ValueSource(strings = {"invalid", "abc", "magface123", " other", "randommodel"})
    void normalizeAndValidate_withInvalidModel_shouldThrowException(String invalidModel) {
        InvalidFaceModelException exception = assertThrows(
            InvalidFaceModelException.class,
            () -> FaceModel.normalizeAndValidate(invalidModel, "magface")
        );
        
        assertTrue(exception.getMessage().contains("Invalid model"));
        assertTrue(exception.getMessage().contains("magface") || exception.getMessage().contains("qmagface"));
    }

    @Test
    void normalizeAndValidate_withUrlEncodedSpace_shouldThrowException() {
        // Simulating "magface%20" after URL decoding becomes "magface "
        InvalidFaceModelException exception = assertThrows(
            InvalidFaceModelException.class,
            () -> FaceModel.normalizeAndValidate("magface%20", "magface")
        );
        
        assertTrue(exception.getMessage().contains("Invalid model"));
    }

    @Test
    void fromString_withValidMagface_shouldReturnEnum() {
        FaceModel result = FaceModel.fromString("magface");
        assertEquals(FaceModel.MAGFACE, result);
    }

    @Test
    void fromString_withValidQmagface_shouldReturnEnum() {
        FaceModel result = FaceModel.fromString("qmagface");
        assertEquals(FaceModel.QMAGFACE, result);
    }

    @Test
    void fromString_withMixedCase_shouldReturnEnum() {
        FaceModel result = FaceModel.fromString("MAGFACE");
        assertEquals(FaceModel.MAGFACE, result);
        
        result = FaceModel.fromString("QMagFace");
        assertEquals(FaceModel.QMAGFACE, result);
    }

    @Test
    void fromString_withWhitespace_shouldReturnEnum() {
        FaceModel result = FaceModel.fromString("  magface  ");
        assertEquals(FaceModel.MAGFACE, result);
    }

    @Test
    void getValue_shouldReturnLowercaseString() {
        assertEquals("magface", FaceModel.MAGFACE.getValue());
        assertEquals("qmagface", FaceModel.QMAGFACE.getValue());
    }

    @Test
    void toString_shouldReturnValue() {
        assertEquals("magface", FaceModel.MAGFACE.toString());
        assertEquals("qmagface", FaceModel.QMAGFACE.toString());
    }
}
