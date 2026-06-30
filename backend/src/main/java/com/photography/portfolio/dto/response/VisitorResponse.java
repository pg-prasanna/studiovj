package com.photography.portfolio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorResponse {

    private String email;
    private Integer visitCount;
    private LocalDateTime firstVisit;
    private LocalDateTime lastVisit;
}
