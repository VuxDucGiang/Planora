-- V5__create_user_activities_schema.sql
-- ==========================================
-- BẢNG LƯU VẾT HÀNH VI NGƯỜI DÙNG (USER TRACKING)
-- ==========================================

CREATE TABLE user_activities
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT,                             -- NULL nếu là khách vãng lai (Anonymous)
    action      VARCHAR(50)  NOT NULL,              -- LOGIN, GENERATE_PLAN, VIEW_VENDOR, SEND_INQUIRY,...
    entity_type VARCHAR(50),                        -- USER, PLAN, VENDOR, INQUIRY, PAGE
    entity_id   VARCHAR(100),                       -- ID của đối tượng liên quan (VD: vendor_id=5, plan_id=2)
    metadata    JSON,                               -- Lưu thông số: ngân sách nhập vào, concept, thời gian xử lý AI...
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activities_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE SET NULL
);

-- Đánh chỉ mục (Index) tối ưu tốc độ truy vấn dashboard theo thời gian và hành động
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);
CREATE INDEX idx_user_activities_action ON user_activities(action);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);

-- ==========================================
-- SEED DỮ LIỆU MẪU ĐỂ TEST DASHBOARD
-- ==========================================

INSERT INTO user_activities (user_id, action, entity_type, entity_id, metadata, created_at)
VALUES 
(3, 'LOGIN', 'USER', '3', '{"method": "LOCAL"}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'GENERATE_PLAN', 'PLAN', '1', '{"budget": 150000000, "style": "Rustic", "guestCount": 200, "aiLatencyMs": 1820}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'VIEW_VENDOR', 'VENDOR', '1', '{"category": "Wedding Planner", "source": "recommendation"}', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'SEND_INQUIRY', 'INQUIRY', '1', '{"vendorId": 1, "estimatedBudget": 50000000}', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(3, 'VIEW_VENDOR', 'VENDOR', '1', '{"category": "Wedding Planner"}', NOW());
