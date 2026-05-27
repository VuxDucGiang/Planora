-- V1__init_schema.sql
-- =========================
-- ROLES
-- =========================
CREATE TABLE roles
(
    id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- USERS
-- =========================
CREATE TABLE users
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255),
    full_name  VARCHAR(255) NOT NULL,
    phone      VARCHAR(20),
    avatar_url TEXT,
    role_id    BIGINT       NOT NULL,
    provider   ENUM('LOCAL', 'GOOGLE') DEFAULT 'LOCAL',
    status     ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
            REFERENCES roles (id)
);

-- =========================
-- USER ADDRESSES
-- =========================
CREATE TABLE user_addresses
(
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,

    city           VARCHAR(100),
    district       VARCHAR(100),
    ward           VARCHAR(100),
    detail_address TEXT,

    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_address_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
);

-- =========================
-- WEDDING STYLES
-- =========================
CREATE TABLE wedding_styles
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description TEXT
);

-- =========================
-- WEDDING PLANS
-- =========================
CREATE TABLE wedding_plans
(
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id          BIGINT NOT NULL,
    wedding_style_id BIGINT,

    title            VARCHAR(255),
    wedding_date     DATE,
    guest_count      INT,
    budget           DECIMAL(15, 2),
    location         VARCHAR(255),

    status           ENUM(
        'DRAFT',
        'PLANNING',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'DRAFT',

    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_plan_user
        FOREIGN KEY (user_id)
            REFERENCES users (id),

    CONSTRAINT fk_plan_style
        FOREIGN KEY (wedding_style_id)
            REFERENCES wedding_styles (id)
);

-- =========================
-- SERVICE CATEGORIES
-- =========================
CREATE TABLE service_categories
(
    id     BIGINT PRIMARY KEY AUTO_INCREMENT,
    name   VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT TRUE
);

-- =========================
-- VENDORS
-- =========================
CREATE TABLE vendors
(
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id          BIGINT       NOT NULL,

    business_name    VARCHAR(255) NOT NULL,
    description      TEXT,

    experience_years INT       DEFAULT 0,

    city             VARCHAR(100),
    district         VARCHAR(100),

    verified         BOOLEAN   DEFAULT FALSE,

    rating_average DOUBLE DEFAULT 0,
    total_reviews    INT       DEFAULT 0,

    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_vendor_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
);

-- =========================
-- VENDOR SERVICES
-- =========================
CREATE TABLE vendor_services
(
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    vendor_id    BIGINT       NOT NULL,
    category_id  BIGINT       NOT NULL,

    service_name VARCHAR(255) NOT NULL,
    description  TEXT,

    price_from   DECIMAL(15, 2),
    price_to     DECIMAL(15, 2),

    active       BOOLEAN   DEFAULT TRUE,

    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_vendor
        FOREIGN KEY (vendor_id)
            REFERENCES vendors (id),

    CONSTRAINT fk_service_category
        FOREIGN KEY (category_id)
            REFERENCES service_categories (id)
);

-- =========================
-- VENDOR PORTFOLIOS
-- =========================
CREATE TABLE vendor_portfolios
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    vendor_id   BIGINT NOT NULL,

    image_url   TEXT   NOT NULL,
    title       VARCHAR(255),
    description TEXT,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_portfolio_vendor
        FOREIGN KEY (vendor_id)
            REFERENCES vendors (id)
);

-- =========================
-- VENDOR PACKAGES
-- =========================
CREATE TABLE vendor_packages
(
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    vendor_service_id BIGINT         NOT NULL,

    package_name      VARCHAR(255)   NOT NULL,
    description       TEXT,

    price             DECIMAL(15, 2) NOT NULL,

    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_package_service
        FOREIGN KEY (vendor_service_id)
            REFERENCES vendor_services (id)
);

-- =========================
-- VENDOR MATCHES
-- =========================
CREATE TABLE vendor_matches
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,

    wedding_plan_id BIGINT NOT NULL,
    vendor_id       BIGINT NOT NULL,

    matching_score DOUBLE,
    reason          TEXT,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_match_plan
        FOREIGN KEY (wedding_plan_id)
            REFERENCES wedding_plans (id),

    CONSTRAINT fk_match_vendor
        FOREIGN KEY (vendor_id)
            REFERENCES vendors (id)
);

-- =========================
-- CONCEPT SUGGESTIONS
-- =========================
CREATE TABLE concept_suggestions
(
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,

    wedding_plan_id  BIGINT NOT NULL,

    concept_name     VARCHAR(255),
    description      TEXT,

    estimated_budget DECIMAL(15, 2),

    generated_by     ENUM('AI', 'RULE_BASED') DEFAULT 'RULE_BASED',

    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_concept_plan
        FOREIGN KEY (wedding_plan_id)
            REFERENCES wedding_plans (id)
);

-- =========================
-- VENDOR SHORTLISTS
-- =========================
CREATE TABLE vendor_shortlists
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,

    wedding_plan_id BIGINT NOT NULL,
    vendor_id       BIGINT NOT NULL,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shortlist_plan
        FOREIGN KEY (wedding_plan_id)
            REFERENCES wedding_plans (id),

    CONSTRAINT fk_shortlist_vendor
        FOREIGN KEY (vendor_id)
            REFERENCES vendors (id)
);

