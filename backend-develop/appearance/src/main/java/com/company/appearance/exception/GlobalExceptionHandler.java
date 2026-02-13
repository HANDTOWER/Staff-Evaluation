package com.company.appearance.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.company.appearance.exception.face.FaceApiException;
import com.company.appearance.exception.face.FaceDetectionException;
import com.company.appearance.exception.face.InvalidFaceModelException;
import com.company.appearance.exception.face.PersonNotFoundException;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final ZoneId TIMEZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    public record ApiError(
            OffsetDateTime timestamp,
            int status,
            String error,
            String message,
            String path,
            Map<String, Object> details
    ) { }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> details = new HashMap<>();
        details.put("fieldErrors", fieldErrors);

        ApiError error = buildError(HttpStatus.BAD_REQUEST, "Validation failed", request, details);
        logger.warn("Validation failed for {}: {}", request.getRequestURI(), fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        Map<String, String> violations = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            violations.put(violation.getPropertyPath().toString(), violation.getMessage());
        }

        Map<String, Object> details = new HashMap<>();
        details.put("violations", violations);

        ApiError error = buildError(HttpStatus.BAD_REQUEST, "Constraint violation", request, details);
        logger.warn("Constraint violation for {}: {}", request.getRequestURI(), violations);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        ApiError error = buildError(HttpStatus.BAD_REQUEST, "Malformed JSON request", request, null);
        logger.warn("Malformed JSON for {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParameter(
            MissingServletRequestParameterException ex,
            HttpServletRequest request) {

        Map<String, Object> details = new HashMap<>();
        details.put("parameterName", ex.getParameterName());
        details.put("parameterType", ex.getParameterType());

        ApiError error = buildError(
                HttpStatus.BAD_REQUEST,
                "Missing required parameter: " + ex.getParameterName(),
                request,
                details
        );

        logger.warn("Missing parameter for {}: {}", request.getRequestURI(), ex.getParameterName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {

        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";

        Map<String, Object> details = new HashMap<>();
        details.put("parameterName", ex.getName());
        details.put("expectedType", requiredType);
        details.put("providedValue", ex.getValue());

        ApiError error = buildError(
                HttpStatus.BAD_REQUEST,
                "Parameter '%s' should be of type %s".formatted(ex.getName(), requiredType),
                request,
                details
        );

        logger.warn("Type mismatch for {}: {} expected {}", request.getRequestURI(), ex.getName(), requiredType);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        String message = ex.getMessage() != null ? ex.getMessage() : "Invalid argument";

        boolean isConflict = message.toLowerCase().contains("already exists")
                || message.toLowerCase().contains("duplicate")
                || message.toLowerCase().contains("conflict");

        HttpStatus status = isConflict ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;

        ApiError error = buildError(status, message, request, null);
        logger.warn("Illegal argument for {}: {}", request.getRequestURI(), message);
        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request) {

        // ✅ FIX HERE
        String supportedMethods = ex.getSupportedHttpMethods() != null
                ? String.join(", ", ex.getSupportedHttpMethods().stream().map(m -> m.name()).toList())
                : "unknown";

        Map<String, Object> details = new HashMap<>();
        details.put("method", ex.getMethod());
        details.put("supportedMethods", supportedMethods);

        ApiError error = buildError(
                HttpStatus.METHOD_NOT_ALLOWED,
                "HTTP method %s not supported for this endpoint".formatted(ex.getMethod()),
                request,
                details
        );

        logger.warn("Method not allowed for {}: {}", request.getRequestURI(), ex.getMethod());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(error);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex,
            HttpServletRequest request) {

        String supportedTypes = ex.getSupportedMediaTypes() != null
                ? String.join(", ", ex.getSupportedMediaTypes().stream().map(Object::toString).toList())
                : "unknown";

        Map<String, Object> details = new HashMap<>();
        details.put("contentType", ex.getContentType());
        details.put("supportedMediaTypes", supportedTypes);

        ApiError error = buildError(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type", request, details);
        logger.warn("Unsupported media type for {}: {}", request.getRequestURI(), ex.getContentType());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(error);
    }

    @ExceptionHandler({EntityNotFoundException.class, NoSuchElementException.class})
    public ResponseEntity<ApiError> handleNotFound(
            RuntimeException ex,
            HttpServletRequest request) {

        String message = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : "Resource not found";

        ApiError error = buildError(HttpStatus.NOT_FOUND, message, request, null);
        logger.warn("Resource not found for {}: {}", request.getRequestURI(), message);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrityViolation(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        String message = "Data integrity violation";
        String rootMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : null;

        if (rootMessage != null) {
            String lower = rootMessage.toLowerCase();
            if (lower.contains("unique constraint") || lower.contains("duplicate entry")) {
                message = "Duplicate entry: resource already exists";
            } else if (lower.contains("foreign key constraint")) {
                message = "Foreign key constraint violation";
            }
        }

        ApiError error = buildError(HttpStatus.CONFLICT, message, request, null);
        logger.warn("Data integrity violation for {}: {}", request.getRequestURI(), rootMessage);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationException(
            AuthenticationException ex,
            HttpServletRequest request) {

        ApiError error = buildError(HttpStatus.UNAUTHORIZED, "Authentication failed", request, null);
        logger.warn("Authentication failed for {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        ApiError error = buildError(HttpStatus.FORBIDDEN, "Access denied", request, null);
        logger.warn("Access denied for {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        ApiError error = buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", request, null);
        logger.error("Unhandled exception for {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private ApiError buildError(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, Object> details) {

        return new ApiError(
                OffsetDateTime.now(TIMEZONE),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                details
        );
    }

    // ==========================================
    // FACE MODULE EXCEPTIONS
    // ==========================================

    @ExceptionHandler(InvalidFaceModelException.class)
    public ResponseEntity<ApiError> handleInvalidFaceModelException(
            InvalidFaceModelException ex,
            HttpServletRequest request) {
        logger.warn("Invalid face model: {}", ex.getMessage());

        HttpStatus status = HttpStatus.BAD_REQUEST;
        Map<String, Object> details = new HashMap<>();
        details.put("error_type", "InvalidFaceModelException");
        details.put("allowed_values", new String[]{"magface", "qmagface"});
        
        ApiError error = new ApiError(
                OffsetDateTime.now(TIMEZONE),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI(),
                details
        );

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(PersonNotFoundException.class)
    public ResponseEntity<ApiError> handlePersonNotFoundException(
            PersonNotFoundException ex,
            HttpServletRequest request) {
        logger.warn("Person not found: {}", ex.getMessage());

        HttpStatus status = HttpStatus.NOT_FOUND;
        Map<String, Object> details = new HashMap<>();
        details.put("error_type", "PersonNotFoundException");
        
        ApiError error = new ApiError(
                OffsetDateTime.now(TIMEZONE),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI(),
                details
        );

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(FaceDetectionException.class)
    public ResponseEntity<ApiError> handleFaceDetectionException(
            FaceDetectionException ex,
            HttpServletRequest request) {
        logger.error("Face detection error: {}", ex.getMessage(), ex);

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        Map<String, Object> details = new HashMap<>();
        details.put("error_type", "FaceDetectionException");
        
        ApiError error = new ApiError(
                OffsetDateTime.now(TIMEZONE),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI(),
                details
        );

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(FaceApiException.class)
    public ResponseEntity<ApiError> handleFaceApiException(
            FaceApiException ex,
            HttpServletRequest request) {
        logger.error("Face API error: {}", ex.getMessage(), ex);

        // Map to 502 Bad Gateway since this is an external service error
        HttpStatus status = HttpStatus.BAD_GATEWAY;
        Map<String, Object> details = new HashMap<>();
        details.put("error_type", "FaceApiException");
        
        if (ex.getStatusCode() > 0) {
            details.put("api_status_code", ex.getStatusCode());
        }
        if (ex.getResponseBody() != null && !ex.getResponseBody().isEmpty()) {
            details.put("api_response", ex.getResponseBody());
        }

        ApiError error = new ApiError(
                OffsetDateTime.now(TIMEZONE),
                status.value(),
                status.getReasonPhrase(),
                "Face API error: " + ex.getMessage(),
                request.getRequestURI(),
                details
        );

        return ResponseEntity.status(status).body(error);
    }
}

