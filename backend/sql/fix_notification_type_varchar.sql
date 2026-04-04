-- Fix for "Data truncated for column 'type'"
-- Convert ENUM column to VARCHAR to safely handle new Java enum values
ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50);
