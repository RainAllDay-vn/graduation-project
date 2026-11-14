package com.gr2.noc.auth.dto.get;

import com.gr2.noc.auth.enums.Role;
import com.gr2.noc.auth.model.User;
import lombok.Builder;

import java.time.Instant;

@Builder
public record UserDetails(
    Long id,
    String fullName,
    String email,
    Role role,
    Instant createdAt
) {
    public static UserDetails from(User user) {
        if (user == null) {
            return null;
        }
        return UserDetails.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
