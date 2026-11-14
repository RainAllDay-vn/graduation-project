package com.gr2.noc.auth.service;

import com.gr2.noc.auth.dto.create.SignupRequest;
import com.gr2.noc.auth.dto.get.UserDetails;

/**
 * Service contract for account management (signup) and current user lookup.
 * Login/logout are handled by the authentication flow in AuthController.
 */
public interface AuthService {

    /**
     * Register a new engineer account. Password is stored as a BCrypt hash.
     * Throws 409 Conflict if the email is already taken.
     */
    UserDetails signup(SignupRequest request);

    /**
     * Look up a user by email for the /me endpoint.
     * Throws 401 Unauthorized if no account matches.
     */
    UserDetails getUserByEmail(String email);
}
