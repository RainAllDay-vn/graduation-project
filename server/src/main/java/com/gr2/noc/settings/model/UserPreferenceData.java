package com.gr2.noc.settings.model;

import com.gr2.noc.settings.enums.AppLocale;
import com.gr2.noc.settings.enums.Theme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferenceData {

    @Builder.Default
    private Theme theme = Theme.LIGHT;

    @Builder.Default
    private AppLocale locale = AppLocale.VI;

    @Builder.Default
    private Boolean showDeviceLabels = true;

    @Builder.Default
    private Boolean autoSelectOnAlarm = true;

    @Builder.Default
    private Boolean blastRadiusBeacon = true;

    @Builder.Default
    private Boolean showIpInPicker = false;

    @Builder.Default
    private Boolean promptResumeInvestigation = true;

    public UserPreferenceData withDefaults() {
        return UserPreferenceData.builder()
                .theme(theme != null ? theme : Theme.LIGHT)
                .locale(locale != null ? locale : AppLocale.VI)
                .showDeviceLabels(showDeviceLabels != null ? showDeviceLabels : true)
                .autoSelectOnAlarm(autoSelectOnAlarm != null ? autoSelectOnAlarm : true)
                .blastRadiusBeacon(blastRadiusBeacon != null ? blastRadiusBeacon : true)
                .showIpInPicker(showIpInPicker != null ? showIpInPicker : false)
                .promptResumeInvestigation(promptResumeInvestigation != null ? promptResumeInvestigation : true)
                .build();
    }
}
