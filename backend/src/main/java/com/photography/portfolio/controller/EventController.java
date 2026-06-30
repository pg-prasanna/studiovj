package com.photography.portfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.photography.portfolio.dto.request.CreateEventRequest;
import com.photography.portfolio.dto.request.UpdateEventRequest;
import com.photography.portfolio.dto.response.ApiResponse;
import com.photography.portfolio.dto.response.EventResponse;
import com.photography.portfolio.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final EventService eventService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("eventDate") String eventDate,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "clientEmail", required = false) String clientEmail,
            @RequestParam(value = "clientDownloadPin", required = false) String clientDownloadPin,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {

        try {
            CreateEventRequest request = new CreateEventRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setLocation(location);
            request.setCategoryId(categoryId);
            request.setClientEmail(clientEmail);
            request.setClientDownloadPin(clientDownloadPin);
            
            // Parse eventDate - try multiple formats
            LocalDateTime parsedDate = parseEventDate(eventDate);
            request.setEventDate(parsedDate);

            log.info("POST /api/events - Creating new event with title: {}", title);

            EventResponse response =
                    eventService.createEvent(request, coverImage);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Event created successfully"));

        } catch (Exception e) {
            log.error("Error creating event", e);
            throw new RuntimeException(
                    "Failed to create event: " + e.getMessage()
            );
        }
    }

    private LocalDateTime parseEventDate(String dateString) {
        // Try different date formats
        String[] formats = {
                "dd-MM-yyyy",      // 10-06-2026
                "yyyy-MM-dd",      // 2026-06-10
                "dd/MM/yyyy",      // 10/06/2026
                "MM/dd/yyyy"       // 06/10/2026
        };
        
        for (String format : formats) {
            try {
                LocalDate localDate = LocalDate.parse(dateString, DateTimeFormatter.ofPattern(format));
                return localDate.atStartOfDay();
            } catch (Exception e) {
                // Continue to next format
            }
        }
        
        throw new RuntimeException("Invalid date format. Expected formats: dd-MM-yyyy, yyyy-MM-dd, dd/MM/yyyy, or MM/dd/yyyy");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        log.info("GET /api/events - Fetching all events");
        List<EventResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(
                ApiResponse.success(events, "Events retrieved successfully")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(
            @PathVariable Long id) {

        log.info("GET /api/events/{} - Fetching event by ID", id);

        EventResponse event = eventService.getEventById(id);

        return ResponseEntity.ok(
                ApiResponse.success(event, "Event retrieved successfully")
        );
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllPublishedEvents() {

        log.info("GET /api/events/published - Fetching all published events");

        List<EventResponse> events =
                eventService.getAllPublishedEvents();

        return ResponseEntity.ok(
                ApiResponse.success(events,
                        "Published events retrieved successfully")
        );
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllFeaturedEvents() {

        log.info("GET /api/events/featured - Fetching all featured events");

        List<EventResponse> events =
                eventService.getAllFeaturedEvents();

        return ResponseEntity.ok(
                ApiResponse.success(events,
                        "Featured events retrieved successfully")
        );
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsByCategory(
            @PathVariable Long categoryId) {

        log.info("GET /api/events/by-category/{} - Fetching events by category", categoryId);

        List<EventResponse> events = eventService.getEventsByCategory(categoryId);

        return ResponseEntity.ok(
                ApiResponse.success(events, "Events retrieved successfully")
        );
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "eventDate", required = false) String eventDate,
            @RequestParam(value = "featured", required = false) Boolean featured,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "clientEmail", required = false) String clientEmail,
            @RequestParam(value = "clientDownloadPin", required = false) String clientDownloadPin,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {

        try {
            UpdateEventRequest request = new UpdateEventRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setLocation(location);
            request.setCategoryId(categoryId);
            request.setClientEmail(clientEmail);
            request.setClientDownloadPin(clientDownloadPin);
            if (eventDate != null && !eventDate.isEmpty()) {
                request.setEventDate(LocalDateTime.parse(eventDate + "T00:00:00"));
            }
            request.setFeatured(featured);
            request.setStatus(status);

            log.info("PUT /api/events/{} - Updating event", id);

            EventResponse response =
                    eventService.updateEvent(id, request, coverImage);

            return ResponseEntity.ok(
                    ApiResponse.success(response,
                            "Event updated successfully")
            );

        } catch (Exception e) {
            log.error("Error updating event", e);
            throw new RuntimeException(
                    "Failed to update event: " + e.getMessage()
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable Long id) {

        log.info("DELETE /api/events/{} - Deleting event", id);

        eventService.deleteEvent(id);

        return ResponseEntity.ok(
                ApiResponse.success(null,
                        "Event deleted successfully")
        );
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<Void>> publishEvent(
            @PathVariable Long id) {

        log.info("POST /api/events/{}/publish - Publishing event", id);

        eventService.publishEvent(id);

        return ResponseEntity.ok(
                ApiResponse.success(null,
                        "Event published successfully")
        );
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<Void>> unpublishEvent(
            @PathVariable Long id) {

        log.info("POST /api/events/{}/unpublish - Unpublishing event", id);

        eventService.unpublishEvent(id);

        return ResponseEntity.ok(
                ApiResponse.success(null,
                        "Event unpublished successfully")
        );
    }
}