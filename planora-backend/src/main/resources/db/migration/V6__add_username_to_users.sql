-- V6__add_username_to_users.sql
-- ==========================================
-- ADD USERNAME COLUMN TO USERS TABLE
-- ==========================================

ALTER TABLE users ADD COLUMN username VARCHAR(100) NULL AFTER full_name;

-- Backfill username from email prefix for existing users
UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL;

-- Ensure username is unique
ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (username);
