-- V2__Add_Indexes.sql
-- Add additional indexes for performance optimization

-- Composite index for event lookups with status
ALTER TABLE events ADD INDEX idx_status_event_date (status, event_date);

-- Composite index for album queries
ALTER TABLE albums ADD INDEX idx_event_album_name (event_id, album_name);

-- Composite index for photo queries
ALTER TABLE photos ADD INDEX idx_album_display_order (album_id, display_order);

-- Index for date range queries
ALTER TABLE events ADD INDEX idx_created_at (created_at);
ALTER TABLE albums ADD INDEX idx_created_at (created_at);
ALTER TABLE photos ADD INDEX idx_created_at (created_at);
