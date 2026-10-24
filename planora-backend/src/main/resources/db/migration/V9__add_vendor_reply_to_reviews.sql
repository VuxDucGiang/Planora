-- V9__add_vendor_reply_to_reviews.sql
-- Thêm cột phản hồi của Vendor vào bảng reviews

ALTER TABLE reviews
ADD COLUMN vendor_reply TEXT NULL,
ADD COLUMN replied_at TIMESTAMP NULL;
