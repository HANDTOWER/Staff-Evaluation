package com.company.appearance.service;

import com.company.appearance.model.UserAccount;
import com.company.appearance.repository.UserAccountRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

/**
 * UserDetailsService implementation for Spring Security authentication.
 * Loads user details from the database for authentication purposes.
 * 
 * Part of the service layer - handles user authentication data retrieval.
 * Works in conjunction with DaoAuthenticationProvider to authenticate users.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    /**
     * Constructor for dependency injection.
     *
     * @param userAccountRepository Repository for accessing user accounts
     */
    public UserDetailsServiceImpl(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    /**
     * Loads user details by username for authentication.
     * Required by Spring Security's authentication mechanism.
     *
     * @param username The username to search for
     * @return UserDetails containing username, password, and authorities
     * @throws UsernameNotFoundException If user is not found in database
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Query database for user account
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Map role to Spring Security authority (must prefix with "ROLE_")
        Collection<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + userAccount.getRole().name())
        );

        // Return Spring Security UserDetails object
        // password is the BCrypt hash stored in database
        return new User(
                userAccount.getUsername(),
                userAccount.getPasswordHash(),
                authorities
        );
    }
}
