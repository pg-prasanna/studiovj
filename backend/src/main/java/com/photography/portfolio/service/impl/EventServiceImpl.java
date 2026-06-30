package com.photography.portfolio.service.impl;

import com.photography.portfolio.cloudinary.CloudinaryService;
import com.photography.portfolio.dto.request.CreateEventRequest;
import com.photography.portfolio.dto.request.UpdateEventRequest;
import com.photography.portfolio.dto.response.CloudinaryUploadResponse;
import com.photography.portfolio.dto.response.EventResponse;
import com.photography.portfolio.entity.Event;
import com.photography.portfolio.exception.BadRequestException;
import com.photography.portfolio.exception.ResourceNotFoundException;
import com.photography.portfolio.mapper.EventMapper;
import com.photography.portfolio.repository.EventRepository;
import com.photography.portfolio.repository.PhotoRepository;
import com.photography.portfolio.repository.CategoryRepository;
import com.photography.portfolio.entity.Category;
import com.photography.portfolio.service.AlbumService;
import com.photography.portfolio.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final PhotoRepository photoRepository;
    private final AlbumService albumService;
    private final EventMapper eventMapper;
    private final CloudinaryService cloudinaryService;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    private EventResponse withCategory(EventResponse response) {
        if (response != null && response.getCategoryId() != null) {
            categoryRepository.findById(response.getCategoryId())
                    .ifPresent(c -> response.setCategoryName(c.getName()));
        }
        return response;
    }

    /** Populate the derived downloadProtected flag (never exposes the hash). */
    private EventResponse withDownloadFlag(EventResponse response, Event event) {
        boolean protected_ = event.getClientEmail() != null && !event.getClientEmail().isBlank()
                && event.getClientDownloadPin() != null && !event.getClientDownloadPin().isBlank();
        response.setDownloadProtected(protected_);
        return response;
    }

    private EventResponse toResponse(Event event) {
        EventResponse r = eventMapper.toResponse(event);
        withCategory(r);
        withDownloadFlag(r, event);
        // Ensure albums are returned in admin-defined displayOrder, not JPA insertion order
        if (r.getAlbums() != null) {
            r.getAlbums().sort(Comparator.comparingInt(a -> (a.getDisplayOrder() == null ? 0 : a.getDisplayOrder())));
        }
        return r;
    }

    @Override
    @Transactional
    public EventResponse createEvent(CreateEventRequest request, MultipartFile coverImage) {
        log.info("Creating new event: {}", request.getTitle());

        // Check if event title already exists
        if (eventRepository.findByTitle(request.getTitle()).isPresent()) {
            throw new BadRequestException("Event with title '" + request.getTitle() + "' already exists", "DUPLICATE_TITLE");
        }

        Event event = eventMapper.toEntity(request);

        // Upload cover image if provided
        if (coverImage != null && !coverImage.isEmpty()) {
            CloudinaryUploadResponse uploadResponse = cloudinaryService.uploadImage(coverImage);
            event.setCoverImageUrl(uploadResponse.getSecureUrl());
            event.setCloudinaryCoverPublicId(uploadResponse.getPublicId());
            log.info("Cover image uploaded for event: {}", uploadResponse.getPublicId());
        }

        // Store client download credentials (PIN hashed with BCrypt)
        if (request.getClientEmail() != null && !request.getClientEmail().isBlank()) {
            event.setClientEmail(request.getClientEmail().trim().toLowerCase());
        }
        if (request.getClientDownloadPin() != null && !request.getClientDownloadPin().isBlank()) {
            event.setClientDownloadPin(passwordEncoder.encode(request.getClientDownloadPin()));
        }

        Event savedEvent = eventRepository.save(event);
        log.info("Event created successfully with ID: {}", savedEvent.getId());

        return toResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id) {
        log.info("Fetching event with ID: {}", id);
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return toResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        log.info("Fetching all events");
        return eventRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAllPublishedEvents() {
        log.info("Fetching all published events");
        return eventRepository.findAllPublished().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAllFeaturedEvents() {
        log.info("Fetching all featured events");
        return eventRepository.findAllFeatured().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long id, UpdateEventRequest request, MultipartFile coverImage) {
        log.info("Updating event with ID: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        // Update cover image if provided
        if (coverImage != null && !coverImage.isEmpty()) {
            // Delete old cover image from Cloudinary
            if (event.getCloudinaryCoverPublicId() != null) {
                cloudinaryService.deleteImage(event.getCloudinaryCoverPublicId());
                log.info("Old cover image deleted: {}", event.getCloudinaryCoverPublicId());
            }

            // Upload new cover image
            CloudinaryUploadResponse uploadResponse = cloudinaryService.uploadImage(coverImage);
            event.setCoverImageUrl(uploadResponse.getSecureUrl());
            event.setCloudinaryCoverPublicId(uploadResponse.getPublicId());
            log.info("New cover image uploaded: {}", uploadResponse.getPublicId());
        }

        eventMapper.updateEventFromRequest(request, event);

        // Update client download credentials when provided
        if (request.getClientEmail() != null) {
            event.setClientEmail(request.getClientEmail().isBlank() ? null
                    : request.getClientEmail().trim().toLowerCase());
        }
        if (request.getClientDownloadPin() != null && !request.getClientDownloadPin().isBlank()) {
            event.setClientDownloadPin(passwordEncoder.encode(request.getClientDownloadPin()));
        }

        Event updatedEvent = eventRepository.save(event);
        log.info("Event updated successfully with ID: {}", updatedEvent.getId());

        return toResponse(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        log.info("Deleting event with ID: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        // Delete cover image from Cloudinary
        if (event.getCloudinaryCoverPublicId() != null) {
            cloudinaryService.deleteImage(event.getCloudinaryCoverPublicId());
            log.info("Cover image deleted: {}", event.getCloudinaryCoverPublicId());
        }

        // Delete all photos associated with this event
        List<Long> photoIds = photoRepository.findAllByEventId(id).stream()
                .map(photo -> photo.getId())
                .collect(Collectors.toList());
        
        photoIds.forEach(photoId -> {
            try {
                photoRepository.deleteById(photoId);
            } catch (Exception e) {
                log.warn("Error deleting photo ID: {}", photoId, e);
            }
        });

        // Delete event (albums and remaining photos will be cascaded)
        eventRepository.deleteById(id);
        log.info("Event deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByCategory(Long categoryId) {
        log.info("Fetching events for category: {}", categoryId);
        return eventRepository.findByCategoryId(categoryId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void publishEvent(Long id) {
        log.info("Publishing event with ID: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        event.setStatus("PUBLISHED");
        eventRepository.save(event);
        log.info("Event published successfully with ID: {}", id);
    }

    @Override
    @Transactional
    public void unpublishEvent(Long id) {
        log.info("Unpublishing event with ID: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        event.setStatus("DRAFT");
        eventRepository.save(event);
        log.info("Event unpublished successfully with ID: {}", id);
    }

}
