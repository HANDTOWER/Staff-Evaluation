package com.company.appearance.dto;

/**
 * Data Transfer Object for user registration responses.
 * Contains information about the newly created user account.
 * 
 * Part of the DTO layer - defines API contract for registration response.
 */
public class RegisterResponse {

    private Long id;
    private String username;
    private String role;

    /**
     * Default constructor.
     */
    public RegisterResponse() {
    }

    /**
     * Constructor with all fields.
     *
     * @param id User account ID
     * @param username Username
     * @param role User role (ADMIN or EVALUATOR)
     */
    public RegisterResponse(Long id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    /**
     * Gets the user ID.
     *
     * @return User account ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the user ID.
     *
     * @param id User account ID to set
     */
    public void setId(Long id) {
        this.id = id;
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
     * Gets the role.
     *
     * @return Role string (ADMIN or EVALUATOR)
     */
    public String getRole() {
        return role;
    }

    /**
     * Sets the role.
     *
     * @param role Role to set
     */
    public void setRole(String role) {
        this.role = role;
    }
}
