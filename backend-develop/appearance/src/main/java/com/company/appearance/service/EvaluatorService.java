// Service class for managing evaluator accounts
package com.company.appearance.service;

import com.company.appearance.model.Role;
import com.company.appearance.model.UserAccount;
import com.company.appearance.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * EvaluatorService provides business logic for managing evaluator accounts.
 * Only accessible by ADMIN role.
 */
@Service
public class EvaluatorService {

    private final UserAccountRepository userAccountRepository;

    public EvaluatorService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    /**
     * Retrieves all evaluator accounts from the system.
     * 
     * @return List of all user accounts with EVALUATOR role
     */
    public List<UserAccount> getAllEvaluators() {
        return userAccountRepository.findByRole(Role.EVALUATOR);
    }

    /**
     * Deletes an evaluator account by ID.
     * Only allows deletion of EVALUATOR role accounts, not ADMIN accounts.
     * 
     * @param id The evaluator account ID to delete
     * @throws IllegalArgumentException if the account is not found or is not an evaluator
     */
    @Transactional
    public void deleteEvaluator(Long id) {
        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evaluator not found with ID: " + id));
        
        // Security check: Only allow deletion of EVALUATOR accounts
        if (user.getRole() != Role.EVALUATOR) {
            throw new IllegalArgumentException("Cannot delete account with ID " + id + ": Not an evaluator account");
        }
        
        userAccountRepository.deleteById(id);
    }

    /**
     * Gets an evaluator by ID.
     * 
     * @param id The evaluator ID
     * @return The evaluator account
     * @throws IllegalArgumentException if not found or not an evaluator
     */
    public UserAccount getEvaluatorById(Long id) {
        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evaluator not found with ID: " + id));
        
        if (user.getRole() != Role.EVALUATOR) {
            throw new IllegalArgumentException("Account with ID " + id + " is not an evaluator");
        }
        
        return user;
    }
}
