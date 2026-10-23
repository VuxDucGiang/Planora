-- V10__create_vendor_collections_and_images.sql
-- Nâng cấp Bộ sưu tập tác phẩm: 1 vendor có nhiều bộ sưu tập (albums), 1 bộ sưu tập có nhiều ảnh

CREATE TABLE IF NOT EXISTS vendor_collections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vendor_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    cover_image_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vendor_collection_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES vendors (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vendor_collection_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    collection_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    title VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collection_image_collection
        FOREIGN KEY (collection_id)
        REFERENCES vendor_collections (id)
        ON DELETE CASCADE
);

-- Di chuyển dữ liệu mẫu từ vendor_portfolios sang vendor_collections và vendor_collection_images (nếu có dữ liệu)
INSERT INTO vendor_collections (vendor_id, title, description, cover_image_url, created_at)
SELECT vendor_id, 
       COALESCE(NULLIF(title, ''), 'Bộ sưu tập tác phẩm'), 
       description, 
       image_url, 
       created_at
FROM vendor_portfolios;

-- Chèn ảnh tương ứng vào vendor_collection_images
INSERT INTO vendor_collection_images (collection_id, image_url, title, created_at)
SELECT c.id, p.image_url, p.title, p.created_at
FROM vendor_portfolios p
JOIN vendor_collections c ON c.vendor_id = p.vendor_id AND c.cover_image_url = p.image_url;

