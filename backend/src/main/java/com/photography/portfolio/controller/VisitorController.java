package com.photography.portfolio.controller;

import com.photography.portfolio.dto.request.TrackVisitRequest;
import com.photography.portfolio.dto.request.VerifyDownloadRequest;
import com.photography.portfolio.dto.response.ApiResponse;
import com.photography.portfolio.dto.response.DashboardAnalyticsResponse;
import com.photography.portfolio.dto.response.EventAnalyticsResponse;
import com.photography.portfolio.entity.Event;
import com.photography.portfolio.exception.ResourceNotFoundException;
import com.photography.portfolio.repository.EventRepository;
import com.photography.portfolio.service.VisitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class VisitorController {

    private final VisitorService visitorService;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Public endpoint hit by the gallery viewer site when a guest submits their email
     * to unlock a gallery. No authentication required.
     */
    @PostMapping("/api/events/{eventId}/visit")
    public ResponseEntity<ApiResponse<Void>> trackVisit(
            @PathVariable Long eventId,
            @Valid @RequestBody TrackVisitRequest request) {

        log.info("POST /api/events/{}/visit - Tracking visitor {}", eventId, request.getEmail());
        visitorService.trackVisit(eventId, request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "Visit recorded"));
    }

    /**
     * Public endpoint: verify client download credentials for an event.
     * Returns 200 OK on match, 401 on mismatch, 404 if event not found.
     * The actual download happens client-side from Cloudinary after this succeeds.
     */
    @PostMapping("/api/events/{eventId}/verify-download")
    public ResponseEntity<ApiResponse<Void>> verifyDownload(
            @PathVariable Long eventId,
            @Valid @RequestBody VerifyDownloadRequest request) {

        log.info("POST /api/events/{}/verify-download", eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        boolean emailMatch = event.getClientEmail() != null
                && event.getClientEmail().equalsIgnoreCase(request.getEmail().trim());
        boolean pinMatch = event.getClientDownloadPin() != null
                && passwordEncoder.matches(request.getPin(), event.getClientDownloadPin());

        if (emailMatch && pinMatch) {
            return ResponseEntity.ok(ApiResponse.success(null, "Access granted"));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or PIN", 401));
    }

    /**
     * Admin-only aggregate stats for the dashboard: total gallery views and unique
     * visitors across all events. Protected by SecurityConfig's /api/admin/** rule.
     */
    @GetMapping("/api/admin/analytics/dashboard")
    public ResponseEntity<ApiResponse<DashboardAnalyticsResponse>> getDashboardAnalytics() {

        log.info("GET /api/admin/analytics/dashboard - Fetching dashboard analytics");

        DashboardAnalyticsResponse response = visitorService.getDashboardAnalytics();

        return ResponseEntity.ok(ApiResponse.success(response, "Dashboard analytics retrieved successfully"));
    }

    /**
     * Admin-only per-event analytics: total views, unique visitors and the full
     * visitor email list (used for the visitor table / CSV export in the dashboard).
     */
    @GetMapping("/api/admin/events/{eventId}/analytics")
    public ResponseEntity<ApiResponse<EventAnalyticsResponse>> getEventAnalytics(
            @PathVariable Long eventId) {

        log.info("GET /api/admin/events/{}/analytics - Fetching event analytics", eventId);

        EventAnalyticsResponse response = visitorService.getEventAnalytics(eventId);

        return ResponseEntity.ok(ApiResponse.success(response, "Event analytics retrieved successfully"));
    }
}
