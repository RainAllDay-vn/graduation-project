package com.gr2.noc.auth.dto.create;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record SignupRequest(
    @NotBlank(message = "Full name must not be blank")
    String fullName,

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be valid")
    String email,

    @NotBlank(message = "Password must not be blank")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password
) {
}
