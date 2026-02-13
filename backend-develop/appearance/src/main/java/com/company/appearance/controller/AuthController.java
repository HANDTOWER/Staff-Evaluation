package com.company.appearance.controller;

import com.company.appearance.dto.LoginRequest;
import com.company.appearance.dto.LoginResponse;
import com.company.appearance.dto.RefreshTokenRequest;
import com.company.appearance.dto.RegisterRequest;
import com.company.appearance.dto.RegisterResponse;
import com.company.appearance.service.AuthenticationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller handling authentication endpoints.
 * Part of the controller layer - handles HTTP requests/responses and delegates business logic to services.
 * 
 * Layered Architecture:
 * - Controller layer (this class): HTTP/REST concerns, request validation, response formatting
 * - Service layer (AuthenticationService): Business logic, orchestration
 * - Security layer (filters, configs): Cross-cutting security concerns
 * - Repository/Model layer: Data persistence
 * 
 * This keeps controllers thin and focused on HTTP protocol details.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and user registration endpoints")
public class AuthController {

    private final AuthenticationService authenticationService;

    /**
     * Constructor for dependency injection.
     *
     * @param authenticationService Service for authentication operations
     */
    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    /**
     * Authenticates a user and generates JWT access and refresh tokens.
     * Public endpoint - no authentication required.
     *
     * @param request Login request containing username and password
     * @return ResponseEntity with LoginResponse (tokens, role, expiration) or 401 if authentication fails
     */
    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Validates credentials and returns JWT tokens")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authenticationService.login(request);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            // Authentication failed - invalid credentials
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Refreshes access and refresh tokens using a valid refresh token.
     * Public endpoint - no authentication required (uses refresh token for validation).
     *
     * @param request Refresh token request containing the refresh token
     * @return ResponseEntity with new LoginResponse or 401 if refresh token is invalid
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh tokens", description = "Generates new access and refresh tokens using a valid refresh token")
    public ResponseEntity<LoginResponse> refresh(@RequestBody RefreshTokenRequest request) {
        try {
            LoginResponse response = authenticationService.refresh(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // Invalid or expired refresh token
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Registers a new user account with EVALUATOR role.
     * Public endpoint - allows anyone to create an account.
     * New users are always assigned EVALUATOR role (not ADMIN).
     *
     * @param request Registration request containing username and password
     * @return ResponseEntity with RegisterResponse (id, username, role) or error status
     */
    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates a new user account with EVALUATOR role")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            RegisterResponse response = authenticationService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // Validation failed or username exists
            String message = e.getMessage();
            if (message != null && message.contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }
    }
}