-- =========================
-- INQUIRIES
-- =========================
CREATE TABLE inquiries
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,

    wedding_plan_id BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,
    vendor_id       BIGINT NOT NULL,

    title           VARCHAR(255),
    message         TEXT,

    status          ENUM(
        'PENDING',
        'RESPONDED',
        'CLOSED'
    ) DEFAULT 'PENDING',

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_inquiry_plan
        FOREIGN KEY (wedding_plan_id)
            REFERENCES wedding_plans (id),

    CONSTRAINT fk_inquiry_customer
        FOREIGN KEY (customer_id)
            REFERENCES users (id),

    CONSTRAINT fk_inquiry_vendor
        FOREIGN KEY (vendor_id)
            REFERENCES vendors (id)
);

-- =========================
-- INQUIRY MESSAGES
-- =========================
CREATE TABLE inquiry_messages
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,

    inquiry_id BIGINT NOT NULL,
    sender_id  BIGINT NOT NULL,

    message    TEXT   NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_inquiry
        FOREIGN KEY (inquiry_id)
            REFERENCES inquiries (id),

    CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id)
            REFERENCES users (id)
);

-- =========================
-- BUDGET CATEGORIES
-- =========================
CREATE TABLE budget_categories
(
    id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- BUDGET ITEMS
-- =========================
CREATE TABLE budget_items
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,

    wedding_plan_id BIGINT NOT NULL,
    category_id     BIGINT NOT NULL,

    estimated_cost  DECIMAL(15, 2),
    actual_cost     DECIMAL(15, 2),

    note            TEXT,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_plan
        FOREIGN KEY (wedding_plan_id)
            REFERENCES wedding_plans (id),

    CONSTRAINT fk_budget_category
        FOREIGN KEY (category_id)
            REFERENCES budget_categories (id)
);

-- =========================
-- CHECKLIST TASKS
-- =========================
CREATE TABLE checklist_tasks
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,

    wedding_plan_id BIGINT       NOT NULL,

    title           VARCHAR(255) NOT NULL,
    description     TEXT,

    due_date        DATE,

    status          ENUM(
        'TODO',
        'IN_PROGRESS',
        'DONE'
    ) DEFAULT 'TODO',

    priority        ENUM(
        'LOW',
        'MEDIUM',
        'HIGH'
    ) DEFAULT 'MEDIUM',

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_plan
        FOREIGN KEY (wedding_plan_id)
            REFERENCES wedding_plans (id)
);

-- =========================
-- TIMELINE EVENTS
-- =========================
CREATE TABLE timeline_events
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,

    wedding_plan_id BIGINT       NOT NULL,

    title           VARCHAR(255) NOT NULL,
    description     TEXT,

    event_date      DATETIME,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_timeline_plan
        FOREIGN KEY (wedding_plan_id)
            REFERENCES wedding_plans (id)
);

-- =========================
-- REVIEWS
-- =========================
CREATE TABLE reviews
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,

    vendor_id   BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,

    rating      INT    NOT NULL,
    comment     TEXT,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_vendor
        FOREIGN KEY (vendor_id)
            REFERENCES vendors (id),

    CONSTRAINT fk_review_customer
        FOREIGN KEY (customer_id)
            REFERENCES users (id)
);

-- =========================
-- REPORTS
-- =========================
CREATE TABLE reports
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,

    reporter_id BIGINT NOT NULL,
    vendor_id   BIGINT NOT NULL,

    reason      TEXT,

    status      ENUM(
        'PENDING',
        'REVIEWING',
        'RESOLVED',
        'REJECTED'
    ) DEFAULT 'PENDING',

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_user
        FOREIGN KEY (reporter_id)
            REFERENCES users (id),

    CONSTRAINT fk_report_vendor
        FOREIGN KEY (vendor_id)
            REFERENCES vendors (id)
);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE notifications
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id    BIGINT NOT NULL,

    title      VARCHAR(255),
    content    TEXT,

    type       ENUM(
        'SYSTEM',
        'INQUIRY',
        'PAYMENT',
        'MATCHING'
    ) DEFAULT 'SYSTEM',

    is_read    BOOLEAN   DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
);

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE payments
(
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,

    inquiry_id       BIGINT         NOT NULL,

    amount           DECIMAL(15, 2) NOT NULL,

    payment_method   VARCHAR(100),

    transaction_code VARCHAR(255),

    status           ENUM(
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'PENDING',

    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_inquiry
        FOREIGN KEY (inquiry_id)
            REFERENCES inquiries (id)
);

-- =========================
-- SEED DATA
-- =========================
INSERT INTO roles(name)
VALUES ('CUSTOMER'),
       ('VENDOR'),
       ('ADMIN');

INSERT INTO service_categories(name)
VALUES ('Studio'),
       ('Makeup'),
       ('Wedding Planner'),
       ('Decor'),
       ('Dress Rental'),
       ('Photographer'),
       ('Venue');

INSERT INTO budget_categories(name)
VALUES ('Venue'),
       ('Decoration'),
       ('Photography'),
       ('Makeup'),
       ('Wedding Dress'),
       ('Food & Beverage'),
       ('Entertainment');

INSERT INTO wedding_styles(name, description)
VALUES ('Traditional', 'Traditional Vietnamese wedding style'),
       ('Minimalist', 'Simple and elegant wedding'),
       ('Luxury', 'High-end luxury wedding'),
       ('Garden Wedding', 'Outdoor garden style wedding'),
       ('Beach Wedding', 'Beachside destination wedding');