-- Add photo ordering index if it does not already exist.

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'photos'
      AND index_name = 'idx_photos_album_display_order'
);

SET @sql = IF(
    @index_exists = 0,
    'CREATE INDEX idx_photos_album_display_order ON photos(album_id, display_order)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;