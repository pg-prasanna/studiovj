-- V6__Visitor_Analytics.sql
-- Stores guest-access visitor analytics for public galleries.
-- One row per (event, email) pair; revisits increment visit_count and bump last_visit.

CREATE TABLE IF NOT EXISTS visitors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_visit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    visit_count INT NOT NULL DEFAULT 1,
    CONSTRAINT uq_visitor_event_email UNIQUE (event_id, email),
    CONSTRAINT fk_visitor_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_visitors_event_id ON visitors(event_id);
CREATE INDEX idx_visitors_email ON visitors(email);
