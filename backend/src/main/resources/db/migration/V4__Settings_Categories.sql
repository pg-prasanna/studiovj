-- V4__Settings_Categories.sql

CREATE TABLE IF NOT EXISTS settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    studio_name VARCHAR(255),
    tagline VARCHAR(255),
    logo_url VARCHAR(500),
    logo_public_id VARCHAR(255),
    favicon_url VARCHAR(500),
    favicon_public_id VARCHAR(255),
    hero_heading VARCHAR(255),
    hero_subheading TEXT,
    about_text_1 TEXT,
    about_text_2 TEXT,
    about_text_3 TEXT,
    since_year VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    address VARCHAR(500),
    website VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    youtube VARCHAR(255),
    footer_text TEXT,
    copyright_text VARCHAR(255),
    primary_color VARCHAR(20),
    accent_color VARCHAR(20),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(500),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT chk_settings_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (id, studio_name, tagline, since_year, created_at, updated_at)
SELECT 1, 'Studio VJ', 'Professional Photography & Videography', '2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY unique_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE events ADD COLUMN category_id BIGINT NULL AFTER status;
ALTER TABLE events ADD CONSTRAINT fk_event_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE events ADD INDEX idx_category_id (category_id);
