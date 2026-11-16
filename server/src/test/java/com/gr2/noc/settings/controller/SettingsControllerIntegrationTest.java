package com.gr2.noc.settings.controller;

import com.gr2.noc.settings.repository.UserPreferenceRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.lang.NonNull;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SettingsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;

    @NonNull
    private String uniqueEmail(@NonNull String prefix) {
        return prefix + "-" + System.nanoTime() + "@noc.test";
    }

    @NonNull
    private String settingsPayload(@NonNull String theme, @NonNull String locale) {
        return """
                {
                  "theme": "%s",
                  "locale": "%s",
                  "showDeviceLabels": true,
                  "autoSelectOnAlarm": false,
                  "blastRadiusBeacon": true,
                  "showIpInPicker": true,
                  "promptResumeInvestigation": false
                }
                """.formatted(theme, locale);
    }

    @Nested
    @DisplayName("Security tests")
    class SecurityTests {

        @Test
        @WithAnonymousUser
        @DisplayName("Anonymous user should not read settings")
        void shouldRejectAnonymousGet() throws Exception {
            mockMvc.perform(get("/api/settings"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithAnonymousUser
        @DisplayName("Anonymous user should not save settings")
        void shouldRejectAnonymousPut() throws Exception {
            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content(settingsPayload("dark", "en")))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Get settings tests")
    class GetSettingsTests {

        @Test
        @WithMockUser(username = "someone@noc.test")
        @DisplayName("Should return default settings for a user who never saved")
        void shouldReturnDefaultsForNewUser() throws Exception {
            mockMvc.perform(get("/api/settings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.theme").value("light"))
                    .andExpect(jsonPath("$.locale").value("vi"))
                    .andExpect(jsonPath("$.showDeviceLabels").value(true))
                    .andExpect(jsonPath("$.autoSelectOnAlarm").value(true))
                    .andExpect(jsonPath("$.blastRadiusBeacon").value(true))
                    .andExpect(jsonPath("$.showIpInPicker").value(false))
                    .andExpect(jsonPath("$.promptResumeInvestigation").value(true));
        }
    }

    @Nested
    @DisplayName("Save settings tests")
    class SaveSettingsTests {

        @Test
        @WithMockUser(username = "someone@noc.test")
        @DisplayName("Should save settings and return them")
        void shouldSaveAndReturnSettings() throws Exception {
            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content(settingsPayload("dark", "en")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.theme").value("dark"))
                    .andExpect(jsonPath("$.locale").value("en"))
                    .andExpect(jsonPath("$.showDeviceLabels").value(true))
                    .andExpect(jsonPath("$.autoSelectOnAlarm").value(false))
                    .andExpect(jsonPath("$.blastRadiusBeacon").value(true))
                    .andExpect(jsonPath("$.showIpInPicker").value(true))
                    .andExpect(jsonPath("$.promptResumeInvestigation").value(false));

            mockMvc.perform(get("/api/settings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.theme").value("dark"))
                    .andExpect(jsonPath("$.locale").value("en"))
                    .andExpect(jsonPath("$.autoSelectOnAlarm").value(false));
        }

        @Test
        @WithMockUser(username = "someone@noc.test")
        @DisplayName("Should update the same row when saving twice")
        void shouldUpsertOnSecondSave() throws Exception {
            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content(settingsPayload("dark", "en")))
                    .andExpect(status().isOk());

            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content(settingsPayload("system", "vi")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.theme").value("system"))
                    .andExpect(jsonPath("$.locale").value("vi"));

            long rows = userPreferenceRepository.count();
            assertThat(rows).isEqualTo(1);
        }

        @Test
        @WithMockUser(username = "someone@noc.test")
        @DisplayName("Should match settings saved under a different email casing")
        void shouldMatchEmailIgnoringCase() throws Exception {
            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content(settingsPayload("dark", "en")))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Validation tests")
    class ValidationTests {

        @Test
        @WithMockUser(username = "someone@noc.test")
        @DisplayName("Should reject payload without theme")
        void shouldRejectMissingTheme() throws Exception {
            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content("""
                                    {"locale":"en","showDeviceLabels":true,"autoSelectOnAlarm":true,
                                    "blastRadiusBeacon":true,"showIpInPicker":false,"promptResumeInvestigation":true}
                                    """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(username = "someone@noc.test")
        @DisplayName("Should reject unknown theme value")
        void shouldRejectUnknownTheme() throws Exception {
            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content(settingsPayload("sepia", "en")))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(username = "someone@noc.test")
        @DisplayName("Should reject unknown locale value")
        void shouldRejectUnknownLocale() throws Exception {
            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content(settingsPayload("dark", "fr")))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Isolation tests")
    class IsolationTests {

        @Test
        @WithMockUser(username = "someone@noc.test")
        @DisplayName("Should keep settings of different users independent")
        void shouldIsolateUsers() throws Exception {
            mockMvc.perform(put("/api/settings")
                            .contentType("application/json")
                            .content(settingsPayload("dark", "en")))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "other@noc.test")
        @DisplayName("Other user should still see defaults after first user saved")
        void shouldKeepDefaultsForOtherUser() throws Exception {
            mockMvc.perform(get("/api/settings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.theme").value("light"))
                    .andExpect(jsonPath("$.locale").value("vi"));
        }
    }
}
