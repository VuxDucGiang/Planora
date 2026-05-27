-- V2__insert_sample_users.sql
-- ==========================================
-- SEED ROLES
-- ==========================================
INSERT INTO roles (id, role_name) VALUES (1, 'ADMIN');
INSERT INTO roles (id, role_name) VALUES (2, 'VENDOR');
INSERT INTO roles (id, role_name) VALUES (3, 'USER');

-- ==========================================
-- SEED USERS
-- Password for all seed users is '123456'
-- ==========================================
INSERT INTO users (id, email, password, full_name, phone, role_id, provider, status)
VALUES (1, 'admin@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'System Administrator', '0912345678', 1, 'LOCAL', 'ACTIVE');

INSERT INTO users (id, email, password, full_name, phone, role_id, provider, status)
VALUES (2, 'vendor@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Planora Vendor', '0987654321', 2, 'LOCAL', 'ACTIVE');

INSERT INTO users (id, email, password, full_name, phone, role_id, provider, status)
VALUES (3, 'user@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Planora Customer', '0901234567', 3, 'LOCAL', 'ACTIVE');

-- ==========================================
-- SEED VENDORS
-- Corresponding vendor for the VENDOR user
-- ==========================================
INSERT INTO vendors (id, user_id, business_name, description, experience_years, city, district, verified)
VALUES (1, 2, 'Planora Palace', 'Luxury wedding planner and event management service', 5, 'Hanoi', 'Hoan Kiem', TRUE);
