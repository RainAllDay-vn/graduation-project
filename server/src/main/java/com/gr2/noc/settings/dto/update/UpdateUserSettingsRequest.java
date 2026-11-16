package com.gr2.noc.settings.dto.update;

import com.gr2.noc.settings.enums.AppLocale;
import com.gr2.noc.settings.enums.Theme;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record UpdateUserSettingsRequest(
    @NotNull Theme theme,

    @NotNull AppLocale locale,

    @NotNull Boolean showDeviceLabels,

    @NotNull Boolean autoSelectOnAlarm,

    @NotNull Boolean blastRadiusBeacon,

    @NotNull Boolean showIpInPicker,

    @NotNull Boolean promptResumeInvestigation
) {
}
