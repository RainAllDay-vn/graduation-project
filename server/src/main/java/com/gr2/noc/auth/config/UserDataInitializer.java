package com.gr2.noc.auth.config;

import com.gr2.noc.auth.enums.Role;
import com.gr2.noc.auth.model.User;
import com.gr2.noc.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds demo NOC accounts on application startup (dev profile only).
 */
@Component
@Profile("dev")
@Order(0)
@RequiredArgsConstructor
@Slf4j
public class UserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("User seed data already exists ({} records). Skipping initialization.", userRepository.count());
            return;
        }

        log.info("Seeding initial NOC user accounts...");

        User admin = User.builder()
                .fullName("NOC Administrator")
                .email("admin@noc.local")
                .passwordHash(passwordEncoder.encode("admin12345"))
                .role(Role.ADMIN)
                .build();

        User engineer = User.builder()
                .fullName("NOC Engineer")
                .email("engineer@noc.local")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.ENGINEER)
                .build();

        userRepository.saveAll(List.of(admin, engineer));
        log.info("Successfully seeded 2 NOC user accounts (admin@noc.local, engineer@noc.local).");
    }
}
