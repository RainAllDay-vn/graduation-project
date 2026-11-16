package com.gr2.noc.settings.controller;

import com.gr2.noc.settings.dto.get.UserSettingsResponse;
import com.gr2.noc.settings.dto.update.UpdateUserSettingsRequest;
import com.gr2.noc.settings.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class SettingsController implements SettingsApi {

    private final SettingsService settingsService;

    @Override
    public ResponseEntity<UserSettingsResponse> getSettings(User principal) {
        return ResponseEntity.ok(settingsService.getSettings(currentEmail(principal)));
    }

    @Override
    public ResponseEntity<UserSettingsResponse> saveSettings(User principal, UpdateUserSettingsRequest request) {
        return ResponseEntity.ok(settingsService.saveSettings(currentEmail(principal), request));
    }

    private String currentEmail(User principal) {
        if (principal == null || principal.getUsername() == null || principal.getUsername().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return principal.getUsername();
    }
}
