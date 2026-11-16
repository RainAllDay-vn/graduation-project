package com.gr2.noc.settings.controller;

import com.gr2.noc.settings.dto.get.UserSettingsResponse;
import com.gr2.noc.settings.dto.update.UpdateUserSettingsRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * REST API contract for app-wide per-account UI settings (theme, locale and
 * dashboard display defaults). Backs the Cài đặt page.
 */
@RequestMapping("/api/settings")
public interface SettingsApi {

    /**
     * Retrieve the current user's settings. Returns the default values when
     * the user has never saved settings.
     */
    @GetMapping
    ResponseEntity<UserSettingsResponse> getSettings(@AuthenticationPrincipal User principal);

    /**
     * Replace all settings of the current user ("Lưu thay đổi"). Applies to
     * every device signed in with the same account.
     */
    @PutMapping
    ResponseEntity<UserSettingsResponse> saveSettings(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody UpdateUserSettingsRequest request
    );
}
