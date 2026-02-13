package com.company.appearance.service;

import com.company.appearance.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

/**
 * Service for JWT token operations including generation, validation, and extraction.
 * Part of the service layer - handles JWT-specific business logic.
 * 
 * Architecture: This service is responsible for:
 * - Generating access tokens (short-lived, for API authentication)
 * - Generating refresh tokens (long-lived, for obtaining new access tokens)
 * - Validating tokens (signature, expiration, type)
 * - Extracting claims (username, role, type)
 * 
 * Token Types:
 * - access: Used for authenticating API requests (validated by JwtAuthenticationFilter)
 * - refresh: Used only for /api/auth/refresh endpoint (cannot be used for API access)
 * 
 * Security:
 * - Algorithm: HS512 (HMAC-SHA512)
 * - Secret key must be at least 512 bits (64 bytes) for HS512
 * - Configure in application-dev.properties: app.jwt.secret=<long-random-string>
 */
@Service
public class JwtService {

    private final JwtProperties jwtProperties;

    /**
     * Constructor for dependency injection.
     *
     * @param jwtProperties JWT configuration properties
     */
    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    /**
     * Generates a secret key from the configured secret string for signing JWT tokens.
     *
     * @return SecretKey for HMAC-SHA signing
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a JWT access token for a user.
     * Access tokens have a shorter expiration time and are used for API authentication.
     *
     * @param username Username to include in the token
     * @param role User role to include in the token
     * @return JWT access token string
     */
    public String generateAccessToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getExpirationSeconds() * 1000);

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Generates a JWT refresh token for a user.
     * Refresh tokens have a longer expiration time and are used to obtain new access tokens.
     *
     * @param username Username to include in the token
     * @param role User role to include in the token
     * @return JWT refresh token string
     */
    public String generateRefreshToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getRefreshExpirationSeconds() * 1000);

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts the username (subject) from a JWT token.
     *
     * @param token JWT token string
     * @return Username extracted from token
     */
    /**
     * Performs a security-related operation.
     * @param token the token value
     * @return String result
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the role claim from a JWT token.
     *
     * @param token JWT token string
     * @return Role string extracted from token
     */
    /**
     * Performs a security-related operation.
     * @param token the token value
     * @return String result
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Extracts the type claim from a JWT token (access or refresh).
     *
     * @param token JWT token string
     * @return Token type string ("access" or "refresh")
     */
    /**
     * Performs a security-related operation.
     * @param token the token value
     * @return String result
     */
    public String extractType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    /**
     * Extracts the expiration date from a JWT token.
     *
     * @param token JWT token string
     * @return Expiration date
     */
    /**
     * Performs a security-related operation.
     * @param token the token value
     * @return Date result
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic method to extract a claim from a JWT token using a claims resolver function.
     *
     * @param token JWT token string
     * @param claimsResolver Function to extract specific claim from Claims object
     * @param <T> Type of the claim to extract
     * @return Extracted claim value
     */
    /**
     * Performs a security-related operation.
     * @param token the token value
     * @param claimsResolver the claimsResolver value
     * @return <T> T result
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from a JWT token after verifying its signature.
     *
     * @param token JWT token string
     * @return Claims object containing all token claims
     */
    /**
     * Performs a security-related operation.
     * @param token the token value
     * @return Claims result
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Validates an access token.
     * Checks if the token is properly signed, not expired, and is of type "access".
     *
     * @param token JWT token string to validate
     * @return true if token is valid, false otherwise
     */
    /**
     * Validates the provided token or security context.
     * @param token the token value
     * @return boolean result
     */
    public boolean validateToken(String token) {
        return validateTokenType(token, "access");
    }

    /**
     * Validates a refresh token.
     * Checks if the token is properly signed, not expired, and is of type "refresh".
     *
     * @param token JWT token string to validate
     * @return true if token is valid, false otherwise
     */
    /**
     * Validates the provided token or security context.
     * @param token the token value
     * @return boolean result
     */
    public boolean validateRefreshToken(String token) {
        return validateTokenType(token, "refresh");
    }

    /**
     * Validates a token of a specific type (access or refresh).
     * Verifies token signature, expiration, and type claim.
     *
     * @param token JWT token string to validate
     * @param expectedType Expected token type ("access" or "refresh")
     * @return true if token is valid and matches expected type, false otherwise
     */
    /**
     * Validates the provided token or security context.
     * @param token the token value
     * @param expectedType the expectedType value
     * @return boolean result
     */
    private boolean validateTokenType(String token, String expectedType) {
        try {
            Claims claims = extractAllClaims(token);
            String type = claims.get("type", String.class);
            // Allow tokens without type claim for backward compatibility (treat as access)
            if (type == null && "access".equals(expectedType)) {
                return !isTokenExpired(token);
            }
            if (type == null || !expectedType.equals(type)) {
                return false;
            }
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Checks if a JWT token has expired.
     *
     * @param token JWT token string to check
     * @return true if token is expired, false otherwise
     */
    /**
     * Validates the provided token or security context.
     * @param token the token value
     * @return boolean result
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
