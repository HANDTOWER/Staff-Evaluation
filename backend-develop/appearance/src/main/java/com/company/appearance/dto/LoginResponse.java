// Data Transfer Object for LoginResponse
package com.company.appearance.dto;

/**
 * Data Transfer Object for login responses.
 * Contains JWT tokens, user role, and token expiration information.
 */
public class LoginResponse {
    /**
     * AccessToken field.
     */
    private String accessToken;
    /**
     * RefreshToken field.
     */
    private String refreshToken;
    /**
     * TokenType field.
     */
    private String tokenType;
    /**
     * Role field.
     */
    private String role;
    /**
     * ExpiresIn field.
     */
    private Long expiresIn;
    /**
     * RefreshExpiresIn field.
     */
    private Long refreshExpiresIn;

    /**
     * Default constructor.
     */
    /**
     * Constructor for injecting LoginResponse dependencies.
     */
    public LoginResponse() {
    }

    /**
     * Constructor with all fields.
     *
     * @param accessToken JWT access token for API authentication
     * @param refreshToken JWT refresh token for obtaining new access tokens
     * @param tokenType Type of token (typically "Bearer")
     * @param role User's role (ADMIN or EVALUATOR)
     * @param expiresIn Access token expiration time in seconds
     * @param refreshExpiresIn Refresh token expiration time in seconds
     */
    /**
     * Constructor for injecting LoginResponse dependencies.
     * @param accessToken the token value
     * @param refreshToken the token value
     * @param tokenType the token value
     * @param role the role value
     * @param expiresIn the expiresIn value
     * @param refreshExpiresIn the refreshExpiresIn value
     */
    public LoginResponse(String accessToken, String refreshToken, String tokenType, String role, Long expiresIn, Long refreshExpiresIn) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.role = role;
        this.expiresIn = expiresIn;
        this.refreshExpiresIn = refreshExpiresIn;
    }

    /**
     * Gets the access token.
     *
     * @return JWT access token
     */
    /**
     * Gets the accessToken.
     * @return the accessToken value
     */
    public String getAccessToken() {
        return accessToken;
    }

    /**
     * Sets the access token.
     *
     * @param accessToken Access token to set
     */
    /**
     * Sets the accessToken.
     * @param accessToken the token value
     */
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    /**
     * Gets the refresh token.
     *
     * @return JWT refresh token
     */
    /**
     * Gets the refreshToken.
     * @return the refreshToken value
     */
    public String getRefreshToken() {
        return refreshToken;
    }

    /**
     * Sets the refresh token.
     *
     * @param refreshToken Refresh token to set
     */
    /**
     * Sets the refreshToken.
     * @param refreshToken the token value
     */
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    /**
     * Gets the token type.
     *
     * @return Token type (typically "Bearer")
     */
    /**
     * Gets the tokenType.
     * @return the tokenType value
     */
    public String getTokenType() {
        return tokenType;
    }

    /**
     * Sets the token type.
     *
     * @param tokenType Token type to set
     */
    /**
     * Sets the tokenType.
     * @param tokenType the token value
     */
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    /**
     * Gets the user role.
     *
     * @return User's role
     */
    /**
     * Gets the role.
     * @return the role value
     */
    public String getRole() {
        return role;
    }

    /**
     * Sets the user role.
     *
     * @param role Role to set
     */
    /**
     * Sets the role.
     * @param role the role value
     */
    public void setRole(String role) {
        this.role = role;
    }

    /**
     * Gets the access token expiration time.
     *
     * @return Expiration time in seconds
     */
    /**
     * Gets the expiresIn.
     * @return the expiresIn value
     */
    public Long getExpiresIn() {
        return expiresIn;
    }

    /**
     * Sets the access token expiration time.
     *
     * @param expiresIn Expiration time in seconds
     */
    /**
     * Sets the expiresIn.
     * @param expiresIn the expiresIn value
     */
    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    /**
     * Gets the refresh token expiration time.
     *
     * @return Refresh token expiration time in seconds
     */
    /**
     * Gets the refreshExpiresIn.
     * @return the refreshExpiresIn value
     */
    public Long getRefreshExpiresIn() {
        return refreshExpiresIn;
    }

    /**
     * Sets the refresh token expiration time.
     *
     * @param refreshExpiresIn Refresh token expiration time in seconds
     */
    /**
     * Sets the refreshExpiresIn.
     * @param refreshExpiresIn the refreshExpiresIn value
     */
    public void setRefreshExpiresIn(Long refreshExpiresIn) {
        this.refreshExpiresIn = refreshExpiresIn;
    }
}
