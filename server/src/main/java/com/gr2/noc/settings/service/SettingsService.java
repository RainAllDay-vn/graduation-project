package com.gr2.noc.settings.service;

import com.gr2.noc.settings.dto.get.UserSettingsResponse;
import com.gr2.noc.settings.dto.update.UpdateUserSettingsRequest;

public interface SettingsService {

    UserSettingsResponse getSettings(String email);

    UserSettingsResponse saveSettings(String email, UpdateUserSettingsRequest request);
}
