package com.photography.portfolio.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    /**
     * Comma-separated list of allowed origins.
     * Configured via CORS_ALLOWED_ORIGINS env var → cors.allowed-origins in application.yml.
     * Fallback is defined in application.yml only (not hardcoded here).
     */
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @PostConstruct
    public void init() {
        log.info("CORS allowed origins: {}", allowedOrigins);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = allowedOrigins.split(",");

        registry.addMapping("/api/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
