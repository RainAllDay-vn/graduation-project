package com.gr2.noc.settings.dto.get;

import com.gr2.noc.settings.enums.AppLocale;
import com.gr2.noc.settings.enums.Theme;
import com.gr2.noc.settings.model.UserPreference;
import com.gr2.noc.settings.model.UserPreferenceData;
import lombok.Builder;

@Builder
public record UserSettingsResponse(
    Theme theme,
    AppLocale locale,
    boolean showDeviceLabels,
    boolean autoSelectOnAlarm,
    boolean blastRadiusBeacon,
    boolean showIpInPicker,
    boolean promptResumeInvestigation
) {
    public static UserSettingsResponse from(UserPreference preference) {
        if (preference == null) {
            return null;
        }
        return from(preference.getPreferences());
    }

    public static UserSettingsResponse from(UserPreferenceData data) {
        if (data == null) {
            return null;
        }
        return UserSettingsResponse.builder()
                .theme(data.getTheme())
                .locale(data.getLocale())
                .showDeviceLabels(data.getShowDeviceLabels())
                .autoSelectOnAlarm(data.getAutoSelectOnAlarm())
                .blastRadiusBeacon(data.getBlastRadiusBeacon())
                .showIpInPicker(data.getShowIpInPicker())
                .promptResumeInvestigation(data.getPromptResumeInvestigation())
                .build();
    }

    public static UserSettingsResponse defaults() {
        return UserSettingsResponse.builder()
                .theme(Theme.LIGHT)
                .locale(AppLocale.VI)
                .showDeviceLabels(true)
                .autoSelectOnAlarm(true)
                .blastRadiusBeacon(true)
                .showIpInPicker(false)
                .promptResumeInvestigation(true)
                .build();
    }
}
