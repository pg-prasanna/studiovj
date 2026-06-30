package com.photography.portfolio.controller;

import com.photography.portfolio.dto.request.CreateAlbumRequest;
import com.photography.portfolio.dto.request.ReorderRequest;
import com.photography.portfolio.dto.request.DownloadAlbumRequest;
import com.photography.portfolio.dto.request.UpdateAlbumRequest;
import com.photography.portfolio.dto.response.AlbumResponse;
import com.photography.portfolio.dto.response.ApiResponse;
import com.photography.portfolio.entity.Album;
import com.photography.portfolio.entity.Photo;
import com.photography.portfolio.service.AlbumService;
import com.photography.portfolio.util.StringUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
@Slf4j
public class AlbumController {

    private final AlbumService albumService;

    @PostMapping
    public ResponseEntity<ApiResponse<AlbumResponse>> createAlbum(
            @Valid @RequestBody CreateAlbumRequest request) {
        log.info("POST /api/albums - Creating new album for event: {}", request.getEventId());
        AlbumResponse response = albumService.createAlbum(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Album created successfully"));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<List<AlbumResponse>>> getAlbumsByEventId(
            @PathVariable Long eventId) {
        log.info("GET /api/albums/event/{} - Fetching albums by event ID", eventId);
        List<AlbumResponse> albums = albumService.getAlbumsByEventId(eventId);
        return ResponseEntity.ok(ApiResponse.success(albums, "Albums retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AlbumResponse>> getAlbumById(@PathVariable Long id) {
        log.info("GET /api/albums/{} - Fetching album by ID", id);
        AlbumResponse album = albumService.getAlbumById(id);
        return ResponseEntity.ok(ApiResponse.success(album, "Album retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AlbumResponse>> updateAlbum(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAlbumRequest request) {
        log.info("PUT /api/albums/{} - Updating album", id);
        AlbumResponse response = albumService.updateAlbum(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Album updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAlbum(@PathVariable Long id) {
        log.info("DELETE /api/albums/{} - Deleting album", id);
        albumService.deleteAlbum(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Album deleted successfully"));
    }

    /**
     * Public endpoint: verified event clients can download an entire album as a
     * single ZIP file. The same email + PIN configured by the admin on the
     * parent Event must be supplied here — non-clients are rejected with 401
     * before any photo bytes are streamed.
     */
    @PostMapping("/{id}/download")
    public void downloadAlbumZip(
            @PathVariable Long id,
            @Valid @RequestBody DownloadAlbumRequest request,
            HttpServletResponse response) throws IOException {

        log.info("POST /api/albums/{}/download - Verifying and preparing album ZIP", id);

        Album album = albumService.verifyDownloadAndGetAlbum(id, request.getEmail(), request.getPin());
        List<Photo> photos = album.getPhotos();

        String zipFilename = StringUtils.sanitizeFilename(album.getAlbumName()) + ".zip";

        response.setContentType("application/zip");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + zipFilename + "\"");

        try (ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())) {
            int index = 1;
            for (Photo photo : photos) {
                String entryName = buildZipEntryName(photo, index++);
                try {
                    addPhotoToZip(zos, photo.getImageUrl(), entryName);
                } catch (IOException e) {
                    log.warn("Skipping photo {} in album {} ZIP — failed to fetch from source: {}",
                            photo.getId(), id, e.getMessage());
                }
            }
            zos.finish();
        }
    }

    private String buildZipEntryName(Photo photo, int index) {
        String base = String.format("photo-%03d", index);
        String url = photo.getImageUrl();
        String ext = "jpg";
        if (url != null) {
            int dot = url.lastIndexOf('.');
            int slash = url.lastIndexOf('/');
            if (dot > -1 && dot > slash && dot < url.length() - 1) {
                String candidate = url.substring(dot + 1).split("[?#]")[0];
                if (candidate.length() > 0 && candidate.length() <= 5) {
                    ext = candidate;
                }
            }
        }
        return StringUtils.sanitizeFilename(base) + "." + StringUtils.sanitizeFilename(ext);
    }

    private void addPhotoToZip(ZipOutputStream zos, String imageUrl, String entryName) throws IOException {
        URL url = new URL(imageUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(10_000);
        connection.setReadTimeout(20_000);
        connection.setRequestMethod("GET");

        try (var inputStream = connection.getInputStream()) {
            zos.putNextEntry(new ZipEntry(entryName));
            inputStream.transferTo(zos);
            zos.closeEntry();
        } finally {
            connection.disconnect();
        }
    }


    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderAlbums(
            @RequestBody ReorderRequest request) {
        log.info("PUT /api/albums/reorder - Reordering {} albums", request.getOrderedIds().size());
        albumService.reorderAlbums(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Albums reordered successfully"));
    }

}