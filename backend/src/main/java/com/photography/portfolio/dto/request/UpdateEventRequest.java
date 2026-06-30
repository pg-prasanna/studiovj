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
public class UpdateEventRequest {

    @NotBlank(message = "Event title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    private LocalDateTime eventDate;

    private Boolean featured;

    @Pattern(regexp = "DRAFT|PUBLISHED|ARCHIVED", message = "Status must be DRAFT, PUBLISHED, or ARCHIVED")
    private String status;

    private Long categoryId;

    @Email(message = "Client email must be a valid email address")
    @Size(max = 255)
    private String clientEmail;

    /** When present, replaces the existing hashed PIN with a new one. */
    @Size(min = 4, max = 20, message = "Download PIN must be between 4 and 20 characters")
    private String clientDownloadPin;

}
