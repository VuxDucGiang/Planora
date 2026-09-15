package com.fudn.planora.utils;

import java.util.Locale;

public final class ProjectConstants {

    public static final String DEFAULT_ENCODING = "UTF-8";

    public static final Locale VIETNAMESE_LOCALE = new Locale.Builder().setLanguage("vi").setRegion("VN").build();
    public static final Locale DEFAULT_LOCALE = Locale.ENGLISH;

    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    private ProjectConstants() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }
}
