package com.photography.portfolio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventAnalyticsResponse {

    private Long eventId;
    private String eventTitle;
    private long totalViews;
    private long uniqueVisitors;
    private List<VisitorResponse> visitors;
}
