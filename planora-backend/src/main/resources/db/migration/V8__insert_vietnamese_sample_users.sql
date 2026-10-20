-- V8__insert_vietnamese_sample_users.sql
-- ==============================================================================
-- SEED 40 REALISTIC VIETNAMESE USERS & WEDDING PLANS
-- Mật khẩu đăng nhập cho tất cả các tài khoản là: '123456'
-- Mã băm BCrypt: $2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366
-- ==============================================================================

-- 1. Thêm 40 Users phong cách người Việt Nam thực tế
INSERT INTO users (email, username, password, full_name, phone, role_id, provider, status)
VALUES 
('buinguyenbaochau1234@gmail.com', 'buinguyenbaochau1234', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Bùi Nguyễn Bảo Châu', '0901234123', 3, 'LOCAL', 'ACTIVE'),
('khly26974@gmail.com', 'khly26974', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyễn Khánh Ly', '0902345671', 3, 'LOCAL', 'ACTIVE'),
('anhnguyen.081297@gmail.com', 'anhnguyen.081297', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyễn Vân Anh', '0903456782', 3, 'LOCAL', 'ACTIVE'),
('buia81523@gmail.com', 'buia81523', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Bùi Tuấn Anh', '0904567893', 3, 'LOCAL', 'ACTIVE'),
('sacalycolau1997@gmail.com', 'sacalycolau1997', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Lê Sa Cát Ly', '0905678904', 3, 'LOCAL', 'ACTIVE'),
('karotdongthung@gmail.com', 'karotdongthung', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Trần Thu Hà', '0906789015', 3, 'LOCAL', 'ACTIVE'),
('duongthuhuong554@gmail.com', 'duongthuhuong554', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Dương Thu Hương', '0907890126', 3, 'LOCAL', 'ACTIVE'),
('adaomai1447@gmail.com', 'adaomai1447', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đào Mai Anh', '0908901237', 3, 'LOCAL', 'ACTIVE'),
('thuwthao@gmail.com', 'thuwthao', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Lê Thu Thảo', '0909012348', 3, 'LOCAL', 'ACTIVE'),
('chauthao1003@gmail.com', 'chauthao1003', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Châu Phương Thảo', '0910123459', 3, 'LOCAL', 'ACTIVE'),
('namian2803@gmail.com', 'namian2803', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyễn Nam An', '0911234560', 3, 'LOCAL', 'ACTIVE'),
('dangnguyenbach3171996@gmail.com', 'dangnguyenbach3171996', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đặng Nguyên Bách', '0912345671', 3, 'LOCAL', 'ACTIVE'),
('swat.an1997@gmail.com', 'swat.an1997', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Trần Tuấn An', '0913456782', 3, 'LOCAL', 'ACTIVE'),
('dvananh1901@gmail.com', 'dvananh1901', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đoàn Vân Anh', '0914567893', 3, 'LOCAL', 'ACTIVE'),
('dinhduongthanhhang@gmail.com', 'dinhduongthanhhang', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đinh Dương Thanh Hằng', '0915678904', 3, 'LOCAL', 'ACTIVE'),
('wendytk830@gmail.com', 'wendytk830', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyễn Thùy Khanh (Wendy)', '0916789015', 3, 'LOCAL', 'ACTIVE'),
('dinhtankhoa1997@gmail.com', 'dinhtankhoa1997', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đinh Tấn Khoa', '0917890126', 3, 'LOCAL', 'ACTIVE'),
('thanhngamark@gmail.com', 'thanhngamark', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Phạm Thanh Nga', '0918901237', 3, 'LOCAL', 'ACTIVE'),
('skhanhnguyen123@gmail.com', 'skhanhnguyen123', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyễn Song Khánh', '0919012348', 3, 'LOCAL', 'ACTIVE'),
('daisypink1412@gmail.com', 'daisypink1412', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Vũ Hồng Ngọc (Daisy)', '0920123459', 3, 'LOCAL', 'ACTIVE'),
('huydoan22596@gmail.com', 'huydoan22596', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đoàn Quốc Huy', '0921234560', 3, 'LOCAL', 'ACTIVE'),
('khanhhehe123@gmail.com', 'khanhhehe123', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Võ Nam Khánh', '0922345671', 3, 'LOCAL', 'ACTIVE'),
('workwithbviet@gmail.com', 'workwithbviet', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Bùi Quốc Việt', '0923456782', 2, 'LOCAL', 'ACTIVE'),
('diep.do.vcr@gmail.com', 'diep.do.vcr', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đỗ Ngọc Diệp', '0924567893', 2, 'LOCAL', 'ACTIVE'),
('dokhanhquoc@dtu.edu.vn', 'dokhanhquoc', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đỗ Khánh Quốc', '0925678904', 3, 'LOCAL', 'ACTIVE'),
('dongoctandung240127@gmail.com', 'dongoctandung240127', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đỗ Ngọc Tấn Dũng', '0926789015', 3, 'LOCAL', 'ACTIVE'),
('hong0934900134@gmail.com', 'hong0934900134', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyễn Ánh Hồng', '0934900134', 3, 'LOCAL', 'ACTIVE'),
('donguyen5757@gmail.com', 'donguyen5757', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đỗ Nguyên Khang', '0928901237', 3, 'LOCAL', 'ACTIVE'),
('dotranyennhi289@gmail.com', 'dotranyennhi289', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Đỗ Trần Yến Nhi', '0929012348', 3, 'LOCAL', 'ACTIVE'),
('sonly11061998@gmail.com', 'sonly11061998', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Lý Hồng Sơn', '0930123459', 3, 'LOCAL', 'ACTIVE'),
('haku08021996@gmail.com', 'haku08021996', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Trần Nhật Minh (Haku)', '0931234560', 3, 'LOCAL', 'ACTIVE'),
('hntuuytrieu18@gmail.com', 'hntuuytrieu18', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Huỳnh Thủy Triều', '0932345671', 3, 'LOCAL', 'ACTIVE'),
('thxcquyen@gmail.com', 'thxcquyen', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Thái Thục Quyên', '0933456782', 3, 'LOCAL', 'ACTIVE'),
('hohongnhien.08@gmail.com', 'hohongnhien.08', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Hồ Hồng Nhiên', '0934567893', 3, 'LOCAL', 'ACTIVE'),
('anhthi8396@gmail.com', 'anhthi8396', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Trịnh Anh Thi', '0935678904', 3, 'LOCAL', 'ACTIVE'),
('dungkim30011998@gmail.com', 'dungkim30011998', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Kim Mỹ Dung', '0936789015', 3, 'LOCAL', 'ACTIVE'),
('thyngoc1908@gmail.com', 'thyngoc1908', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Hoàng Ngọc Thy', '0937890126', 3, 'LOCAL', 'ACTIVE'),
('coconutsissogood@gmail.com', 'coconutsissogood', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Lê Thảo My', '0938901237', 3, 'LOCAL', 'ACTIVE'),
('truc.huynh200183@vnuk.edu.vn', 'truc.huynh200183', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Huỳnh Thanh Trúc', '0939012348', 3, 'LOCAL', 'ACTIVE'),
('greenloverr1996@gmail.com', 'greenloverr1996', '$2a$10$1MAtBREAf5AmLvAnJcg5p.ZfqPiG1sB0nWTi5eNn4F7O/xlrid366', 'Nguyễn Mai Chi', '0940123459', 3, 'LOCAL', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 2. Thêm hồ sơ Vendor cho các tài khoản VENDOR
INSERT INTO vendors (user_id, business_name, description, experience_years, city, district, verified)
SELECT u.id, 'Bùi Việt Wedding Cinema & Storytelling', 'Dịch vụ quay phim phóng sự cưới nghệ thuật và flycam cinematic', 5, 'Hanoi', 'Cau Giay', TRUE
FROM users u WHERE u.email = 'workwithbviet@gmail.com'
AND NOT EXISTS (SELECT 1 FROM vendors v WHERE v.user_id = u.id);

INSERT INTO vendors (user_id, business_name, description, experience_years, city, district, verified)
SELECT u.id, 'Diệp Đỗ Bridal Couture & Make Up Art', 'Thiết kế váy cưới dạ hội thủ công cao cấp và chuyên gia trang điểm cô dâu', 4, 'Ho Chi Minh', 'Binh Thanh', TRUE
FROM users u WHERE u.email = 'diep.do.vcr@gmail.com'
AND NOT EXISTS (SELECT 1 FROM vendors v WHERE v.user_id = u.id);

-- 3. Gán Kế hoạch cưới (Wedding Plans) phong phú cho các cặp đôi
INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Lễ Cưới Mùa Thu Minimalist', DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY), 250, 180000000.00, 'Trung tâm tiệc cưới Almaz, Hà Nội', 'PLANNING'
FROM users u WHERE u.email = 'buinguyenbaochau1234@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Đám Cưới Ngoài Trời Rustic Pine', DATE_ADD(CURRENT_DATE, INTERVAL 68 DAY), 180, 250000000.00, 'Resort Ana Mandara, Đà Lạt', 'PLANNING'
FROM users u WHERE u.email = 'anhnguyen.081297@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Tiệc Cưới Sang Trọng Hoàng Gia', DATE_ADD(CURRENT_DATE, INTERVAL 95 DAY), 450, 420000000.00, 'Gem Center, TP. Hồ Chí Minh', 'PLANNING'
FROM users u WHERE u.email = 'sacalycolau1997@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Hôn Lễ Ấm Cúng Bên Bờ Biển', DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 120, 160000000.00, 'Furama Resort, Đà Nẵng', 'PLANNING'
FROM users u WHERE u.email = 'thuwthao@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Kế Hoạch Cưới Vintage Hoài Niệm', DATE_ADD(CURRENT_DATE, INTERVAL 110 DAY), 300, 280000000.00, 'Khách sạn Continental Saigon, TP. HCM', 'PLANNING'
FROM users u WHERE u.email = 'dangnguyenbach3171996@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Lễ Vu Quy & Tiệc Cưới Truyền Thống', DATE_ADD(CURRENT_DATE, INTERVAL 52 DAY), 350, 220000000.00, 'Melia Grand Ballroom, Hà Nội', 'PLANNING'
FROM users u WHERE u.email = 'dinhtankhoa1997@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Lễ Thành Hôn Sunset Garden', DATE_ADD(CURRENT_DATE, INTERVAL 80 DAY), 200, 310000000.00, 'Flamingo Đại Lải Resort, Vĩnh Phúc', 'PLANNING'
FROM users u WHERE u.email = 'huydoan22596@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Tiệc Cưới Bán Nguyệt Hồ Tây', DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY), 220, 200000000.00, 'InterContinental Hanoi Westlake, Hà Nội', 'PLANNING'
FROM users u WHERE u.email = 'sonly11061998@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Dạ Tiệc Cưới Ánh Sao Romantic Glow', DATE_ADD(CURRENT_DATE, INTERVAL 88 DAY), 260, 350000000.00, 'White Palace, TP. Hồ Chí Minh', 'PLANNING'
FROM users u WHERE u.email = 'haku08021996@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);

INSERT INTO wedding_plans (user_id, title, wedding_date, guest_count, budget, location, status)
SELECT u.id, 'Hôn Lễ Thảo Cầm Viên Xanh Tươi', DATE_ADD(CURRENT_DATE, INTERVAL 40 DAY), 190, 240000000.00, 'Thảo Điền Village, TP. Thủ Đức', 'PLANNING'
FROM users u WHERE u.email = 'greenloverr1996@gmail.com'
AND NOT EXISTS (SELECT 1 FROM wedding_plans wp WHERE wp.user_id = u.id);
