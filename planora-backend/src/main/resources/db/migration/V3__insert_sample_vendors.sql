-- V3__insert_sample_vendors.sql
-- ==========================================
-- SEED VENDOR USERS
-- ==========================================
INSERT INTO users (id, email, password, full_name, phone, role_id, provider, status)
VALUES (4, 'decor1@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyen Van Decor', '0912111111', 2, 'LOCAL', 'ACTIVE'),
       (5, 'dress1@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Tran Thi Dress', '0912222222', 2, 'LOCAL', 'ACTIVE'),
       (6, 'photo1@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Le Huy Photo', '0912333333', 2, 'LOCAL', 'ACTIVE'),
       (7, 'studio1@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Taylor Parker', '0912444444', 2, 'LOCAL', 'ACTIVE'),
       (8, 'planner1@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Pham Hoang Planner', '0912555555', 2, 'LOCAL', 'ACTIVE'),
       (9, 'decor2@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Vu Binh Decor', '0912666666', 2, 'LOCAL', 'ACTIVE'),
       (10, 'venue1@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'The Royal Chapel Manager', '0912777777', 2, 'LOCAL', 'ACTIVE'),
       (11, 'venue2@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Green Meadow Garden Manager', '0912888888', 2, 'LOCAL', 'ACTIVE'),
       (12, 'venue3@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Ocean Whisper Club Manager', '0912999999', 2, 'LOCAL', 'ACTIVE'),
       (13, 'makeup1@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Hoang My Makeup', '0912000000', 2, 'LOCAL', 'ACTIVE'),
       (14, 'dress2@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyen Ha Dress', '0912121212', 2, 'LOCAL', 'ACTIVE'),
       (15, 'studio2@planora.com', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Luna Studio Manager', '0912343434', 2, 'LOCAL', 'ACTIVE');

-- ==========================================
-- SEED VENDORS
-- ==========================================
INSERT INTO vendors (id, user_id, business_name, description, experience_years, city, district, verified, rating_average, total_reviews)
VALUES (2, 4, 'Rosy Floral Design', 'Chuyên thiết kế trang trí hoa tươi và tiệc cưới ngoài trời lãng mạn.', 6, 'Đà Lạt', 'Phường 1', TRUE, 4.8, 122),
       (3, 5, 'Lalaland Bridal', 'Cung cấp váy cưới cao cấp thiết kế riêng và dịch vụ cho thuê trang phục.', 8, 'TP. Hồ Chí Minh', 'Quận 1', TRUE, 5.0, 110),
       (4, 6, 'Jordan Lee Photography', 'Chụp ảnh cưới nghệ thuật phóng sự, pre-wedding chuyên nghiệp chất lượng cao.', 4, 'Hà Nội', 'Hoàn Kiếm', TRUE, 4.9, 95),
       (5, 7, 'Taylor Parker Studio', 'Ảnh viện áo cưới trọn gói chất lượng cao hàng đầu.', 5, 'Đà Nẵng', 'Hải Châu', TRUE, 4.7, 88),
       (6, 8, 'Authentic Wedding Planner', 'Lên kế hoạch và thực hiện đám cưới trọn gói sang trọng đẳng cấp.', 7, 'Nha Trang', 'Lộc Thọ', TRUE, 4.6, 75),
       (7, 9, 'Reverie Decor', 'Trang trí tiệc cưới sang trọng, hiện đại với phong cách tối giản thanh lịch.', 3, 'TP. Hồ Chí Minh', 'Quận 3', FALSE, 4.4, 54),
       (8, 10, 'The Royal Chapel', 'Không gian tiệc cưới nhà thờ cổ kính mang phong cách hoàng gia châu Âu.', 10, 'Hà Nội', 'Tây Hồ', TRUE, 4.9, 142),
       (9, 11, 'Green Meadow Garden', 'Sân vườn cỏ xanh ngát giữa thung lũng Đà Lạt dành cho tiệc ngoài trời.', 5, 'Đà Lạt', 'Phường 10', TRUE, 4.8, 63),
       (10, 12, 'Ocean Whisper Beach Club', 'Bãi biển thơ mộng cho hôn lễ ngoài trời đón hoàng hôn Nha Trang.', 4, 'Nha Trang', 'Vĩnh Trường', TRUE, 4.9, 81),
       (11, 13, 'Glamour Makeup Artistry', 'Trang điểm cô dâu phong cách Hàn Quốc tự nhiên trong trẻo.', 5, 'TP. Hồ Chí Minh', 'Quận 1', TRUE, 4.7, 42),
       (12, 14, 'Classic Tuxedo & Dress', 'Vest chú rể cổ điển lịch lãm và váy cưới chữ A thanh lịch.', 3, 'Hà Nội', 'Đống Đa', FALSE, 4.3, 29),
       (13, 15, 'Luna Studio', 'Studio chụp ảnh pre-wedding phong cách vintage nghệ thuật.', 6, 'Đà Nẵng', 'Sơn Trà', TRUE, 4.8, 66);

-- ==========================================
-- SEED VENDOR STYLES (Styles: 1-Traditional, 2-Minimalist, 3-Luxury, 4-Garden, 5-Beach)
-- ==========================================
INSERT INTO vendor_styles (vendor_id, wedding_style_id)
VALUES (2, 4), -- Rosy - Garden
       (2, 2), -- Rosy - Minimalist
       (3, 3), -- Lalaland - Luxury
       (4, 3), -- Jordan Lee - Luxury
       (4, 1), -- Jordan Lee - Traditional
       (5, 1), -- Taylor - Traditional
       (5, 2), -- Taylor - Minimalist
       (6, 3), -- Authentic - Luxury
       (7, 2), -- Reverie - Minimalist
       (8, 3), -- Royal Chapel - Luxury
       (9, 4), -- Green Meadow - Garden
       (10, 5), -- Ocean Whisper - Beach
       (11, 2), -- Glamour - Minimalist
       (12, 1), -- Classic - Traditional
       (13, 2); -- Luna - Minimalist

-- ==========================================
-- SEED VENDOR SERVICES (Categories: 1-Studio, 2-Makeup, 3-Planner, 4-Decor, 5-Dress, 6-Photo, 7-Venue)
-- ==========================================
INSERT INTO vendor_services (id, vendor_id, category_id, service_name, description, price_from, price_to)
VALUES (1, 2, 4, 'Trang trí tiệc hoa tươi', 'Gói thiết kế trang trí hoa tươi trọn gói cho hôn lễ sân vườn.', 15000000, 30000000),
       (2, 3, 5, 'Váy cưới nhập khẩu cao cấp', 'Cho thuê váy cưới thương hiệu nhập khẩu nguyên chiếc từ Châu Âu.', 10000000, 25000000),
       (3, 4, 6, 'Gói phóng sự cưới trọn gói', 'Chụp ảnh ngày cưới 2 máy chính chuyên nghiệp chất lượng cao.', 12000000, 22000000),
       (4, 5, 1, 'Pre-wedding Đà Nẵng trọn gói', 'Chụp ảnh ngoại cảnh pre-wedding Đà Nẵng trọn gói váy cưới và trang điểm.', 18000000, 35000000),
       (5, 6, 3, 'Kế hoạch cưới trọn gói A-Z', 'Lên kế hoạch, thiết kế concept và điều phối toàn bộ ngày cưới.', 25000000, 50000000),
       (6, 7, 4, 'Trang trí tiệc cưới hiện đại', 'Trang trí gia tiên và tiệc cưới phong cách tối giản thời thượng.', 8000000, 18000000),
       (7, 8, 7, 'Sảnh tiệc lâu đài hoàng gia', 'Thuê sảnh tiệc trong nhà kính hoàng gia sức chứa 500 khách.', 50000000, 120000000),
       (8, 9, 7, 'Sân cỏ tiệc ngoài trời', 'Thuê khu vực đồi cỏ thung lũng lãng mạn tại Đà Lạt.', 20000000, 45000000),
       (9, 10, 7, 'Bãi biển riêng tư tiệc cưới', 'Thuê bãi biển riêng của câu lạc bộ cho hôn lễ riêng tư.', 30000000, 60000000),
       (10, 11, 2, 'Trang điểm cô dâu ngày cưới', 'Dịch vụ trang điểm cô dâu và mẹ cô dâu tại nhà hoặc nhà hàng.', 3000000, 8000000),
       (11, 12, 5, 'Thuê Vest và Váy cưới', 'Gói thuê trang phục chú rể và cô dâu đơn giản lịch sự.', 5000000, 10000000),
       (12, 13, 1, 'Album cưới Vintage cổ điển', 'Chụp ảnh pre-wedding phong cách film nghệ thuật lãng mạn.', 9000000, 16000000);

-- ==========================================
-- SEED VENDOR PACKAGES
-- ==========================================
INSERT INTO vendor_packages (id, vendor_service_id, package_name, description, price)
VALUES (1, 1, 'Gói trang trí cơ bản', 'Trang trí sân khấu chính, cổng hoa tươi cơ bản và bàn đón khách.', 15000000),
       (2, 1, 'Gói trang trí cao cấp', 'Trang trí toàn bộ không gian hoa tươi nhập khẩu và hiệu ứng ánh sáng.', 30000000),
       (3, 2, 'Thuê váy cưới Luxury', 'Thuê 1 váy cưới dòng Limited cao cấp kèm trang sức cô dâu.', 25000000),
       (4, 3, 'Chụp phóng sự cưới Standard', '1 nhiếp ảnh gia chính chụp từ lễ gia tiên đến tiệc nhà hàng.', 12000000),
       (5, 4, 'Trọn gói Pre-wedding Gold', 'Chụp ngoại cảnh 3 địa điểm Đà Nẵng, giao toàn bộ file và tặng album cao cấp.', 35000000),
       (6, 7, 'Thuê sảnh tiệc Royal', 'Bao gồm phí thuê không gian, âm thanh ánh sáng sân khấu tiêu chuẩn.', 50000000),
       (7, 10, 'Gói makeup cô dâu VIP', 'Trang điểm và làm tóc cô dâu ngày đám hỏi và ngày tiệc chính.', 8000000);

-- ==========================================
-- SEED VENDOR PORTFOLIOS
-- ==========================================
INSERT INTO vendor_portfolios (id, vendor_id, image_url, title, description)
VALUES (1, 2, 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600', 'Lễ đường Hoa Hồng Đà Lạt', 'Trang trí tiệc cưới sân vườn thơ mộng ngập tràn hoa hồng leo.'),
       (2, 3, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600', 'BST Váy cưới Hoàng gia 2026', 'Mẫu váy cưới đuôi cá trễ vai đính kết pha lê lấp lánh.'),
       (3, 4, 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600', 'Hôn lễ Hoàng Gia Hà Nội', 'Bộ ảnh phóng sự cưới lãng mạn tại khách sạn Metropole.'),
       (4, 5, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600', 'Pre-wedding trên đồi cát Đà Nẵng', 'Bộ ảnh pre-wedding ngập tràn gió biển đón hoàng hôn.'),
       (5, 8, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600', 'Đám cưới pha lê trong suốt', 'Thiết kế tiệc cưới nhà kính lung linh huyền ảo tại Hà Nội.');
