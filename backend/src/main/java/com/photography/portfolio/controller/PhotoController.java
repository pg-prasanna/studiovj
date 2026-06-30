package com.photography.portfolio.controller;

import com.photography.portfolio.dto.response.ApiResponse;
import com.photography.portfolio.dto.response.PhotoResponse;
import com.photography.portfolio.service.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import com.photography.portfolio.dto.request.ReorderRequest;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@Slf4j
public class PhotoController {

    private final PhotoService photoService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<PhotoResponse>> uploadPhoto(
            @RequestParam Long albumId,
            @RequestParam(required = false) Integer displayOrder,
            @RequestParam(required = false) String orientation,
            @RequestParam MultipartFile file) {
        log.info("POST /api/photos/upload - Uploading photo to album: {}", albumId);
        PhotoResponse response = photoService.uploadPhoto(albumId, file, displayOrder, orientation);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Photo uploaded successfully"));
    }

    @PostMapping("/batch-upload")
    public ResponseEntity<ApiResponse<List<PhotoResponse>>> uploadPhotos(
            @RequestParam Long albumId,
            @RequestParam(required = false) Integer startDisplayOrder,
            @RequestParam(required = false) List<String> orientations,
            @RequestParam("files") List<MultipartFile> files) {
        log.info("POST /api/photos/batch-upload - Uploading {} photos to album: {}", files.size(), albumId);
        List<PhotoResponse> responses = photoService.uploadPhotos(albumId, files, startDisplayOrder, orientations);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(responses, "Photos uploaded successfully"));
    }

    @PatchMapping("/{id}/orientation")
    public ResponseEntity<ApiResponse<PhotoResponse>> updateOrientation(
            @PathVariable Long id,
            @RequestParam String orientation) {
        log.info("PATCH /api/photos/{}/orientation - Setting orientation to: {}", id, orientation);
        PhotoResponse response = photoService.updateOrientation(id, orientation);
        return ResponseEntity.ok(ApiResponse.success(response, "Photo orientation updated successfully"));
    }

    @GetMapping("/album/{albumId}")
    public ResponseEntity<ApiResponse<List<PhotoResponse>>> getPhotosByAlbumId(
            @PathVariable Long albumId) {
        log.info("GET /api/photos/album/{} - Fetching photos by album ID", albumId);
        List<PhotoResponse> photos = photoService.getPhotosByAlbumId(albumId);
        return ResponseEntity.ok(ApiResponse.success(photos, "Photos retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PhotoResponse>> getPhotoById(@PathVariable Long id) {
        log.info("GET /api/photos/{} - Fetching photo by ID", id);
        PhotoResponse photo = photoService.getPhotoById(id);
        return ResponseEntity.ok(ApiResponse.success(photo, "Photo retrieved successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(@PathVariable Long id) {
        log.info("DELETE /api/photos/{} - Deleting photo", id);
        photoService.deletePhoto(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Photo deleted successfully"));
    }


    @PutMapping("/album/{albumId}/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderPhotos(
            @PathVariable Long albumId,
            @RequestBody com.photography.portfolio.dto.request.ReorderRequest request) {
        log.info("PUT /api/photos/album/{}/reorder - Reordering {} photos", albumId, request.getOrderedIds().size());
        photoService.reorderPhotos(albumId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Photos reordered successfully"));
    }

}
