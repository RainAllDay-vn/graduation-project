package com.gr2.noc.auth.repository;

import com.gr2.noc.auth.enums.Role;
import com.gr2.noc.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AuthRepositoryIntegrationTest {

    private static final AtomicInteger COUNTER = new AtomicInteger();

    @Autowired
    private UserRepository userRepository;

    private String email;

    @BeforeEach
    void setUp() {
        email = "engineer-" + COUNTER.incrementAndGet() + "-" + System.nanoTime() + "@noc.test";
        User user = User.builder()
                .fullName("NOC Engineer")
                .email(email)
                .passwordHash("$2a$10$hashedpassword")
                .role(Role.ENGINEER)
                .build();
        userRepository.save(user);
    }

    @Test
    @DisplayName("Should find user by email ignoring case")
    void shouldFindByEmailIgnoringCase() {
        assertThat(userRepository.findByEmailIgnoreCase(email.toUpperCase())).isPresent();

        String mixedCase = Character.toUpperCase(email.charAt(0)) + email.substring(1);
        assertThat(userRepository.findByEmailIgnoreCase(mixedCase)).isPresent();
        assertThat(userRepository.findByEmailIgnoreCase("unknown-" + System.nanoTime() + "@noc.test")).isEmpty();
    }

    @Test
    @DisplayName("Should check email existence ignoring case")
    void shouldCheckEmailExistenceIgnoringCase() {
        assertThat(userRepository.existsByEmailIgnoreCase(email.toUpperCase())).isTrue();
        assertThat(userRepository.existsByEmailIgnoreCase("unknown-" + System.nanoTime() + "@noc.test")).isFalse();
    }

    @Test
    @DisplayName("Should default role to ENGINEER and never expose raw password")
    void shouldDefaultRoleAndStoreHashOnly() {
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();

        assertThat(user.getRole()).isEqualTo(Role.ENGINEER);
        assertThat(user.getPasswordHash()).isNotBlank().startsWith("$2a$");
    }

    @Test
    @DisplayName("Should reject duplicate email with unique constraint violation")
    void shouldRejectDuplicateEmail() {
        User duplicate = User.builder()
                .fullName("Duplicate Account")
                .email(email)
                .passwordHash("$2a$10$otherhash")
                .role(Role.ENGINEER)
                .build();

        assertThatThrownBy(() -> userRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
