// Entity model representing Employee
package com.company.appearance.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Employee represents a persistent entity in the application domain.
 */
@Entity
@Table(name = "employees")
public class Employee {

    /**
     * Id field - generated from last name (e.g., Phu01, Phu02).
     */
    @Id
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
     * List of appearance evaluations for this employee.
     * When employee is deleted, all related evaluations are automatically deleted.
     */
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AppearanceEvaluation> evaluations = new ArrayList<>();

    /**
     * Constructor for injecting Employee dependencies.
     */
    public Employee() {
    }

    /**
     * Constructor for injecting Employee dependencies.
     * @param id the entity identifier
     * @param name the name value
     * @param department the department value
     * @param position the position value
     */
    public Employee(String id, String name, String department, String position) {
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

    /**
     * Sets the id.
     * @param id the entity identifier
     */
    public void setId(String id) {
        this.id = id;
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
