-- V7__create_notification_preferences_schema.sql
-- ==========================================
-- CREATE NOTIFICATION PREFERENCES TABLE & ENHANCE NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    browser_push_enabled BOOLEAN DEFAULT FALSE,
    task_due_reminder_enabled BOOLEAN DEFAULT TRUE,
    payment_due_reminder_enabled BOOLEAN DEFAULT TRUE,
    wedding_milestone_reminder_enabled BOOLEAN DEFAULT TRUE,
    remind_days_before INT DEFAULT 3,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_pref_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

ALTER TABLE notifications ADD COLUMN link_url VARCHAR(255) NULL AFTER is_read;
