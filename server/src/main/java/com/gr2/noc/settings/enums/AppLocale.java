package com.gr2.noc.settings.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AppLocale {
    VI("vi"),
    EN("en");

    private final String value;

    AppLocale(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AppLocale fromValue(String value) {
        for (AppLocale locale : values()) {
            if (locale.value.equalsIgnoreCase(value)) {
                return locale;
            }
        }
        throw new IllegalArgumentException("Unknown locale: " + value);
    }
}
