package com.photography.portfolio.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadPhotosRequest {

    @NotNull(message = "Album ID is required")
    @Positive(message = "Album ID must be a positive number")
    private Long albumId;

    @NotEmpty(message = "At least one file must be provided")
    private List<MultipartFile> files;

    @Builder.Default
    private Integer startDisplayOrder = 0;

    /**
     * Optional manual orientation overrides, aligned by index with {@code files}.
     * A null or empty entry at a given index means "use auto-detected orientation".
     * Accepted values: PORTRAIT, LANDSCAPE, SQUARE.
     */
    private List<String> orientationOverrides;

}
