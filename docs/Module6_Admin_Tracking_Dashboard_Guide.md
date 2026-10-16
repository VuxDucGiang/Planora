# Hướng dẫn Xây dựng Module 6: Admin Dashboard & User Tracking Tool

Tài liệu này được thiết kế theo dạng **Step-by-Step Promptable Specification** (Đặc tả từng bước có thể nạp trực tiếp vào AI để lập trình). Toàn bộ kiến trúc, tên biến, bảng dữ liệu, DTO và REST API đều được đồng bộ 100% với cấu trúc hiện tại của dự án **Planora** (`com.fudn.planora` ở Backend và Next.js 16 App Router ở Frontend).

---

## 📑 Mục Lục Các Bước Thực Hiện

1. [Bước 1: Thiết kế Cơ sở Dữ liệu & Flyway Migration (V5)](#bước-1-thiết-kế-cơ-sở-dữ-liệu--flyway-migration-v5)
2. [Bước 2: Backend Entities, Enums & Async Event Logging](#bước-2-backend-entities-enums--async-event-logging)
3. [Bước 3: DTOs, Repository, Service & Controller cho Admin](#bước-3-dtos-repository-service--controller-cho-admin)
4. [Bước 4: Cấu hình Phân quyền Spring Security (ROLE_ADMIN)](#bước-4-cấu-hình-phân-quyền-spring-security-role_admin)
5. [Bước 5: Frontend Types, Admin API Service & Tracking Hook](#bước-5-frontend-types-admin-api-service--tracking-hook)
6. [Bước 6: Giao diện Admin Dashboard (Layout, KPI, Funnel, User Journey)](#bước-6-giao-diện-admin-dashboard-layout-kpi-funnel-user-journey)
7. [Bảng kiểm thử nghiệm thu (Checklist Verification)](#bảng-kiểm-thử-nghiệm-thu-checklist-verification)

---

## BƯỚC 1: Thiết kế Cơ sở Dữ liệu & Flyway Migration (V5)

### 1.1. Mục tiêu
Tạo bảng `user_activities` để lưu vết mọi hành vi tương tác của người dùng trên hệ thống Planora (đăng nhập, tạo kế hoạch AI, xem vendor, gửi báo giá, lưu shortlist...) và chèn dữ liệu mẫu ban đầu để kiểm thử.

### 1.2. File cần tạo
* **Đường dẫn**: `planora-backend/src/main/resources/db/migration/V5__create_user_activities_schema.sql`

### 1.3. Nội dung mã nguồn

```sql
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
```

### 1.4. Prompt nạp cho AI (Bước 1)
```text
Hãy tạo file migration V5__create_user_activities_schema.sql trong thư mục 
planora-backend/src/main/resources/db/migration/ 
với cấu trúc bảng user_activities lưu vết hành vi người dùng (id, user_id, action, entity_type, entity_id, metadata JSON, ip_address, user_agent, created_at) và các index tương ứng cùng dữ liệu mẫu seed như đặc tả trong tài liệu Module 6 Bước 1.
```

---

## BƯỚC 2: Backend Entities, Enums & Async Event Logging

### 2.1. Mục tiêu
* Tạo JPA Entity `UserActivity` và các Enums tương ứng.
* Xây dựng hệ thống ghi log bất đồng bộ bằng Spring Event (`@Async` & `ApplicationEventPublisher`) để khi người dùng thao tác ở controller, request chính không bị chậm trễ.

### 2.2. Files cần tạo
1. `planora-backend/src/main/java/com/fudn/planora/enums/EUserAction.java`
2. `planora-backend/src/main/java/com/fudn/planora/enums/EEntityType.java`
3. `planora-backend/src/main/java/com/fudn/planora/entity/UserActivity.java`
4. `planora-backend/src/main/java/com/fudn/planora/event/UserActivityEvent.java`
5. `planora-backend/src/main/java/com/fudn/planora/event/UserActivityListener.java`
6. `planora-backend/src/main/java/com/fudn/planora/service/ActivityTrackingService.java`

### 2.3. Mã nguồn chi tiết

#### 2.3.1. `EUserAction.java`
```java
package com.fudn.planora.enums;

public enum EUserAction {
    LOGIN,
    REGISTER,
    ONBOARDING_COMPLETED,
    GENERATE_PLAN,
    SAVE_PLAN,
    VIEW_VENDOR,
    ADD_TO_SHORTLIST,
    SEND_INQUIRY,
    UPDATE_BUDGET,
    COMPLETE_CHECKLIST_ITEM
}
```

#### 2.3.2. `EEntityType.java`
```java
package com.fudn.planora.enums;

public enum EEntityType {
    USER,
    PLAN,
    VENDOR,
    INQUIRY,
    BUDGET_ITEM,
    CHECKLIST_ITEM,
    PAGE
}
```

#### 2.3.3. `UserActivity.java`
```java
package com.fudn.planora.entity;

import com.fudn.planora.enums.EEntityType;
import com.fudn.planora.enums.EUserAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "user_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EUserAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", length = 50)
    private EEntityType entityType;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "json")
    private Map<String, Object> metadata;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
```

#### 2.3.4. `UserActivityEvent.java`
```java
package com.fudn.planora.event;

import com.fudn.planora.enums.EEntityType;
import com.fudn.planora.enums.EUserAction;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class UserActivityEvent {
    private Long userId;
    private EUserAction action;
    private EEntityType entityType;
    private String entityId;
    private Map<String, Object> metadata;
    private String ipAddress;
    private String userAgent;
}
```

#### 2.3.5. `ActivityTrackingService.java`
```java
package com.fudn.planora.service;

import com.fudn.planora.enums.EEntityType;
import com.fudn.planora.enums.EUserAction;
import com.fudn.planora.event.UserActivityEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ActivityTrackingService {

    private final ApplicationEventPublisher eventPublisher;

    public void track(Long userId, EUserAction action, EEntityType entityType, String entityId, Map<String, Object> metadata) {
        UserActivityEvent event = UserActivityEvent.builder()
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .metadata(metadata)
                .build();
        eventPublisher.publishEvent(event);
    }
}
```

#### 2.3.6. `UserActivityListener.java`
```java
package com.fudn.planora.event;

import com.fudn.planora.entity.User;
import com.fudn.planora.entity.UserActivity;
import com.fudn.planora.repository.UserActivityRepository;
import com.fudn.planora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserActivityListener {

    private final UserActivityRepository activityRepository;
    private final UserRepository userRepository;

    @Async
    @EventListener
    public void handleUserActivity(UserActivityEvent event) {
        try {
            User user = null;
            if (event.getUserId() != null) {
                user = userRepository.findById(event.getUserId()).orElse(null);
            }

            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .action(event.getAction())
                    .entityType(event.getEntityType())
                    .entityId(event.getEntityId())
                    .metadata(event.getMetadata())
                    .ipAddress(event.getIpAddress())
                    .userAgent(event.getUserAgent())
                    .build();

            activityRepository.save(activity);
        } catch (Exception e) {
            log.error("Lỗi khi ghi nhận tracking activity: {}", e.getMessage());
        }
    }
}
```

### 2.4. Prompt nạp cho AI (Bước 2)
```text
Thực hiện Bước 2 theo tài liệu Module 6:
1. Tạo enums EUserAction và EEntityType trong com.fudn.planora.enums.
2. Tạo JPA Entity UserActivity.java trong com.fudn.planora.entity hỗ trợ cột json metadata.
3. Tạo UserActivityRepository kế thừa JpaRepository.
4. Tạo hệ thống event publisher bất đồng bộ: UserActivityEvent, ActivityTrackingService và UserActivityListener với @Async.
Hãy đảm bảo project có @EnableAsync trong file config chính.
```

---

## BƯỚC 3: DTOs, Repository, Service & Controller cho Admin

### 3.1. Mục tiêu
Cung cấp các API tổng hợp số liệu cho Admin Dashboard:
* `GET /api/v1/admin/dashboard/summary`: Thống kê tổng số Users, Plans, Inquiries, DAU.
* `GET /api/v1/admin/dashboard/funnel`: Số liệu phễu chuyển đổi (Onboarding -> Plan -> Vendor -> Inquiry).
* `GET /api/v1/admin/dashboard/activities`: Danh sách logs hoạt động có phân trang và lọc.
* `GET /api/v1/admin/dashboard/users/{id}/journey`: Lịch sử hành trình chi tiết của 1 cặp đôi cụ thể.
* `GET /api/v1/admin/dashboard/ai-analytics`: Thống kê các phong cách cưới & ngân sách người dùng hay nhập nhất.

### 3.2. Files cần tạo
1. `planora-backend/src/main/java/com/fudn/planora/dto/response/admin/AdminSummaryResponse.java`
2. `planora-backend/src/main/java/com/fudn/planora/dto/response/admin/AdminFunnelResponse.java`
3. `planora-backend/src/main/java/com/fudn/planora/dto/response/admin/UserActivityResponse.java`
4. `planora-backend/src/main/java/com/fudn/planora/dto/response/admin/UserJourneyResponse.java`
5. `planora-backend/src/main/java/com/fudn/planora/dto/response/admin/AIInsightResponse.java`
6. `planora-backend/src/main/java/com/fudn/planora/repository/UserActivityRepository.java`
7. `planora-backend/src/main/java/com/fudn/planora/service/AdminDashboardService.java`
8. `planora-backend/src/main/java/com/fudn/planora/service/impl/AdminDashboardServiceImpl.java`
9. `planora-backend/src/main/java/com/fudn/planora/controller/AdminDashboardController.java`

### 3.3. Chi tiết DTO Response

#### `AdminSummaryResponse.java`
```java
package com.fudn.planora.dto.response.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminSummaryResponse {
    private long totalUsers;
    private long totalCouples;
    private long totalVendors;
    private long dailyActiveUsers;     // DAU
    private long totalPlansGenerated;
    private long totalInquiriesSent;
    private double planConversionRate; // % user tạo plan sau đăng ký
}
```

#### `AdminFunnelResponse.java`
```java
package com.fudn.planora.dto.response.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminFunnelResponse {
    private long registeredUsers;
    private long onboardingCompleted;
    private long planGenerated;
    private long vendorViewed;
    private long inquirySent;
}
```

#### `UserActivityResponse.java`
```java
package com.fudn.planora.dto.response.admin;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
public class UserActivityResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String action;
    private String entityType;
    private String entityId;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}
```

### 3.4. Service Implementation & Repository

#### `UserActivityRepository.java`
```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.UserActivity;
import com.fudn.planora.enums.EUserAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM UserActivity a WHERE a.createdAt >= :since AND a.user IS NOT NULL")
    long countDistinctActiveUsersSince(@Param("since") LocalDateTime since);

    long countByAction(EUserAction action);

    Page<UserActivity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT a FROM UserActivity a ORDER BY a.createdAt DESC")
    Page<UserActivity> findAllActivities(Pageable pageable);

    List<UserActivity> findByUserIdOrderByCreatedAtAsc(Long userId);
}
```

#### `AdminDashboardController.java`
```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.response.admin.*;
import com.fudn.planora.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<AdminSummaryResponse> getSummary() {
        return ResponseEntity.ok(adminDashboardService.getSummaryMetrics());
    }

    @GetMapping("/funnel")
    public ResponseEntity<AdminFunnelResponse> getFunnel() {
        return ResponseEntity.ok(adminDashboardService.getFunnelMetrics());
    }

    @GetMapping("/activities")
    public ResponseEntity<Page<UserActivityResponse>> getActivities(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminDashboardService.getRecentActivities(pageable));
    }

    @GetMapping("/users/{userId}/journey")
    public ResponseEntity<UserJourneyResponse> getUserJourney(@PathVariable Long userId) {
        return ResponseEntity.ok(adminDashboardService.getUserJourney(userId));
    }
}
```

### 3.5. Prompt nạp cho AI (Bước 3)
```text
Thực hiện Bước 3 theo tài liệu Module 6:
1. Tạo các DTO Response trong com.fudn.planora.dto.response.admin: AdminSummaryResponse, AdminFunnelResponse, UserActivityResponse, UserJourneyResponse.
2. Hoàn thiện UserActivityRepository với các custom query đếm DAU và tìm kiếm theo userId.
3. Tạo interface AdminDashboardService và class AdminDashboardServiceImpl thực hiện tính toán các chỉ số:
   - Tổng Users, Vendors, Couples (dựa vào UserRepository và Role).
   - DAU (người dùng có phát sinh activity trong 24h qua).
   - Phễu chuyển đổi dựa trên countByAction().
   - Trả về danh sách Activity phân trang và chi tiết lịch sử User Journey.
4. Tạo AdminDashboardController tại /api/v1/admin/dashboard với quyền @PreAuthorize("hasRole('ADMIN')").
```

---

## BƯỚC 4: Cấu hình Phân quyền Spring Security (ROLE_ADMIN)

### 4.1. Mục tiêu
Bảo vệ toàn bộ các endpoint bắt đầu bằng `/api/v1/admin/**`, chỉ cho phép user sở hữu token có quyền `ROLE_ADMIN` (như tài khoản `admin@planora.com` được seed trong `V2`) được phép truy xuất.

### 4.2. File cần sửa
* **Đường dẫn**: `planora-backend/src/main/java/com/fudn/planora/config/SecurityConfig.java`

### 4.3. Chỉ dẫn sửa đổi
Tìm đến cấu hình `SecurityFilterChain` và thêm rule phân quyền cho `/api/v1/admin/**`:

```java
// Trong SecurityConfig.java
.authorizeHttpRequests(auth -> auth
    // Cho phép public các API auth, swagger,...
    .requestMatchers("/api/v1/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
    // Khóa chặt các API admin
    .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
    // Các API khác yêu cầu authenticated
    .anyRequest().authenticated()
)
```

### 4.4. Prompt nạp cho AI (Bước 4)
```text
Cập nhật file SecurityConfig.java theo tài liệu Module 6 Bước 4:
Thêm cấu hình phân quyền cho cụm API /api/v1/admin/** bắt buộc có role ADMIN (hasRole("ADMIN")). Đảm bảo không làm ảnh hưởng đến các cấu hình JWT Filter và CorsConfiguration hiện có.
```

---

## BƯỚC 5: Frontend Types, Admin API Service & Tracking Hook

### 5.1. Mục tiêu
* Khai báo kiểu dữ liệu TypeScript cho toàn bộ response của Admin Dashboard.
* Xây dựng `src/services/admin.ts` để gọi API với Header Authorization Bearer token từ `planora_token`.
* Xây dựng custom hook `useTracker` để tự động hoặc chủ động gửi event về backend khi người dùng thực hiện các thao tác quan trọng trên Next.js client.

### 5.2. Files cần tạo
1. `planora-frontend/src/types/admin.ts`
2. `planora-frontend/src/services/admin.ts`
3. `planora-frontend/src/hooks/useTracker.ts`

### 5.3. Mã nguồn chi tiết

#### `src/types/admin.ts`
```typescript
export interface AdminSummaryResponse {
  totalUsers: number;
  totalCouples: number;
  totalVendors: number;
  dailyActiveUsers: number;
  totalPlansGenerated: number;
  totalInquiriesSent: number;
  planConversionRate: number;
}

export interface AdminFunnelResponse {
  registeredUsers: number;
  onboardingCompleted: number;
  planGenerated: number;
  vendorViewed: number;
  inquirySent: number;
}

export interface UserActivityItem {
  id: number;
  userId: number | null;
  userEmail: string;
  userFullName: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface PaginatedActivities {
  content: UserActivityItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserJourneyResponse {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  activities: UserActivityItem[];
}
```

#### `src/services/admin.ts`
```typescript
import type { 
  AdminSummaryResponse, 
  AdminFunnelResponse, 
  PaginatedActivities, 
  UserJourneyResponse 
} from '@/types/admin';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('planora_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function getAdminSummary(): Promise<AdminSummaryResponse> {
  const res = await fetch(`${API_BASE}/api/v1/admin/dashboard/summary`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Không thể tải số liệu tổng quan');
  return res.json();
}

export async function getAdminFunnel(): Promise<AdminFunnelResponse> {
  const res = await fetch(`${API_BASE}/api/v1/admin/dashboard/funnel`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Không thể tải dữ liệu phễu chuyển đổi');
  return res.json();
}

export async function getAdminActivities(page = 0, size = 20): Promise<PaginatedActivities> {
  const res = await fetch(`${API_BASE}/api/v1/admin/dashboard/activities?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Không thể tải nhật ký hoạt động');
  return res.json();
}

export async function getUserJourney(userId: number): Promise<UserJourneyResponse> {
  const res = await fetch(`${API_BASE}/api/v1/admin/dashboard/users/${userId}/journey`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Không thể tải lịch sử hành trình người dùng');
  return res.json();
}
```

### 5.4. Prompt nạp cho AI (Bước 5)
```text
Thực hiện Bước 5 theo tài liệu Module 6:
1. Tạo file types/admin.ts chứa các interface: AdminSummaryResponse, AdminFunnelResponse, UserActivityItem, PaginatedActivities, UserJourneyResponse.
2. Tạo file services/admin.ts với các hàm getAdminSummary, getAdminFunnel, getAdminActivities, getUserJourney chuẩn xác với token Authorization từ localStorage ('planora_token').
```

---

## BƯỚC 6: Giao diện Admin Dashboard (Layout, KPI, Funnel, User Journey)

### 6.1. Mục tiêu
* Tạo Route Group cho trang quản trị: `src/app/admin/...` với thiết kế giao diện hiện đại, chuyên nghiệp, tone màu Rose/Slate đồng bộ Design System Planora.
* Kiểm tra xác thực (Admin Guard): Nếu chưa đăng nhập hoặc role không phải `ADMIN`, tự động chuyển hướng về trang `/login`.
* Hiển thị:
  1. Thẻ KPI Stats (Users, DAU, Plans, Inquiries, Conversion Rate).
  2. Biểu đồ phễu trực quan (Visual Funnel Bar).
  3. Bảng Activity Stream thời gian thực (Live Action Badges: `LOGIN`, `GENERATE_PLAN`, `VIEW_VENDOR`...).
  4. Trang chi tiết User Journey (`/admin/users/[id]`).

### 6.2. Files cần tạo
1. `planora-frontend/src/app/admin/layout.tsx` (Sidebar + Admin Guard)
2. `planora-frontend/src/app/admin/page.tsx` (Dashboard Overview)
3. `planora-frontend/src/components/admin/StatCard.tsx`
4. `planora-frontend/src/components/admin/FunnelChart.tsx`
5. `planora-frontend/src/components/admin/ActivityTable.tsx`
6. `planora-frontend/src/app/admin/users/[id]/page.tsx` (User Journey Timeline)

### 6.3. Mã nguồn chi tiết các Component chính

#### 6.3.1. `src/app/admin/layout.tsx`
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Sparkles, 
  Store, 
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Kiểm tra token và quyền admin từ localStorage hoặc context
    const token = localStorage.getItem('planora_token');
    const userStr = localStorage.getItem('planora_user');

    if (!token || !userStr) {
      router.push('/login?redirect=/admin');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role === 'ADMIN' || user.role?.roleName === 'ADMIN') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    }
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Quyền truy cập bị từ chối</h1>
        <p className="mt-2 text-gray-600">Bạn cần tài khoản có vai trò Quản trị viên (ADMIN) để vào trang này.</p>
        <Link href="/" className="mt-6 rounded-lg bg-rose-500 px-5 py-2.5 text-white font-medium hover:bg-rose-600 transition">
          Quay lại Trang chủ
        </Link>
      </div>
    );
  }

  const navItems = [
    { name: 'Tổng quan (KPI)', href: '/admin', icon: LayoutDashboard },
    { name: 'Người dùng & Hành trình', href: '/admin/users', icon: Users },
    { name: 'Nhật ký Tracking', href: '/admin/activities', icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white font-bold shadow-md shadow-rose-200">
              P
            </span>
            <div>
              <h2 className="font-bold text-slate-800 tracking-tight">Planora Admin</h2>
              <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">Tracking Suite</span>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive 
                      ? 'bg-rose-50 text-rose-600 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay về Giao diện Người dùng
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
```

#### 6.3.2. `src/app/admin/page.tsx`
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Send, 
  TrendingUp, 
  UserCheck, 
  RefreshCw 
} from 'lucide-react';
import { getAdminSummary, getAdminFunnel, getAdminActivities } from '@/services/admin';
import type { AdminSummaryResponse, AdminFunnelResponse, UserActivityItem } from '@/types/admin';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummaryResponse | null>(null);
  const [funnel, setFunnel] = useState<AdminFunnelResponse | null>(null);
  const [activities, setActivities] = useState<UserActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, funRes, actRes] = await Promise.all([
        getAdminSummary(),
        getAdminFunnel(),
        getAdminActivities(0, 10),
      ]);
      setSummary(sumRes);
      setFunnel(funRes);
      setActivities(actRes.content);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard & Tracking Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi hành vi người dùng, phễu chuyển đổi và mức độ tương tác với AI trong thời gian thực.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* 4 Thẻ KPI Nổi Bật */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Users */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tổng Người Dùng</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{summary?.totalUsers || 0}</span>
            <span className="text-xs text-slate-500">({summary?.totalCouples || 0} Cặp đôi, {summary?.totalVendors || 0} Vendor)</span>
          </div>
        </div>

        {/* Card 2: DAU */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Hoạt động 24h (DAU)</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{summary?.dailyActiveUsers || 0}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Active Today</span>
          </div>
        </div>

        {/* Card 3: AI Plans */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Kế hoạch Cưới AI</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{summary?.totalPlansGenerated || 0}</span>
            <span className="text-xs text-slate-500">plans</span>
          </div>
        </div>

        {/* Card 4: Inquiries */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Yêu cầu Tư vấn (Leads)</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{summary?.totalInquiriesSent || 0}</span>
            <span className="text-xs text-rose-600 font-medium">Marketplace Leads</span>
          </div>
        </div>
      </div>

      {/* Phễu Chuyển Đổi (Conversion Funnel) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Phễu Hành Vi & Chuyển Đổi (User Funnel)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tỉ lệ người dùng đi qua từng chặng từ lúc Đăng ký đến khi Kết nối Nhà cung cấp</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3.5 w-3.5" />
            Conv. Rate: {summary?.planConversionRate || 0}%
          </span>
        </div>

        <div className="mt-6 space-y-5">
          {[
            { label: '1. Đăng ký tài khoản (Couples)', count: funnel?.registeredUsers || 0, max: funnel?.registeredUsers || 1 },
            { label: '2. Hoàn thành Onboarding', count: funnel?.onboardingCompleted || 0, max: funnel?.registeredUsers || 1 },
            { label: '3. Tạo Kế hoạch Cưới AI', count: funnel?.planGenerated || 0, max: funnel?.registeredUsers || 1 },
            { label: '4. Xem Hồ sơ Nhà cung cấp', count: funnel?.vendorViewed || 0, max: funnel?.registeredUsers || 1 },
            { label: '5. Gửi Yêu cầu Báo giá (Inquiry Lead)', count: funnel?.inquirySent || 0, max: funnel?.registeredUsers || 1 },
          ].map((step, idx) => {
            const percentage = Math.min(100, Math.round((step.count / (step.max || 1)) * 100));
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="font-semibold text-stone-800">{step.label}</span>
                  <span className="font-mono text-stone-600">{step.count} ({percentage}%)</span>
                </div>
                {/* Thanh tiến trình đồng bộ màu Đỏ chủ đạo Planora (#5D0F12) */}
                <div className="h-3.5 w-full rounded-full bg-[#FAF8F5] border border-[#EADCC9]/60 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-[#5D0F12] transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bảng Nhật Ký Tracking Gần Nhất (Live Action Stream) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Nhật Ký Tương Tác Gần Nhất (Live Activities)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Hành động (Action)</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Chi tiết Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Chưa có nhật ký hoạt động nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {act.userFullName || act.userEmail || `Khách (#${act.userId || 'Guest'})`}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                        {act.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {act.entityType} ({act.entityId || 'N/A'})
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono max-w-xs truncate">
                      {act.metadata ? JSON.stringify(act.metadata) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### 6.4. Prompt nạp cho AI (Bước 6)
```text
Thực hiện Bước 6 theo tài liệu Module 6:
1. Tạo layout src/app/admin/layout.tsx hỗ trợ Admin Guard kiểm tra quyền ADMIN từ localStorage (planora_user).
2. Tạo trang chủ Dashboard src/app/admin/page.tsx hiển thị 4 KPI cards (Total Users, DAU, Plans, Inquiries), thanh phễu chuyển đổi User Funnel và bảng nhật ký Live Activities.
3. Đảm bảo sử dụng Tailwind CSS và Lucide Icons đồng bộ với giao diện chung của Planora.
```

---

---

## BƯỚC 7: Mở rộng Báo Cáo Insight Thị Trường Cưới & Giám Sát AI

### 7.1. Mục tiêu
Tổng hợp dữ liệu ngân sách, quy mô khách mời và concept cưới thịnh hành từ AI và cơ sở dữ liệu để phục vụ bài thuyết trình kinh doanh (EXE101) và giám sát kỹ thuật mô hình AI.

### 7.2. Files đã tạo / cập nhật
1. Backend DTO: `planora-backend/src/main/java/com/fudn/planora/dto/response/admin/AIInsightResponse.java`
2. Backend Service: `AdminDashboardService.java` & `AdminDashboardServiceImpl.java` (method `getAIInsights()`)
3. Backend Controller: `AdminDashboardController.java` (`GET /api/v1/admin/dashboard/ai-insights`)
4. Frontend Types: `planora-frontend/src/types/admin.ts` (`AIInsightResponse`, `BudgetBucket`, `StylePopularity`, `AIPerformance`)
5. Frontend Service: `planora-frontend/src/services/admin.ts` (`getAIInsights()`)
6. Frontend Route: `planora-frontend/src/app/admin/ai-insights/page.tsx`
7. Frontend Navigation: Thêm liên kết **"Insight Thị Trường & AI"** vào Sidebar trong `src/app/admin/layout.tsx`.

---

---

## BƯỚC 8: Mở rộng Tracking Tài Khoản Ngủ Đông & Nguy Cơ Rời Bỏ (Churn Prevention)

### 8.1. Mục tiêu
Tự động quét và phân loại toàn bộ tệp cặp đôi thành các nhóm vòng đời: Hoạt động tốt (< 7 ngày), Nguy cơ rời bỏ (7 - 29 ngày), và Ngủ đông (>= 30 ngày). Đặc biệt gắn cờ khẩn cấp cho các cặp đôi sắp đến ngày cưới mà đang ngưng tương tác kèm công cụ tạo mẫu email tái kích hoạt (Re-engagement email).

### 8.2. Files đã tạo / cập nhật
1. Backend DTO: `planora-backend/src/main/java/com/fudn/planora/dto/response/admin/DormantAnalysisResponse.java`
2. Backend Service: `AdminDashboardService.java` & `AdminDashboardServiceImpl.java` (method `getDormantAnalysis()`)
3. Backend Controller: `AdminDashboardController.java` (`GET /api/v1/admin/dashboard/dormant-users`)
4. Frontend Types: `planora-frontend/src/types/admin.ts` (`DormantAnalysisResponse`, `DormantUserItem`)
5. Frontend Service: `planora-frontend/src/services/admin.ts` (`getDormantAnalysis()`)
6. Frontend Route: `planora-frontend/src/app/admin/dormant/page.tsx`
7. Frontend Navigation: Thêm liên kết **"Tài khoản Ngủ đông"** vào Sidebar trong `src/app/admin/layout.tsx`.

---

## Bảng Kiểm Thử Nghiệm Thu (Checklist Verification)

Sau khi hoàn thành từng bước, bạn có thể kiểm tra chéo theo bảng tiêu chí sau:

| Bước | Hạng mục kiểm tra | Kết quả kỳ vọng |
| :--- | :--- | :--- |
| **Bước 1** | Khởi động Backend Spring Boot | Flyway tự động chạy migration `V5` và tạo bảng `user_activities` thành công trong MySQL. |
| **Bước 2** | Bắn thử Event từ một controller bất kỳ | Bảng `user_activities` xuất hiện thêm bản ghi mới mà không làm tăng thời gian phản hồi API (nhờ `@Async`). |
| **Bước 3** | Gọi API `GET /api/v1/admin/dashboard/summary` | Trả về mã HTTP `200 OK` cùng các chỉ số JSON (Users, DAU, Plans, Inquiries). |
| **Bước 4** | Dùng token tài khoản thường (`user@planora.com`) gọi API admin | Trả về mã HTTP `403 Forbidden`. Khi dùng `admin@planora.com` thì trả về `200 OK`. |
| **Bước 5** | Gọi API thông qua `admin.ts` trên Frontend | Dữ liệu trả về đúng kiểu dữ liệu khai báo trong `types/admin.ts`. |
| **Bước 6** | Truy cập đường dẫn `/admin` trên trình duyệt | Hiển thị giao diện Dashboard Admin sang trọng, các thẻ KPI và thanh phễu chuyển đổi 1 màu đỏ chủ đạo `#5D0F12` tải dữ liệu mượt mà. |
| **Bước 7** | Truy cập đường dẫn `/admin/ai-insights` | Hiển thị biểu đồ phân bổ ngân sách, top phong cách cưới hot nhất 2026 và 4 thẻ đo lường độ trễ, token tiêu thụ của mô hình AI. |
| **Bước 8** | Truy cập đường dẫn `/admin/dormant` | Hiển thị bảng phân tích tài khoản ngủ đông, cảnh báo cặp đôi sắp cưới vắng mặt, bộ lọc rủi ro và modal mẫu email nhắc nhở cá nhân hóa. |


