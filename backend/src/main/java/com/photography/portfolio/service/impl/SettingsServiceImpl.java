package com.photography.portfolio.service.impl;

import com.photography.portfolio.cloudinary.CloudinaryService;
import com.photography.portfolio.dto.request.SettingsRequest;
import com.photography.portfolio.dto.response.CloudinaryUploadResponse;
import com.photography.portfolio.dto.response.SettingsResponse;
import com.photography.portfolio.entity.Settings;
import com.photography.portfolio.repository.SettingsRepository;
import com.photography.portfolio.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettingsServiceImpl implements SettingsService {

    private final SettingsRepository settingsRepository;
    private final CloudinaryService cloudinaryService;

    private Settings getOrCreate() {
        return settingsRepository.findById(1L).orElseGet(() -> {
            Settings s = Settings.builder().id(1L).studioName("Studio VJ").build();
            return settingsRepository.save(s);
        });
    }

    private SettingsResponse toResponse(Settings s) {
        SettingsResponse response = new SettingsResponse();
        BeanUtils.copyProperties(s, response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public SettingsResponse getSettings() {
        return toResponse(getOrCreate());
    }

    @Override
    @Transactional
    public SettingsResponse updateSettings(SettingsRequest request) {
        Settings settings = getOrCreate();
        BeanUtils.copyProperties(request, settings, getNullPropertyNames(request));
        Settings saved = settingsRepository.save(settings);
        log.info("Settings updated");
        return toResponse(saved);
    }

    private String[] getNullPropertyNames(Object source) {
        org.springframework.beans.BeanWrapper wrapper = new org.springframework.beans.BeanWrapperImpl(source);
        java.beans.PropertyDescriptor[] pds = wrapper.getPropertyDescriptors();
        java.util.List<String> nullProps = new java.util.ArrayList<>();
        for (java.beans.PropertyDescriptor pd : pds) {
            if (wrapper.getPropertyValue(pd.getName()) == null) {
                nullProps.add(pd.getName());
            }
        }
        return nullProps.toArray(new String[0]);
    }

    @Override
    @Transactional
    public SettingsResponse updateLogo(MultipartFile file) {
        Settings settings = getOrCreate();
        if (settings.getLogoPublicId() != null) {
            cloudinaryService.deleteImage(settings.getLogoPublicId());
        }
        CloudinaryUploadResponse upload = cloudinaryService.uploadImage(file);
        settings.setLogoUrl(upload.getSecureUrl());
        settings.setLogoPublicId(upload.getPublicId());
        return toResponse(settingsRepository.save(settings));
    }

    @Override
    @Transactional
    public SettingsResponse updateFavicon(MultipartFile file) {
        Settings settings = getOrCreate();
        if (settings.getFaviconPublicId() != null) {
            cloudinaryService.deleteImage(settings.getFaviconPublicId());
        }
        CloudinaryUploadResponse upload = cloudinaryService.uploadImage(file);
        settings.setFaviconUrl(upload.getSecureUrl());
        settings.setFaviconPublicId(upload.getPublicId());
        return toResponse(settingsRepository.save(settings));
    }
}
