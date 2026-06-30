package com.photography.portfolio.service;

import com.photography.portfolio.dto.response.PhotoResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PhotoService {

    PhotoResponse uploadPhoto(Long albumId, MultipartFile file, Integer displayOrder, String orientationOverride);

    List<PhotoResponse> uploadPhotos(Long albumId, List<MultipartFile> files, Integer startDisplayOrder, List<String> orientationOverrides);

    PhotoResponse updateOrientation(Long photoId, String orientation);

    PhotoResponse getPhotoById(Long id);

    List<PhotoResponse> getPhotosByAlbumId(Long albumId);

    List<PhotoResponse> getPhotosByEventId(Long eventId);

    void deletePhoto(Long id);

    void deletePhotosByAlbumId(Long albumId);

    void deletePhotosByEventId(Long eventId);


    void reorderPhotos(Long albumId, com.photography.portfolio.dto.request.ReorderRequest request);

}
