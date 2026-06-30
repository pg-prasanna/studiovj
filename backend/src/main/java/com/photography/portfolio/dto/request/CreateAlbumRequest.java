package com.photography.portfolio.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAlbumRequest {

    @NotNull(message = "Event ID is required")
    @Positive(message = "Event ID must be a positive number")
    private Long eventId;

    @NotBlank(message = "Album name is required")
    @Size(min = 2, max = 255, message = "Album name must be between 2 and 255 characters")
    private String albumName;

    @Builder.Default
    private Integer displayOrder = 0;

}
