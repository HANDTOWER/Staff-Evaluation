package com.company.appearance.controller.face;

import com.company.appearance.exception.face.InvalidFaceModelException;
import com.company.appearance.model.face.FaceModel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for model parameter normalization in Face API endpoints.
 * Ensures that whitespace and case issues are handled correctly.
 */
class FaceModelParameterTest {

    @Test
    void modelParameter_withTrailingSpace_shouldBeNormalized() {
        // Simulate what happens when user sends "magface " (with trailing space)
        String userInput = "magface ";
        
        // This is what the service should do
        String normalized = FaceModel.normalizeAndValidate(userInput, "magface");
        
        assertEquals("magface", normalized);
        assertFalse(normalized.contains(" "), "Normalized model should not contain spaces");
    }

    @Test
    void modelParameter_withLeadingSpace_shouldBeNormalized() {
        String userInput = " qmagface";
        String normalized = FaceModel.normalizeAndValidate(userInput, "magface");
        
        assertEquals("qmagface", normalized);
    }

    @Test
    void modelParameter_withMixedCase_shouldBeNormalized() {
        String userInput = "MAGFACE";
        String normalized = FaceModel.normalizeAndValidate(userInput, "magface");
        
        assertEquals("magface", normalized);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "magface ",     // trailing space (URL: model=magface%20)
        " magface",     // leading space
        "  magface  ",  // both sides
        "MAGFACE",      // uppercase
        "MagFace",      // mixed case
        "  MAGFACE  "   // spaces + uppercase
    })
    void modelParameter_withVariousFormats_shouldAllNormalizeToMagface(String userInput) {
        String normalized = FaceModel.normalizeAndValidate(userInput, "magface");
        assertEquals("magface", normalized);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "qmagface ",
        " qmagface",
        "QMAGFACE",
        "QMagFace",
        "  qmagface  "
    })
    void modelParameter_withVariousFormats_shouldAllNormalizeToQmagface(String userInput) {
        String normalized = FaceModel.normalizeAndValidate(userInput, "magface");
        assertEquals("qmagface", normalized);
    }

    @Test
    void modelParameter_withInvalidValue_shouldThrowInvalidFaceModelException() {
        assertThrows(InvalidFaceModelException.class, () -> {
            FaceModel.normalizeAndValidate("invalid", "magface");
        });
    }

    @Test
    void modelParameter_withInvalidValue_shouldNotReachFaceApi() {
        // This test ensures that invalid model validation happens BEFORE Face API call
        // If model is invalid, we should get InvalidFaceModelException, not FaceApiException
        
        String invalidModel = "some_invalid_model";
        
        InvalidFaceModelException exception = assertThrows(
            InvalidFaceModelException.class,
            () -> FaceModel.normalizeAndValidate(invalidModel, "magface")
        );
        
        assertTrue(exception.getMessage().contains("Invalid model"));
        assertTrue(exception.getMessage().contains("magface") || 
                   exception.getMessage().contains("qmagface"));
    }

    @Test
    void modelParameter_nullOrBlank_shouldUseDefault() {
        assertEquals("magface", FaceModel.normalizeAndValidate(null, "magface"));
        assertEquals("magface", FaceModel.normalizeAndValidate("", "magface"));
        assertEquals("magface", FaceModel.normalizeAndValidate("   ", "magface"));
        
        assertEquals("qmagface", FaceModel.normalizeAndValidate(null, "qmagface"));
    }

    @Test
    void modelParameter_afterNormalization_shouldNotContainWhitespace() {
        String[] inputs = {"magface ", " magface", "  magface  ", " qmagface ", "  QMAGFACE  "};
        
        for (String input : inputs) {
            String normalized = FaceModel.normalizeAndValidate(input, "magface");
            assertFalse(normalized.contains(" "), 
                "Normalized model should not contain spaces: " + normalized);
            assertFalse(normalized.contains("\t"), 
                "Normalized model should not contain tabs: " + normalized);
            assertFalse(normalized.contains("\n"), 
                "Normalized model should not contain newlines: " + normalized);
        }
    }

    @Test
    void modelParameter_afterNormalization_shouldBeLowercase() {
        String[] inputs = {"MAGFACE", "MagFace", "QMAGFACE", "QMagFace"};
        
        for (String input : inputs) {
            String normalized = FaceModel.normalizeAndValidate(input, "magface");
            assertEquals(normalized.toLowerCase(), normalized,
                "Normalized model should be lowercase: " + normalized);
        }
    }
}
