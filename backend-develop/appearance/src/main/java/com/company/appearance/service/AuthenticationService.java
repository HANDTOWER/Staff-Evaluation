package com.company.appearance.service;

import com.company.appearance.config.JwtProperties;
import com.company.appearance.dto.LoginRequest;
import com.company.appearance.dto.LoginResponse;
import com.company.appearance.dto.RefreshTokenRequest;
import com.company.appearance.dto.RegisterRequest;
import com.company.appearance.dto.RegisterResponse;
import com.company.appearance.model.Role;
import com.company.appearance.model.UserAccount;
import com.company.appearance.repository.UserAccountRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service layer for authentication operations.
 * Handles business logic for login, registration, and token refresh.
 * 
 * Architecture: This is the service layer that orchestrates authentication flows.
 * Controllers delegate to this service to keep them thin and focused on HTTP concerns.
 * This service coordinates between AuthenticationManager, JwtService, and repositories.
 */
@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;

    /**
     * Constructor for dependency injection.
     *
     * @param authenticationManager Spring Security authentication manager
     * @param jwtService Service for JWT token operations
     * @param userAccountRepository Repository for user account persistence
     * @param passwordEncoder BCrypt password encoder
     * @param jwtProperties JWT configuration properties
     */
    public AuthenticationService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            JwtProperties jwtProperties) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProperties = jwtProperties;
    }

    /**
     * Authenticates a user and generates JWT tokens.
     * Uses Spring Security's AuthenticationManager backed by UserDetailsService.
     *
     * @param request Login credentials
     * @return LoginResponse with access token, refresh token, and user info
     * @throws AuthenticationException If credentials are invalid
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // Authenticate using Spring Security (delegates to UserDetailsService + BCrypt)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Retrieve user account from database
        UserAccount userAccount = userAccountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // Generate JWT tokens
        String role = userAccount.getRole().name();
        String accessToken = jwtService.generateAccessToken(userAccount.getUsername(), role);
        String refreshToken = jwtService.generateRefreshToken(userAccount.getUsername(), role);

        // Build response
        return new LoginResponse(
                accessToken,
                refreshToken,
                "Bearer",
                role,
                jwtProperties.getExpirationSeconds(),
                jwtProperties.getRefreshExpirationSeconds()
        );
    }

    /**
     * Refreshes access and refresh tokens using a valid refresh token.
     * Validates the refresh token and generates new token pair.
     *
     * @param request Refresh token request
     * @return LoginResponse with new tokens
     * @throws IllegalArgumentException If refresh token is invalid or user not found
     */
    @Transactional(readOnly = true)
    public LoginResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Validate refresh token
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        if (!jwtService.validateRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        // Extract username and verify type
        String username = jwtService.extractUsername(refreshToken);
        String tokenType = jwtService.extractType(refreshToken);

        if (!"refresh".equals(tokenType)) {
            throw new IllegalArgumentException("Token is not a refresh token");
        }

        // Verify user still exists
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Generate new token pair
        String role = userAccount.getRole().name();
        String newAccessToken = jwtService.generateAccessToken(username, role);
        String newRefreshToken = jwtService.generateRefreshToken(username, role);

        // Build response
        return new LoginResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                role,
                jwtProperties.getExpirationSeconds(),
                jwtProperties.getRefreshExpirationSeconds()
        );
    }

    /**
     * Registers a new user account with EVALUATOR role.
     * Public registration always creates EVALUATOR accounts (not ADMIN).
     *
     * @param request Registration details
     * @return RegisterResponse with created user info
     * @throws IllegalArgumentException If validation fails or username already exists
     */
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        // Validate input
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (request.getUsername().length() < 3 || request.getUsername().length() > 50) {
            throw new IllegalArgumentException("Username must be between 3 and 50 characters");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        // Check username uniqueness
        if (userAccountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Create new user account (always EVALUATOR for public registration)
        UserAccount newUser = new UserAccount();
        newUser.setUsername(request.getUsername());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(Role.EVALUATOR);

        // Save to database
        UserAccount saved = userAccountRepository.save(newUser);

        // Build response
        return new RegisterResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getRole().name()
        );
    }
}
