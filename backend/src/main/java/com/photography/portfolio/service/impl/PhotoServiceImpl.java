package com.photography.portfolio.service.impl;

import com.photography.portfolio.cloudinary.CloudinaryService;
import com.photography.portfolio.dto.response.CloudinaryUploadResponse;
import com.photography.portfolio.dto.response.PhotoResponse;
import com.photography.portfolio.entity.Album;
import com.photography.portfolio.entity.Orientation;
import com.photography.portfolio.entity.Photo;
import com.photography.portfolio.exception.BadRequestException;
import com.photography.portfolio.exception.ResourceNotFoundException;
import com.photography.portfolio.mapper.PhotoMapper;
import com.photography.portfolio.repository.AlbumRepository;
import com.photography.portfolio.repository.PhotoRepository;
import com.photography.portfolio.service.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhotoServiceImpl implements PhotoService {

    private final PhotoRepository photoRepository;
    private final AlbumRepository albumRepository;
    private final PhotoMapper photoMapper;
    private final CloudinaryService cloudinaryService;

    /**
     * Resolves the final orientation for a photo: a valid manual override
     * always wins, otherwise it falls back to auto-detection from
     * pixel dimensions returned by Cloudinary.
     */
    private Orientation resolveOrientation(String override, Long width, Long height) {
        if (override != null && !override.isBlank()) {
            try {
                return Orientation.valueOf(override.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException(
                        "Invalid orientation value: " + override + ". Must be one of PORTRAIT, LANDSCAPE, SQUARE",
                        "INVALID_ORIENTATION"
                );
            }
        }
        long w = width != null ? width : 0L;
        long h = height != null ? height : 0L;
        return Orientation.detect(w, h);
    }

    @Override
    @Transactional
    public PhotoResponse uploadPhoto(Long albumId, MultipartFile file, Integer displayOrder, String orientationOverride) {
        log.info("Uploading photo to album ID: {}", albumId);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty", "EMPTY_FILE");
        }

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", albumId));

        // Upload to Cloudinary
        CloudinaryUploadResponse uploadResponse = cloudinaryService.uploadImage(file);
        log.info("Photo uploaded to Cloudinary with public ID: {}", uploadResponse.getPublicId());

        Orientation orientation = resolveOrientation(
                orientationOverride, uploadResponse.getWidth(), uploadResponse.getHeight());

        // Create Photo entity
        Photo photo = Photo.builder()
                .album(album)
                .imageUrl(uploadResponse.getSecureUrl())
                .cloudinaryPublicId(uploadResponse.getPublicId())
                .width(uploadResponse.getWidth() != null ? uploadResponse.getWidth().intValue() : null)
                .height(uploadResponse.getHeight() != null ? uploadResponse.getHeight().intValue() : null)
                .orientation(orientation)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .build();

        Photo savedPhoto = photoRepository.save(photo);
        log.info("Photo saved to database with ID: {}", savedPhoto.getId());

        return photoMapper.toResponse(savedPhoto);
    }

    @Override
    @Transactional
    public List<PhotoResponse> uploadPhotos(Long albumId, List<MultipartFile> files, Integer startDisplayOrder, List<String> orientationOverrides) {
        log.info("Uploading {} photos to album ID: {}", files.size(), albumId);

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", albumId));

        if (files == null || files.isEmpty()) {
            throw new BadRequestException("At least one file must be provided", "NO_FILES_PROVIDED");
        }

        List<PhotoResponse> uploadedPhotos = new ArrayList<>();
        int displayOrder = startDisplayOrder != null ? startDisplayOrder : 0;

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String override = (orientationOverrides != null && i < orientationOverrides.size())
                    ? orientationOverrides.get(i)
                    : null;
            try {
                if (!file.isEmpty()) {
                    CloudinaryUploadResponse uploadResponse = cloudinaryService.uploadImage(file);
                    log.info("Photo uploaded to Cloudinary: {}", uploadResponse.getPublicId());

                    Orientation orientation = resolveOrientation(
                            override, uploadResponse.getWidth(), uploadResponse.getHeight());

                    Photo photo = Photo.builder()
                            .album(album)
                            .imageUrl(uploadResponse.getSecureUrl())
                            .cloudinaryPublicId(uploadResponse.getPublicId())
                            .width(uploadResponse.getWidth() != null ? uploadResponse.getWidth().intValue() : null)
                            .height(uploadResponse.getHeight() != null ? uploadResponse.getHeight().intValue() : null)
                            .orientation(orientation)
                            .displayOrder(displayOrder++)
                            .build();

                    Photo savedPhoto = photoRepository.save(photo);
                    uploadedPhotos.add(photoMapper.toResponse(savedPhoto));
                    log.info("Photo saved with ID: {}", savedPhoto.getId());
                }
            } catch (BadRequestException e) {
                throw e;
            } catch (Exception e) {
                log.error("Error uploading file: {}", file.getOriginalFilename(), e);
                throw new BadRequestException("Error uploading file: " + file.getOriginalFilename(), "FILE_UPLOAD_ERROR");
            }
        }

        log.info("Successfully uploaded {} photos to album ID: {}", uploadedPhotos.size(), albumId);
        return uploadedPhotos;
    }

    @Override
    @Transactional
    public PhotoResponse updateOrientation(Long photoId, String orientation) {
        log.info("Updating orientation for photo ID: {} to {}", photoId, orientation);

        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));

        Orientation resolved;
        try {
            resolved = Orientation.valueOf(orientation.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid orientation value: " + orientation + ". Must be one of PORTRAIT, LANDSCAPE, SQUARE",
                    "INVALID_ORIENTATION"
            );
        }

        photo.setOrientation(resolved);
        Photo saved = photoRepository.save(photo);
        return photoMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PhotoResponse getPhotoById(Long id) {
        log.info("Fetching photo with ID: {}", id);
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", id));
        return photoMapper.toResponse(photo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PhotoResponse> getPhotosByAlbumId(Long albumId) {
        log.info("Fetching photos for album ID: {}", albumId);
        
        if (!albumRepository.existsById(albumId)) {
            throw new ResourceNotFoundException("Album", "id", albumId);
        }

        return photoRepository.findByAlbumIdOrderByDisplayOrder(albumId).stream()
                .map(photoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PhotoResponse> getPhotosByEventId(Long eventId) {
        log.info("Fetching photos for event ID: {}", eventId);
        return photoRepository.findAllByEventId(eventId).stream()
                .map(photoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePhoto(Long id) {
        log.info("Deleting photo with ID: {}", id);

        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", id));

        // Delete from Cloudinary
        cloudinaryService.deleteImage(photo.getCloudinaryPublicId());
        log.info("Photo deleted from Cloudinary: {}", photo.getCloudinaryPublicId());

        photoRepository.deleteById(id);
        log.info("Photo deleted from database with ID: {}", id);
    }

    @Override
    @Transactional
    public void deletePhotosByAlbumId(Long albumId) {
        log.info("Deleting all photos for album ID: {}", albumId);

        List<Photo> photos = photoRepository.findByAlbumId(albumId);
        for (Photo photo : photos) {
            try {
                cloudinaryService.deleteImage(photo.getCloudinaryPublicId());
                photoRepository.deleteById(photo.getId());
                log.info("Photo deleted: {}", photo.getId());
            } catch (Exception e) {
                log.warn("Error deleting photo ID: {}", photo.getId(), e);
            }
        }

        log.info("All photos deleted for album ID: {}", albumId);
    }

    @Override
    @Transactional
    public void deletePhotosByEventId(Long eventId) {
        log.info("Deleting all photos for event ID: {}", eventId);

        List<Photo> photos = photoRepository.findAllByEventId(eventId);
        for (Photo photo : photos) {
            try {
                cloudinaryService.deleteImage(photo.getCloudinaryPublicId());
                photoRepository.deleteById(photo.getId());
                log.info("Photo deleted: {}", photo.getId());
            } catch (Exception e) {
                log.warn("Error deleting photo ID: {}", photo.getId(), e);
            }
        }

        log.info("All photos deleted for event ID: {}", eventId);
    }


    @Override
    @Transactional
    public void reorderPhotos(Long albumId, com.photography.portfolio.dto.request.ReorderRequest request) {
        log.info("Reordering {} photos for album ID: {}", request.getOrderedIds().size(), albumId);
        java.util.List<Long> orderedIds = request.getOrderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            final Long photoId = orderedIds.get(i);
            photoRepository.findById(photoId).ifPresent(photo -> {
                photo.setDisplayOrder(order);
                photoRepository.save(photo);
            });
        }
    }

}
