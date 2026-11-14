package com.gr2.noc.auth.controller;

import com.gr2.noc.auth.dto.create.LoginRequest;
import com.gr2.noc.auth.dto.create.SignupRequest;
import com.gr2.noc.auth.dto.get.UserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API Contract for NOC engineer accounts: signup, login, logout and session introspection.
 * Uses HTTP session (JSESSIONID cookie) for authentication state.
 */
@RequestMapping("/api/auth")
public interface AuthApi {

    /**
     * Register a new engineer account.
     * Returns 409 Conflict if the email is already registered.
     */
    @PostMapping("/signup")
    ResponseEntity<UserDetails> signup(@Valid @RequestBody SignupRequest request);

    /**
     * Authenticate with email and password. Creates an HTTP session on success.
     * Returns 401 Unauthorized for invalid credentials.
     */
    @PostMapping("/login")
    ResponseEntity<UserDetails> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest, HttpServletResponse response);

    /**
     * Invalidate the current session.
     */
    @PostMapping("/logout")
    ResponseEntity<Void> logout(HttpServletRequest request);

    /**
     * Return the currently authenticated account, or 401 when no session is active.
     */
    @GetMapping("/me")
    ResponseEntity<UserDetails> me();
}
