package com.photography.portfolio.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.photography.portfolio.dto.response.CloudinaryUploadResponse;
import com.photography.portfolio.exception.CloudinaryException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Thin Cloudinary wrapper.
 * Compression/resizing is now handled on the frontend (imageCompress.js)
 * to avoid Java heap memory issues on Render's free tier.
 * This service simply uploads the received bytes directly.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryUploadResponse uploadImage(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new CloudinaryException("File is empty", "EMPTY_FILE_ERROR", null);
            }

            byte[] bytes = file.getBytes();
            log.debug("Uploading file '{}' ({} bytes) directly to Cloudinary.",
                    file.getOriginalFilename(), bytes.length);

            @SuppressWarnings("rawtypes")
            Map uploadResult = cloudinary.uploader().upload(
                    bytes,
                    ObjectUtils.asMap(
                            "folder", "photography-portfolio",
                            "resource_type", "auto"
                    )
            );

            return CloudinaryUploadResponse.builder()
                    .publicId((String) uploadResult.get("public_id"))
                    .secureUrl((String) uploadResult.get("secure_url"))
                    .url((String) uploadResult.get("url"))
                    .width(uploadResult.get("width") != null
                            ? ((Number) uploadResult.get("width")).longValue() : null)
                    .height(uploadResult.get("height") != null
                            ? ((Number) uploadResult.get("height")).longValue() : null)
                    .resourceType((String) uploadResult.get("resource_type"))
                    .format((String) uploadResult.get("format"))
                    .build();

        } catch (CloudinaryException e) {
            throw e;
        } catch (IOException e) {
            log.error("Error uploading file to Cloudinary: {}", e.getMessage(), e);
            throw new CloudinaryException("Failed to upload file to Cloudinary", e, "UPLOAD_ERROR", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during Cloudinary upload: {}", e.getMessage(), e);
            throw new CloudinaryException("Unexpected error during upload", e, "UNEXPECTED_ERROR", e.getMessage());
        }
    }

    public void deleteImage(String publicId) {
        try {
            if (publicId == null || publicId.isBlank()) {
                throw new CloudinaryException("Public ID cannot be empty", "INVALID_PUBLIC_ID", null);
            }

            @SuppressWarnings("rawtypes")
            Map deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String result = (String) deleteResult.get("result");

            if (!"ok".equals(result)) {
                log.warn("Cloudinary delete result: {} for public_id: {}", result, publicId);
            }
            log.info("Image deleted successfully from Cloudinary: {}", publicId);

        } catch (IOException e) {
            log.error("Error deleting image from Cloudinary: {}", e.getMessage(), e);
            throw new CloudinaryException("Failed to delete image from Cloudinary", e, "DELETE_ERROR", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during Cloudinary delete: {}", e.getMessage(), e);
            throw new CloudinaryException("Unexpected error during delete", e, "UNEXPECTED_ERROR", e.getMessage());
        }
    }

    public String generateOptimizedUrl(String publicId, int width, int height, String cropMode) {
        try {
            if (publicId == null || publicId.isBlank()) {
                throw new CloudinaryException("Public ID cannot be empty", "INVALID_PUBLIC_ID", null);
            }
            Transformation transformation = new Transformation()
                    .width(width).height(height).crop(cropMode);
            return cloudinary.url().transformation(transformation).generate(publicId);
        } catch (Exception e) {
            log.error("Error generating optimized URL: {}", e.getMessage(), e);
            throw new CloudinaryException("Failed to generate optimized URL", e, "URL_GENERATION_ERROR", e.getMessage());
        }
    }
}
