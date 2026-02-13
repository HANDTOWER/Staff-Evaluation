// Service class for handling employee-related business logic
package com.company.appearance.service;

import com.company.appearance.model.Employee;
import com.company.appearance.repository.EmployeeRepository;
import com.company.appearance.util.EmployeeIdGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

/**
 * EmployeeService provides business logic for managing employee data.
 */
@Service
public class EmployeeService {

    /**
     * Repository for accessing Employee entities in the database.
     */
    private final EmployeeRepository repository;

    /**
     * Constructor for injecting Employee dependencies.
     * @param repository the EmployeeRepository instance
     */
    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    /**
     * Retrieves all employee records.
     * @return a list of records
     */
    public List<Employee> getAll() {
        return repository.findAll();
    }

    /**
     * Retrieves an employee record by its identifier.
     * @param id the entity identifier
     * @return the matching record, or null if not found
     */
    public Employee getById(String id) {
        return repository.findById(id).orElse(null);
    }

    /**
     * Retrieves an employee record by the specified criteria.
     * @param name the name value
     * @return the matching record, or null if not found
     */
    public Employee getByName(String name) {
        return repository.findAll()
                .stream()
                .filter(e -> e.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElse(null);
    }

    /**
     * Finds all employees whose name contains the given search term (case-insensitive).
     * 
     * @param name the search term to match against employee names
     * @return a list of employees whose names contain the search term
     */
    public List<Employee> findByName(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }

    public List<Employee> findById(String id) {
        return repository.findByIdStartingWith(id);
    }
    /**
     * Creates a new employee record.
     * Automatically generates ID based on name.
     * @param employee the employee value
     * @return the created record
     */
    public Employee create(Employee employee) {
        // Generate unique ID from name
        String normalizedLastName = EmployeeIdGenerator.getNormalizedLastName(employee.getName());
        List<Employee> existingWithSameName = repository.findByIdStartingWith(normalizedLastName);
        int nextIdSequence = findNextSequence(existingWithSameName, normalizedLastName);
        String generatedId = EmployeeIdGenerator.generateId(employee.getName(), nextIdSequence);
        employee.setId(generatedId);

        return repository.save(employee);
    }

    /**
     * Finds the next available sequence number for a given prefix.
     * @param existing list of employees with the same prefix
     * @param prefix the prefix (e.g., "Phu")
     * @return the next sequence number
     */
    private int findNextSequence(List<Employee> existing, String prefix) {
        if (existing.isEmpty()) {
            return 1;
        }

        Pattern pattern = Pattern.compile("^" + Pattern.quote(prefix) + "(\\d+)$");
        int maxSequence = 0;

        for (Employee emp : existing) {
            String value = emp.getId();
            
            if (value != null) {
                Matcher matcher = pattern.matcher(value);
                if (matcher.matches()) {
                    int seq = Integer.parseInt(matcher.group(1));
                    maxSequence = Math.max(maxSequence, seq);
                }
            }
        }

        return maxSequence + 1;
    }

    /**
     * Deletes an employee by ID.
     * All related appearance evaluations will be automatically deleted due to cascade configuration.
     * 
     * @param id the employee ID to delete
     */
    @Transactional
    public void delete(String id){
        repository.deleteById(id);
    }

    /**
     * Updates an employee's information.
     * The ID remains unchanged regardless of name or department changes.
     * 
     * @param id the current employee ID (remains unchanged)
     * @param employee the updated employee data
     * @return the updated employee, or null if not found
     */
    @Transactional
    public Employee update(String id, Employee employee){
        Optional<Employee> existingEmployee = repository.findById(id);
        if (existingEmployee.isPresent()) {
            Employee updatedEmployee = existingEmployee.get();
            
            // Update employee fields (ID remains unchanged)
            updatedEmployee.setName(employee.getName());
            updatedEmployee.setDepartment(employee.getDepartment());
            updatedEmployee.setPosition(employee.getPosition());
            
            return repository.save(updatedEmployee);
        }
        else return null;
    }
}
