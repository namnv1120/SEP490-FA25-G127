package com.g127.snapbuy.common.utils;

import java.text.Normalizer;

/**
 * Utility class for Vietnamese text processing.
 * Provides methods to remove diacritics (dấu) from Vietnamese text for search functionality.
 */
public class VietnameseUtils {

    private VietnameseUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Removes diacritics (dấu) from Vietnamese text.
     * Example: "Nguyễn Văn Anh" -> "Nguyen Van Anh"
     *
     * @param input the input string with Vietnamese diacritics
     * @return the string with diacritics removed, or null if input is null
     */
    public static String removeDiacritics(String input) {
        if (input == null) return null;
        
        // Normalize to NFD form and remove combining diacritical marks
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        
        // Handle special Vietnamese characters đ/Đ that are not decomposed by NFD
        return normalized
                .replace("đ", "d")
                .replace("Đ", "D");
    }

    /**
     * Checks if the text contains the keyword, ignoring Vietnamese diacritics.
     * Both text and keyword are normalized before comparison.
     * Example: containsIgnoreDiacritics("Nguyễn Văn Anh", "nguyen") returns true
     *
     * @param text the text to search in
     * @param keyword the keyword to search for
     * @return true if text contains keyword (ignoring diacritics), false otherwise
     */
    public static boolean containsIgnoreDiacritics(String text, String keyword) {
        if (text == null || keyword == null || keyword.isEmpty()) {
            return keyword == null || keyword.isEmpty();
        }
        return removeDiacritics(text.toLowerCase())
                .contains(removeDiacritics(keyword.toLowerCase()));
    }

    /**
     * Checks if any of the provided fields contain the keyword, ignoring Vietnamese diacritics.
     *
     * @param keyword the keyword to search for
     * @param fields the fields to search in (varargs)
     * @return true if any field contains the keyword (ignoring diacritics), false otherwise
     */
    public static boolean matchesAny(String keyword, String... fields) {
        if (keyword == null || keyword.isEmpty()) {
            return true;
        }
        for (String field : fields) {
            if (containsIgnoreDiacritics(field, keyword)) {
                return true;
            }
        }
        return false;
    }
}
