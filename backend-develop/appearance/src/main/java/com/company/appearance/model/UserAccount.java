// Entity model representing representing
package com.company.appearance.model;

import jakarta.persistence.*;

/**
 * Entity class representing a user account in the system.
 * Stores user authentication information including username, hashed password, and role.
 */
@Entity
@Table(name = "user_accounts")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * Default constructor.
     */
    public UserAccount() {
    }

    /**
     * Constructor with all fields.
     *
     * @param id User account ID
     * @param username Username for login
     * @param passwordHash Hashed password
     * @param role User role (ADMIN or EVALUATOR)
     */
    public UserAccount(Long id, String username, String passwordHash, Role role) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    /**
     * Gets the user account ID.
     *
     * @return User account ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the user account ID.
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
     * Gets the hashed password.
     *
     * @return Hashed password string
     */
    public String getPasswordHash() {
        return passwordHash;
    }

    /**
     * Sets the hashed password.
     *
     * @param passwordHash Hashed password to set
     */
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    /**
     * Gets the user role.
     *
     * @return User role (ADMIN or EVALUATOR)
     */
    public Role getRole() {
        return role;
    }

    /**
     * Sets the user role.
     *
     * @param role Role to set
     */
    public void setRole(Role role) {
        this.role = role;
    }
}
