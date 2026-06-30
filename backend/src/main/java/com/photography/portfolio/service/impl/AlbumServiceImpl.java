package com.photography.portfolio.service.impl;

import com.photography.portfolio.dto.request.CreateAlbumRequest;
import com.photography.portfolio.dto.request.ReorderRequest;
import com.photography.portfolio.dto.request.UpdateAlbumRequest;
import com.photography.portfolio.dto.response.AlbumResponse;
import com.photography.portfolio.entity.Album;
import com.photography.portfolio.entity.Event;
import com.photography.portfolio.exception.ResourceNotFoundException;
import com.photography.portfolio.mapper.AlbumMapper;
import com.photography.portfolio.repository.AlbumRepository;
import com.photography.portfolio.repository.EventRepository;
import com.photography.portfolio.service.AlbumService;
import com.photography.portfolio.service.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlbumServiceImpl implements AlbumService {

    private final AlbumRepository albumRepository;
    private final EventRepository eventRepository;
    private final PhotoService photoService;
    private final AlbumMapper albumMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AlbumResponse createAlbum(CreateAlbumRequest request) {
        log.info("Creating new album for event ID: {}", request.getEventId());

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.getEventId()));

        Album album = Album.builder()
                .event(event)
                .albumName(request.getAlbumName())
                .displayOrder(request.getDisplayOrder())
                .build();

        Album savedAlbum = albumRepository.save(album);
        log.info("Album created successfully with ID: {}", savedAlbum.getId());

        return albumMapper.toResponse(savedAlbum);
    }

    @Override
    @Transactional(readOnly = true)
    public AlbumResponse getAlbumById(Long id) {
        log.info("Fetching album with ID: {}", id);
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", id));
        return albumMapper.toResponse(album);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlbumResponse> getAlbumsByEventId(Long eventId) {
        log.info("Fetching albums for event ID: {}", eventId);
        
        // Verify event exists
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", "id", eventId);
        }

        return albumRepository.findByEventIdOrderByDisplayOrder(eventId).stream()
                .map(albumMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AlbumResponse updateAlbum(Long id, UpdateAlbumRequest request) {
        log.info("Updating album with ID: {}", id);

        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", id));

        albumMapper.updateAlbumFromRequest(request, album);
        Album updatedAlbum = albumRepository.save(album);
        log.info("Album updated successfully with ID: {}", updatedAlbum.getId());

        return albumMapper.toResponse(updatedAlbum);
    }

    @Override
    @Transactional
    public void deleteAlbum(Long id) {
        log.info("Deleting album with ID: {}", id);

        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", id));

        // Delete all photos in this album
        photoService.deletePhotosByAlbumId(id);

        albumRepository.deleteById(id);
        log.info("Album deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional
    public void deleteAlbumsByEventId(Long eventId) {
        log.info("Deleting all albums for event ID: {}", eventId);

        List<Album> albums = albumRepository.findByEventIdOrderByDisplayOrder(eventId);
        for (Album album : albums) {
            photoService.deletePhotosByAlbumId(album.getId());
            albumRepository.deleteById(album.getId());
        }

        log.info("All albums deleted for event ID: {}", eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public Album verifyDownloadAndGetAlbum(Long albumId, String email, String pin) {
        log.info("Verifying download credentials for album ID: {}", albumId);

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", albumId));

        Event event = album.getEvent();
        if (event == null) {
            throw new ResourceNotFoundException("Event", "albumId", albumId);
        }

        boolean configured = event.getClientEmail() != null && event.getClientDownloadPin() != null;
        boolean emailMatch = configured
                && event.getClientEmail().equalsIgnoreCase(email == null ? "" : email.trim());
        boolean pinMatch = configured
                && passwordEncoder.matches(pin == null ? "" : pin, event.getClientDownloadPin());

        if (!configured || !emailMatch || !pinMatch) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or PIN");
        }

        // Force-load photos for ZIP streaming while still inside the transaction
        // (the @OneToMany on Album is LAZY, so this must happen before the
        // session closes).
        album.getPhotos().size();

        return album;
    }


    @Override
    @Transactional
    public void reorderAlbums(ReorderRequest request) {
        log.info("Reordering {} albums", request.getOrderedIds().size());
        List<Long> orderedIds = request.getOrderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            Long albumId = orderedIds.get(i);
            albumRepository.findById(albumId).ifPresent(album -> {
                album.setDisplayOrder(orderedIds.indexOf(albumId));
                albumRepository.save(album);
            });
        }
        log.info("Albums reordered successfully");
    }

}