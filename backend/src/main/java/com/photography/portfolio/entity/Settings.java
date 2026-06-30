package com.photography.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settings {

    @Id
    private Long id;

    private String studioName;
    private String tagline;
    private String logoUrl;
    private String logoPublicId;
    private String faviconUrl;
    private String faviconPublicId;

    private String heroHeading;
    @Column(columnDefinition = "TEXT")
    private String heroSubheading;
    @Column(name = "about_text_1", columnDefinition = "TEXT")
    private String aboutText1;
    @Column(name = "about_text_2", columnDefinition = "TEXT")
    private String aboutText2;
    @Column(name = "about_text_3", columnDefinition = "TEXT")
    private String aboutText3;
    private String sinceYear;

    private String email;
    private String phone;
    private String whatsapp;
    private String address;
    private String website;

    private String instagram;
    private String facebook;
    private String youtube;

    @Column(columnDefinition = "TEXT")
    private String footerText;
    private String copyrightText;

    private String primaryColor;
    private String accentColor;

    private String seoTitle;
    @Column(columnDefinition = "TEXT")
    private String seoDescription;
    private String seoKeywords;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
