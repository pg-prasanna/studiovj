package com.photography.portfolio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private String coverImageUrl;
    private Boolean featured;
    private String status;
    private Long categoryId;
    private String categoryName;

    /**
     * The client e-mail registered for download access.
     * Returned to the admin UI so they can see what was configured.
     * The PIN hash is NEVER included in responses.
     */
    private String clientEmail;

    /**
     * True when both clientEmail and clientDownloadPin are configured —
     * tells the public gallery whether to show the download-gate modal.
     */
    private Boolean downloadProtected;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AlbumResponse> albums;

}
