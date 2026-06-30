package com.photography.portfolio.dto.response;

import lombok.Data;

@Data
public class SettingsResponse {

    private String studioName;
    private String tagline;
    private String logoUrl;
    private String faviconUrl;

    private String heroHeading;
    private String heroSubheading;
    private String aboutText1;
    private String aboutText2;
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

    private String footerText;
    private String copyrightText;

    private String primaryColor;
    private String accentColor;

    private String seoTitle;
    private String seoDescription;
    private String seoKeywords;

}
