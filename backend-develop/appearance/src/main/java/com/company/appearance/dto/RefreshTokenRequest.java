// Data Transfer Object for RefreshTokenRequest
package com.company.appearance.dto;

/**
 * Data Transfer Object for refresh token requests.
 * Contains the refresh token used to obtain new access and refresh tokens.
 */
public class RefreshTokenRequest {
    /**
     * RefreshToken field.
     */
    private String refreshToken;

    /**
     * Default constructor.
     */
    /**
     * Constructor for injecting RefreshTokenRequest dependencies.
     */
    public RefreshTokenRequest() {
    }

    /**
     * Constructor with refresh token.
     *
     * @param refreshToken The refresh token to use for generating new tokens
     */
    /**
     * Constructor for injecting RefreshTokenRequest dependencies.
     * @param refreshToken the token value
     */
    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    /**
     * Gets the refresh token.
     *
     * @return Refresh token string
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
}