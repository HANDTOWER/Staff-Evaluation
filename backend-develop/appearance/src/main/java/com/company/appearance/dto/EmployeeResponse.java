// Data Transfer Object for EmployeeResponse
package com.company.appearance.dto;

/**
 * EmployeeResponse is a Data Transfer Object used in API requests and responses.
 */
public class EmployeeResponse {

    /**
     * Id field.
     */
    private String id;
    /**
     * Name field.
     */
    private String name;
    /**
     * Department field.
     */
    private String department;
    /**
     * Position field.
     */
    private String position;

    /**
     * Constructor for injecting EmployeeResponse dependencies.
     */
    public EmployeeResponse() {
    }

    public EmployeeResponse(String id, String name,
            String department, String position) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.position = position;
    }

    /**
     * Gets the id.
     * @return the id value
     */
    public String getId() {
        return id;
    }

    /**
     * Gets the name.
     * @return the name value
     */
    public String getName() {
        return name;
    }

    /**
     * Gets the department.
     * @return the department value
     */
    public String getDepartment() {
        return department;
    }

    /**
     * Gets the position.
     * @return the position value
     */
    public String getPosition() {
        return position;
    }
}
