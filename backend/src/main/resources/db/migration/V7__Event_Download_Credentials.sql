-- V7__Event_Download_Credentials.sql
-- Per-event download protection.
-- client_email : the email address the admin registers for the client.
-- client_download_pin : a short alphanumeric PIN the admin sets;
--   stored as a BCrypt hash in the application layer (never plain text).

ALTER TABLE events
    ADD COLUMN client_email VARCHAR(255) NULL COMMENT 'Registered client email for download access',
    ADD COLUMN client_download_pin VARCHAR(255) NULL COMMENT 'BCrypt-hashed download PIN set by admin';

CREATE INDEX idx_events_client_email ON events(client_email);
