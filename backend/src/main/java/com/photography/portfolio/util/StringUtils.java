package com.photography.portfolio.util;

public class StringUtils {

    public static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isNotBlank(String str) {
        return !isBlank(str);
    }

    public static String capitalize(String str) {
        if (isBlank(str)) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    public static String sanitizeFilename(String filename) {
        if (isBlank(filename)) {
            return "file";
        }
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public static String truncate(String str, int length) {
        if (isBlank(str) || str.length() <= length) {
            return str;
        }
        return str.substring(0, length - 3) + "...";
    }

}
