package com.photography.portfolio.service;

import com.photography.portfolio.dto.response.DashboardAnalyticsResponse;
import com.photography.portfolio.dto.response.EventAnalyticsResponse;

public interface VisitorService {

    /**
     * Record a visit for the given event/email pair.
     * If the visitor already exists for this event, the visit count is incremented
     * and last_visit is updated. Otherwise a new visitor record is created.
     */
    void trackVisit(Long eventId, String email);

    EventAnalyticsResponse getEventAnalytics(Long eventId);

    DashboardAnalyticsResponse getDashboardAnalytics();
}
