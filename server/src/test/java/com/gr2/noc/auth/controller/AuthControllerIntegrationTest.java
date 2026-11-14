package com.gr2.noc.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.auth.dto.create.LoginRequest;
import com.gr2.noc.auth.dto.create.SignupRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String EMAIL = "signup.test@noc.local";
    private static final String PASSWORD = "password123";

    private MvcResult performSignup(String email) throws Exception {
        SignupRequest request = SignupRequest.builder()
                .fullName("Test Engineer")
                .email(email)
                .password(PASSWORD)
                .build();

        return mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
    }

    private MockHttpSession performLogin(String email, String password) throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email(email)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) result.getRequest().getSession(false);
    }

    @Nested
    @DisplayName("POST /api/auth/signup")
    class SignupTests {

        @Test
        @DisplayName("Should return 201 Created with user details and no password hash")
        void shouldSignupSuccessfully() throws Exception {
            MvcResult result = performSignup(EMAIL);

            String body = result.getResponse().getContentAsString();

            assertThat(body).contains("\"role\":\"ENGINEER\"");
            assertThat(body).contains("\"email\":\"" + EMAIL + "\"");
            assertThat(body).doesNotContain("passwordHash");
        }

        @Test
        @DisplayName("Should return 409 Conflict when email is already registered")
        void shouldReturn409WhenEmailAlreadyExists() throws Exception {
            performSignup(EMAIL);

            SignupRequest duplicate = SignupRequest.builder()
                    .fullName("Another Engineer")
                    .email(EMAIL.toUpperCase())
                    .password(PASSWORD)
                    .build();

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(duplicate)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Should return 400 Bad Request when password is shorter than 8 characters")
        void shouldReturn400WhenPasswordTooShort() throws Exception {
            SignupRequest request = SignupRequest.builder()
                    .fullName("Test Engineer")
                    .email(EMAIL)
                    .password("short")
                    .build();

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 Bad Request when email format is invalid")
        void shouldReturn400WhenEmailInvalid() throws Exception {
            SignupRequest request = SignupRequest.builder()
                    .fullName("Test Engineer")
                    .email("not-an-email")
                    .password(PASSWORD)
                    .build();

            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginTests {

        @Test
        @DisplayName("Should return 200 OK and create a session for valid credentials")
        void shouldLoginSuccessfullyAndCreateSession() throws Exception {
            performSignup(EMAIL);

            MockHttpSession session = performLogin(EMAIL, PASSWORD);

            assertThat(session).isNotNull();
        }

        @Test
        @DisplayName("Should return 401 Unauthorized for a wrong password")
        void shouldReturn401ForWrongPassword() throws Exception {
            performSignup(EMAIL);

            LoginRequest request = LoginRequest.builder()
                    .email(EMAIL)
                    .password("wrong-password")
                    .build();

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 401 Unauthorized for an unknown email")
        void shouldReturn401ForUnknownEmail() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("ghost@noc.local")
                    .password(PASSWORD)
                    .build();

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/auth/me")
    class MeTests {

        @Test
        @DisplayName("Should return 200 OK with the session user")
        void shouldReturnSessionUser() throws Exception {
            performSignup(EMAIL);
            MockHttpSession session = performLogin(EMAIL, PASSWORD);

            mockMvc.perform(get("/api/auth/me").session(session))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email", is(EMAIL)))
                    .andExpect(jsonPath("$.fullName", is("Test Engineer")))
                    .andExpect(jsonPath("$.role", is("ENGINEER")));
        }

        @Test
        @DisplayName("Should return 401 Unauthorized without a session")
        void shouldReturn401WithoutSession() throws Exception {
            mockMvc.perform(get("/api/auth/me"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/logout")
    class LogoutTests {

        @Test
        @DisplayName("Should invalidate the session so /me returns 401 afterwards")
        void shouldInvalidateSessionOnLogout() throws Exception {
            performSignup(EMAIL);
            MockHttpSession session = performLogin(EMAIL, PASSWORD);

            mockMvc.perform(get("/api/auth/me").session(session))
                    .andExpect(status().isOk());

            mockMvc.perform(post("/api/auth/logout").session(session))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/auth/me").session(session))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 204 No Content even without an active session")
        void shouldReturn204WithoutSession() throws Exception {
            mockMvc.perform(post("/api/auth/logout"))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("Protected endpoints")
    class SecurityTests {

        @Test
        @DisplayName("Should return 401 Unauthorized for a protected endpoint without a session")
        void shouldReturn401ForProtectedEndpointWithoutSession() throws Exception {
            mockMvc.perform(get("/api/incidents"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should allow access to protected endpoints with an authenticated session")
        void shouldAllowProtectedEndpointWithSession() throws Exception {
            performSignup(EMAIL);
            MockHttpSession session = performLogin(EMAIL, PASSWORD);

            mockMvc.perform(get("/api/incidents").session(session))
                    .andExpect(status().isOk());
        }
    }
}
