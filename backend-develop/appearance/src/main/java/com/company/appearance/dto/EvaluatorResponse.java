// Data Transfer Object for Evaluator Response
package com.company.appearance.dto;

/**
 * Response DTO for evaluator account information.
 * Used to return evaluator details without exposing sensitive password information.
 */
public class EvaluatorResponse {

    private Long id;
    private String username;
    private String role;

    public EvaluatorResponse() {
    }

    public EvaluatorResponse(Long id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
