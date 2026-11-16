package com.gr2.noc.settings.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Theme {
    LIGHT("light"),
    DARK("dark"),
    SYSTEM("system");

    private final String value;

    Theme(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Theme fromValue(String value) {
        for (Theme theme : values()) {
            if (theme.value.equalsIgnoreCase(value)) {
                return theme;
            }
        }
        throw new IllegalArgumentException("Unknown theme: " + value);
    }
}
