package com.photography.portfolio.service;

import com.photography.portfolio.dto.request.CreateAlbumRequest;
import com.photography.portfolio.dto.request.ReorderRequest;
import com.photography.portfolio.dto.request.UpdateAlbumRequest;
import com.photography.portfolio.dto.response.AlbumResponse;
import com.photography.portfolio.entity.Album;

import java.util.List;

public interface AlbumService {

    AlbumResponse createAlbum(CreateAlbumRequest request);

    AlbumResponse getAlbumById(Long id);

    List<AlbumResponse> getAlbumsByEventId(Long eventId);

    AlbumResponse updateAlbum(Long id, UpdateAlbumRequest request);

    void deleteAlbum(Long id);

    void deleteAlbumsByEventId(Long eventId);

    /**
     * Verifies the guest-supplied email + PIN against the album's parent Event,
     * then returns the fully-loaded Album entity (with its photos) ready for
     * ZIP streaming. Throws if credentials don't match or the event has no
     * download protection configured at all.
     */
    Album verifyDownloadAndGetAlbum(Long albumId, String email, String pin);

    void reorderAlbums(ReorderRequest request);

}
