package com.gr2.noc.auth.service;

import com.gr2.noc.auth.dto.create.SignupRequest;
import com.gr2.noc.auth.dto.get.UserDetails;
import com.gr2.noc.auth.enums.Role;
import com.gr2.noc.auth.model.User;
import com.gr2.noc.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDetails signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with email " + email + " already exists"
            );
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.ENGINEER)
                .build();

        User saved = userRepository.save(user);
        return UserDetails.from(saved);
    }

    @Override
    public UserDetails getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(UserDetails::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "No authenticated account for email " + email
                ));
    }
}
