package com.photography.portfolio.service;

import com.photography.portfolio.dto.request.CreateEventRequest;
import com.photography.portfolio.dto.request.UpdateEventRequest;
import com.photography.portfolio.dto.response.EventResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EventService {

    EventResponse createEvent(CreateEventRequest request, MultipartFile coverImage);

    EventResponse getEventById(Long id);

    List<EventResponse> getAllEvents();

    List<EventResponse> getAllPublishedEvents();

    List<EventResponse> getAllFeaturedEvents();

    List<EventResponse> getEventsByCategory(Long categoryId);

    EventResponse updateEvent(Long id, UpdateEventRequest request, MultipartFile coverImage);

    void deleteEvent(Long id);

    void publishEvent(Long id);

    void unpublishEvent(Long id);

}
