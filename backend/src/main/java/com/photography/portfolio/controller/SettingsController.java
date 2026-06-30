package com.photography.portfolio.controller;

import com.photography.portfolio.dto.request.SettingsRequest;
import com.photography.portfolio.dto.response.ApiResponse;
import com.photography.portfolio.dto.response.SettingsResponse;
import com.photography.portfolio.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<SettingsResponse>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getSettings(), "Settings retrieved"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SettingsResponse>> updateSettings(@RequestBody SettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(settingsService.updateSettings(request), "Settings updated"));
    }

    @PostMapping(value = "/logo", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<SettingsResponse>> updateLogo(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(settingsService.updateLogo(file), "Logo updated"));
    }

    @PostMapping(value = "/favicon", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<SettingsResponse>> updateFavicon(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(settingsService.updateFavicon(file), "Favicon updated"));
    }
}
