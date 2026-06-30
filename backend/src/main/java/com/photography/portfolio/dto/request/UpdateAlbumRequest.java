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
public class UpdateAlbumRequest {

    @NotBlank(message = "Album name is required")
    @Size(min = 2, max = 255, message = "Album name must be between 2 and 255 characters")
    private String albumName;

    @Min(value = 0, message = "Display order must be 0 or greater")
    private Integer displayOrder;

}
