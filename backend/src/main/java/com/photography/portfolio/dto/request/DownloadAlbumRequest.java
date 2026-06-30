package com.photography.portfolio.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for downloading an entire album as a ZIP.
 * The client (guest) must supply the same email + PIN that the admin
 * configured on the parent Event, verified server-side before any
 * file bytes are streamed back.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DownloadAlbumRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "PIN is required")
    private String pin;
}
