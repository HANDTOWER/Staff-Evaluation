// Data Transfer Object for UpdateEmployeeRequest
package com.company.appearance.dto;

/**
 * UpdateEmployeeRequest is a Data Transfer Object used in API requests for updating employees.
 */
public class UpdateEmployeeRequest {

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
     * Constructor for injecting UpdateEmployeeRequest dependencies.
     */
    public UpdateEmployeeRequest() {
    }

    /**
     * Constructor with all fields.
     * @param name the name value
     * @param department the department value
     * @param position the position value
     */
    public UpdateEmployeeRequest(String name, String department, String position) {
        this.name = name;
        this.department = department;
        this.position = position;
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

    /**
     * Sets the name.
     * @param name the name value
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Sets the department.
     * @param department the department value
     */
    public void setDepartment(String department) {
        this.department = department;
    }

    /**
     * Sets the position.
     * @param position the position value
     */
    public void setPosition(String position) {
        this.position = position;
    }
}
