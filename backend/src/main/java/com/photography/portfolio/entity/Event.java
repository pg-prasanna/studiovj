package com.photography.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String location;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    @Column(length = 500)
    private String coverImageUrl;

    @Column(length = 255)
    private String cloudinaryCoverPublicId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "category_id")
    private Long categoryId;

    /** Registered client e-mail address — used for download gate verification. */
    @Column(name = "client_email", length = 255)
    private String clientEmail;

    /**
     * BCrypt-hashed download PIN stored by the admin.
     * The plain-text PIN is NEVER persisted; only the hash is stored here.
     */
    @Column(name = "client_download_pin", length = 255)
    private String clientDownloadPin;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Album> albums;

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
