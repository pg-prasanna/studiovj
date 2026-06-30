-- V3__Add_Photo_Orientation.sql
-- Adds image dimension + orientation metadata used by the responsive
-- masonry gallery (portrait/landscape/square sizing).

ALTER TABLE photos
    ADD COLUMN width INT NULL AFTER cloudinary_public_id,
    ADD COLUMN height INT NULL AFTER width,
    ADD COLUMN orientation VARCHAR(20) NULL AFTER height;

ALTER TABLE photos ADD INDEX idx_orientation (orientation);
