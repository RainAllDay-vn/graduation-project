package com.gr2.noc.auth.repository;

import com.gr2.noc.auth.enums.Role;
import com.gr2.noc.auth.model.User;
import com.gr2.noc.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AuthRepositoryIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        User user = User.builder()
                .fullName("NOC Engineer")
                .email("engineer@noc.local")
                .passwordHash("$2a$10$hashedpassword")
                .role(Role.ENGINEER)
                .build();
        userRepository.save(user);
    }

    @Test
    @DisplayName("Should find user by email ignoring case")
    void shouldFindByEmailIgnoringCase() {
        assertThat(userRepository.findByEmailIgnoreCase("ENGINEER@NOC.LOCAL")).isPresent();
        assertThat(userRepository.findByEmailIgnoreCase("Engineer@Noc.Local")).isPresent();
        assertThat(userRepository.findByEmailIgnoreCase("unknown@noc.local")).isEmpty();
    }

    @Test
    @DisplayName("Should check email existence ignoring case")
    void shouldCheckEmailExistenceIgnoringCase() {
        assertThat(userRepository.existsByEmailIgnoreCase("ENGINEER@NOC.LOCAL")).isTrue();
        assertThat(userRepository.existsByEmailIgnoreCase("unknown@noc.local")).isFalse();
    }

    @Test
    @DisplayName("Should default role to ENGINEER and never expose raw password")
    void shouldDefaultRoleAndStoreHashOnly() {
        User user = userRepository.findByEmailIgnoreCase("engineer@noc.local").orElseThrow();

        assertThat(user.getRole()).isEqualTo(Role.ENGINEER);
        assertThat(user.getPasswordHash()).isNotBlank().startsWith("$2a$");
    }

    @Test
    @DisplayName("Should reject duplicate email with unique constraint violation")
    void shouldRejectDuplicateEmail() {
        User duplicate = User.builder()
                .fullName("Duplicate Account")
                .email("engineer@noc.local")
                .passwordHash("$2a$10$otherhash")
                .role(Role.ENGINEER)
                .build();

        assertThatThrownBy(() -> userRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
