// Data Transfer Object for CreateEmployeeRequest
package com.company.appearance.dto;

/**
 * CreateEmployeeRequest is a Data Transfer Object used in API requests and responses.
 */
public class CreateEmployeeRequest {

    /**
     * EmployeeCode field.
     */
    // private String employeeCode;
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
     * Constructor for injecting CreateEmployeeRequest dependencies.
     */
    public CreateEmployeeRequest() {
    }

    /**
     * Gets the employeeCode.
     * @return the employeeCode value
     */
    // public String getEmployeeCode() {
    //     return employeeCode;
    // }

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
     * Sets the employeeCode.
     * @param employeeCode the employeeCode value
     */
    // public void setEmployeeCode(String employeeCode) {
    //     this.employeeCode = employeeCode;
    // }

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
