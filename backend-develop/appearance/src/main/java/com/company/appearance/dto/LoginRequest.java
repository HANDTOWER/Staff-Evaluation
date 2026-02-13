// Data Transfer Object for LoginRequest
package com.company.appearance.dto;

/**
 * Data Transfer Object for login requests.
 * Contains user credentials (username and password) for authentication.
 */
public class LoginRequest {
    /**
     * Username field.
     */
    private String username;
    /**
     * Password field.
     */
    private String password;

    /**
     * Default constructor.
     */
    /**
     * Constructor for injecting LoginRequest dependencies.
     */
    public LoginRequest() {
    }

    /**
     * Constructor with username and password.
     *
     * @param username User's username
     * @param password User's password
     */
    /**
     * Constructor for injecting LoginRequest dependencies.
     * @param username the username value
     * @param password the password value
     */
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    /**
     * Gets the username.
     *
     * @return Username string
     */
    /**
     * Gets the username.
     * @return the username value
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the username.
     *
     * @param username Username to set
     */
    /**
     * Sets the username.
     * @param username the username value
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Gets the password.
     *
     * @return Password string
     */
    /**
     * Gets the password.
     * @return the password value
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password.
     *
     * @param password Password to set
     */
    /**
     * Sets the password.
     * @param password the password value
     */
    public void setPassword(String password) {
        this.password = password;
    }
}
