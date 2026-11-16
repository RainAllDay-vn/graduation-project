package com.gr2.noc.settings.service;

import com.gr2.noc.settings.dto.get.UserSettingsResponse;
import com.gr2.noc.settings.dto.update.UpdateUserSettingsRequest;
import com.gr2.noc.settings.model.UserPreference;
import com.gr2.noc.settings.model.UserPreferenceData;
import com.gr2.noc.settings.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SettingsServiceImpl implements SettingsService {

    private final UserPreferenceRepository userPreferenceRepository;

    @Override
    @Transactional(readOnly = true)
    public UserSettingsResponse getSettings(String email) {
        requireEmail(email);
        return userPreferenceRepository.findByEmailIgnoreCase(email)
                .map(UserSettingsResponse::from)
                .orElseGet(UserSettingsResponse::defaults);
    }

    @Override
    @Transactional
    public UserSettingsResponse saveSettings(String email, UpdateUserSettingsRequest request) {
        requireEmail(email);
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Settings payload is required");
        }
        UserPreference preference = userPreferenceRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> UserPreference.builder()
                        .email(email)
                        .build());
        if (preference == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Could not prepare user settings");
        }
        preference.setPreferences(UserPreferenceData.builder()
                .theme(request.theme())
                .locale(request.locale())
                .showDeviceLabels(request.showDeviceLabels())
                .autoSelectOnAlarm(request.autoSelectOnAlarm())
                .blastRadiusBeacon(request.blastRadiusBeacon())
                .showIpInPicker(request.showIpInPicker())
                .promptResumeInvestigation(request.promptResumeInvestigation())
                .build());
        userPreferenceRepository.save(preference);
        return UserSettingsResponse.from(preference);
    }

    private void requireEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }
    }
}
