// Repository interface for Employee persistence operations
package com.company.appearance.repository;

import com.company.appearance.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * EmployeeRepository provides persistence operations for Employee entities.
 */
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    
    /**
     * Finds employees by their name (case-insensitive).
     * 
     * @param name the name to search for
     * @return a list of employees matching the given name
     */
    List<Employee> findByNameContainingIgnoreCase(String name);

    /**
     * Finds all employees whose ID starts with the given prefix.
     * Used to find the next sequence number for ID generation.
     * 
     * @param idPrefix the ID prefix (e.g., "Phu")
     * @return a list of employees with IDs starting with the prefix
     */
    List<Employee> findByIdStartingWith(String idPrefix);
}

