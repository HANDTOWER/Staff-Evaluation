// Repository interface for for persistence operations
package com.company.appearance.repository;

import com.company.appearance.model.Role;
import com.company.appearance.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserAccount entity operations.
 * Provides data access methods for user account management.
 */
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    /**
     * Finds a user account by username.
     *
     * @param username The username to search for
     * @return Optional containing the UserAccount if found, empty otherwise
     */
    Optional<UserAccount> findByUsername(String username);
    
    /**
     * Finds all user accounts with a specific role.
     *
     * @param role The role to filter by
     * @return List of user accounts with the specified role
     */
    List<UserAccount> findByRole(Role role);
}
