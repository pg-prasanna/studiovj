package com.photography.portfolio.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEventRequest {

    @NotBlank(message = "Event title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @NotNull(message = "Event date is required")
    private LocalDateTime eventDate;

    @Builder.Default
    private Boolean featured = false;

    @Builder.Default
    private String status = "DRAFT";

    private Long categoryId;

    /** Optional: client e-mail used to gate photo downloads for this event. */
    @Email(message = "Client email must be a valid email address")
    @Size(max = 255)
    private String clientEmail;

    /**
     * Optional plain-text PIN chosen by the admin (4–20 chars).
     * Will be BCrypt-hashed before being persisted.
     */
    @Size(min = 4, max = 20, message = "Download PIN must be between 4 and 20 characters")
    private String clientDownloadPin;

}
