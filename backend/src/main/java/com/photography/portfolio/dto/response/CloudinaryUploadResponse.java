package com.photography.portfolio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudinaryUploadResponse {

    private String publicId;
    private String secureUrl;
    private String url;
    private Long width;
    private Long height;
    private String resourceType;
    private String format;

}
