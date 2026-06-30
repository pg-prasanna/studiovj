package com.photography.portfolio.service;

import com.photography.portfolio.dto.request.SettingsRequest;
import com.photography.portfolio.dto.response.SettingsResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SettingsService {

    SettingsResponse getSettings();

    SettingsResponse updateSettings(SettingsRequest request);

    SettingsResponse updateLogo(MultipartFile file);

    SettingsResponse updateFavicon(MultipartFile file);

}
