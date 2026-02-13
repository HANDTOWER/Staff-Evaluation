package com.company.appearance.dto;

/**
 * Data Transfer Object for user registration requests.
 * Contains username and password for creating new user accounts.
 * 
 * Part of the DTO layer - defines API contract for registration endpoint.
 */
public class RegisterRequest {

    private String username;
    private String password;

    /**
     * Default constructor.
     */
    public RegisterRequest() {
    }

    /**
     * Constructor with all fields.
     *
     * @param username Desired username
     * @param password Desired password
     */
    public RegisterRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    /**
     * Gets the username.
     *
     * @return Username string
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the username.
     *
     * @param username Username to set
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Gets the password.
     *
     * @return Password string
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password.
     *
     * @param password Password to set
     */
    public void setPassword(String password) {
        this.password = password;
    }
}
