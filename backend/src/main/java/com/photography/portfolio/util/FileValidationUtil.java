package com.photography.portfolio.util;

import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

public class FileValidationUtil {

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"
    );

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/svg+xml"
    );

    public static boolean isValidImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return false;
        }

        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null || !hasValidExtension(filename)) {
            return false;
        }

        // Check MIME type
        String contentType = file.getContentType();
        return contentType != null && ALLOWED_MIME_TYPES.contains(contentType);
    }

    public static boolean hasValidExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return false;
        }

        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(extension);
    }

    public static String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

}
