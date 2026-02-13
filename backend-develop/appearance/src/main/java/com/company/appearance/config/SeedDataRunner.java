// Configuration component for SeedDataRunner
package com.company.appearance.config;

import com.company.appearance.model.Role;
import com.company.appearance.model.UserAccount;
import com.company.appearance.repository.UserAccountRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Component that seeds initial user data into the database on application startup.
 * Creates default admin and evaluator accounts if they don't already exist.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class SeedDataRunner implements CommandLineRunner {

    /**
     * Repository for accessing UserAccount entities in the database.
     */
    private final UserAccountRepository userAccountRepository;
    /**
     * PasswordEncoder field.
     */
    private final PasswordEncoder passwordEncoder;


    @Value("${app.seed.admin.username}")
    private String adminUsername;

    @Value("${app.seed.admin.password}")
    private String adminPassword;

    @Value("${app.seed.evaluator.username}")
    private String evaluatorUsername;

    @Value("${app.seed.evaluator.password}")
    private String evaluatorPassword;

    /**
     * Constructor for SeedDataRunner.
     *
     * @param userAccountRepository Repository for user account operations
     * @param passwordEncoder Encoder for hashing passwords
     */
    /**
     * Constructor for injecting SeedDataRunner dependencies.
     * @param userAccountRepository the UserAccountRepository instance
     * @param passwordEncoder the passwordEncoder value
     */
    public SeedDataRunner(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Executes seed data logic when the application starts.
     * Creates default admin and evaluator user accounts with hashed passwords
     * if they don't already exist in the database.
     *
     * @param args Command line arguments
     */
    /**
     * Seeds initial data into the database at application startup.
     * @param args the args value
     */
    @Override
    public void run(String... args) {
        // Create admin user if it doesn't exist
        if (userAccountRepository.findByUsername(adminUsername).isEmpty()) {
            UserAccount admin = new UserAccount();
            admin.setUsername(adminUsername);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            userAccountRepository.save(admin);
        }

        // Create evaluator user if it doesn't exist
        if (userAccountRepository.findByUsername(evaluatorUsername).isEmpty()) {
            UserAccount evaluator = new UserAccount();
            evaluator.setUsername(evaluatorUsername);
            evaluator.setPasswordHash(passwordEncoder.encode(evaluatorPassword));
            evaluator.setRole(Role.EVALUATOR);
            userAccountRepository.save(evaluator);
        }
    }
}
