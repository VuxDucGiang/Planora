# Hướng dẫn Xây dựng API - Module 2: Wedding Onboarding & Planning (USP - Tạo kế hoạch tự động)

Tài liệu này hướng dẫn chi tiết từng bước (kèm code mẫu chuẩn Spring Boot) để bạn tự tay xây dựng cụm API cho **Module 2 (Wedding Onboarding & Planning)** trong dự án Planora. Đây là tính năng độc đáo (USP - Unique Selling Proposition) của dự án, cho phép cặp đôi khảo sát và tự động phân bổ ngân sách, tạo checklist nhiệm vụ, tạo timeline và đề xuất vendor phù hợp.

---

## 1. Các bước thực hiện tổng quan
1. **Bước 1:** Khai báo đầy đủ JPA Entities (`WeddingPlan`, `WeddingStyle`, `ServiceCategorie`, `BudgetCategory`, `BudgetItem`, `ChecklistTask`, `TimelineEvent`, `ConceptSuggestion`, `VendorMatches`).
2. **Bước 2:** Tạo các Lớp truyền dữ liệu (DTO - Data Transfer Object) cho Request và Response.
3. **Bước 3:** Tạo các Repository tương ứng cho các thực thể.
4. **Bước 4:** Xây dựng tầng Service (`WeddingPlanService`, `WeddingStyleService`, `ServiceCategoryService`) xử lý thuật toán phân bổ và tự động hóa.
5. **Bước 5:** Viết các Rest Controllers (`WeddingPlanController`, `WeddingStyleController`, `ServiceCategoryController`).
6. **Bước 6:** Hướng dẫn Test API chi tiết bằng Postman.

---

## BƯỚC 1: Hoàn thiện JPA Entities cho Module 2

Các thực thể này hiện tại là các lớp rỗng (stub classes) trong thư mục `entity/`. Chúng ta cần ánh xạ các thuộc tính chính xác theo cấu trúc database ở `V1__init_schema.sql`.

### 1.1. Cập nhật [WeddingStyle.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/WeddingStyle.java)
Ánh xạ tới bảng `wedding_styles` để lưu trữ các phong cách đám cưới có sẵn (Traditional, Minimalist, Luxury...):

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wedding_styles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeddingStyle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
}
```

### 1.2. Cập nhật [ServiceCategorie.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/ServiceCategorie.java)
Ánh xạ tới bảng `service_categories` (danh mục dịch vụ của vendor như Studio, Makeup, Venue, Decor...):

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCategorie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Builder.Default
    private Boolean active = true;
}
```

### 1.3. Cập nhật [BudgetCategory.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/BudgetCategory.java)
Ánh xạ tới bảng `budget_categories` để lưu phân loại hạng mục ngân sách (Venue, Decoration, Photography...):

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "budget_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}
```

### 1.4. Cập nhật [BudgetItem.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/BudgetItem.java)
Ánh xạ tới bảng `budget_items` để quản lý chi tiết phân bổ ngân sách cho từng hạng mục trong kế hoạch cưới:

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_plan_id", nullable = false)
    private WeddingPlan weddingPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private BudgetCategory category;

    @Column(name = "estimated_cost")
    private BigDecimal estimatedCost;

    @Column(name = "actual_cost")
    private BigDecimal actualCost;

    private String note;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.5. Cập nhật [ChecklistTask.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/ChecklistTask.java)
Ánh xạ tới bảng `checklist_tasks` để quản lý danh sách công việc cần làm:

```java
package com.fudn.planora.entity;

import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checklist_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_plan_id", nullable = false)
    private WeddingPlan weddingPlan;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EChecklistTaskStatus status = EChecklistTaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EChecklistTaskPriority priority = EChecklistTaskPriority.MEDIUM;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.6. Cập nhật [TimelineEvent.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/TimelineEvent.java)
Ánh xạ tới bảng `timeline_events` để quản lý các mốc thời gian/sự kiện của ngày cưới hoặc sự kiện lớn:

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "timeline_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_plan_id", nullable = false)
    private WeddingPlan weddingPlan;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.7. Cập nhật [ConceptSuggestion.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/ConceptSuggestion.java)
Ánh xạ tới bảng `concept_suggestions` để hiển thị các gợi ý concept đám cưới phù hợp với ngân sách và phong cách:

```java
package com.fudn.planora.entity;

import com.fudn.planora.enums.EConceptSuggestionGeneratedBy;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "concept_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConceptSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_plan_id", nullable = false)
    private WeddingPlan weddingPlan;

    @Column(name = "concept_name")
    private String conceptName;

    private String description;

    @Column(name = "estimated_budget")
    private BigDecimal estimatedBudget;

    @Enumerated(EnumType.STRING)
    @Column(name = "generated_by")
    @Builder.Default
    private EConceptSuggestionGeneratedBy generatedBy = EConceptSuggestionGeneratedBy.RULE_BASED;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.8. Cập nhật [VendorMatches.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorMatches.java)
Ánh xạ tới bảng `vendor_matches` để chứa danh sách so khớp và đề xuất Vendor tối ưu:

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorMatches {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_plan_id", nullable = false)
    private WeddingPlan weddingPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "matching_score")
    private Double matchingScore;

    private String reason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.9. Cập nhật [WeddingPlan.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/WeddingPlan.java)
Ánh xạ trung tâm kết nối các thực thể con lại với nhau qua quan hệ `OneToMany` và `ManyToMany`:

```java
package com.fudn.planora.entity;

import com.fudn.planora.enums.EWeddingPlanStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "wedding_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeddingPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(name = "wedding_date")
    private LocalDate weddingDate;

    @Column(name = "guest_count")
    private Integer guestCount;

    private BigDecimal budget;

    private String location;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EWeddingPlanStatus status = EWeddingPlanStatus.DRAFT;

    @ManyToMany
    @JoinTable(
        name = "wedding_plan_styles",
        joinColumns = @JoinColumn(name = "wedding_plan_id"),
        inverseJoinColumns = @JoinColumn(name = "wedding_style_id")
    )
    private Set<WeddingStyle> weddingStyles;

    @ManyToMany
    @JoinTable(
        name = "wedding_plan_priorities",
        joinColumns = @JoinColumn(name = "wedding_plan_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<ServiceCategorie> priorityCategories;

    @OneToMany(mappedBy = "weddingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BudgetItem> budgetItems = new ArrayList<>();

    @OneToMany(mappedBy = "weddingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChecklistTask> checklistTasks = new ArrayList<>();

    @OneToMany(mappedBy = "weddingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TimelineEvent> timelineEvents = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = EWeddingPlanStatus.DRAFT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

## BƯỚC 2: Tạo các lớp DTO (Data Transfer Object)

Tạo các DTO này để truyền nhận dữ liệu giữa Client và Server.

### 2.1. Request khảo sát Onboarding: [OnboardingRequest.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request/OnboardingRequest.java)
Tạo mới file trong thư mục `dto/request`:

```java
package com.fudn.planora.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class OnboardingRequest {
    @NotBlank(message = "Tiêu đề kế hoạch không được để trống")
    private String title;

    @NotNull(message = "Ngày cưới không được để trống")
    private LocalDate weddingDate;

    @NotBlank(message = "Địa điểm tổ chức không được để trống")
    private String location;

    @NotNull(message = "Số lượng khách không được để trống")
    @Min(value = 1, message = "Số lượng khách phải lớn hơn 0")
    private Integer guestCount;

    @NotNull(message = "Tổng ngân sách không được để trống")
    @Min(value = 0, message = "Ngân sách không được là số âm")
    private BigDecimal budget;

    private Set<Long> styleIds;
    private Set<Long> priorityCategoryIds;
}
```

### 2.2. DTO phản hồi khi tạo Plan: [WeddingPlanResponse.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response/WeddingPlanResponse.java)
Tạo mới file trong thư mục `dto/response`:

```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeddingPlanResponse {
    private Long id;
    private String title;
    private LocalDate weddingDate;
    private Integer guestCount;
    private BigDecimal budget;
    private String location;
    private String status;
}
```

### 2.3. DTO phản hồi Kế hoạch đang hoạt động: [ActivePlanResponse.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response/ActivePlanResponse.java)
Tạo mới file trong thư mục `dto/response`:

```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivePlanResponse {
    private Long id;
    private String title;
    private LocalDate weddingDate;
    private Integer guestCount;
    private BigDecimal budget;
    private String location;
    private String status;
    private List<BudgetItemSummary> budgetItems;
    private List<ConceptSummary> conceptSuggestions;
    private ChecklistStats checklistStats;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BudgetItemSummary {
        private String categoryName;
        private BigDecimal estimatedCost;
        private BigDecimal actualCost;
        private String note;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConceptSummary {
        private String conceptName;
        private String description;
        private BigDecimal estimatedBudget;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChecklistStats {
        private long totalTasks;
        private long completedTasks;
    }
}
```

### 2.4. DTO cho Style & Service Category
Tạo [WeddingStyleResponse.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response/WeddingStyleResponse.java) và [ServiceCategoryResponse.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response/ServiceCategoryResponse.java):

```java
// WeddingStyleResponse.java
package com.fudn.planora.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WeddingStyleResponse {
    private Long id;
    private String name;
    private String description;
}
```

```java
// ServiceCategoryResponse.java
package com.fudn.planora.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceCategoryResponse {
    private Long id;
    private String name;
}
```

---

## BƯỚC 3: Tạo Repository Layers

Tạo mới các interface Repository trong thư mục `repository/` để truy xuất DB.

### 3.1. Các Repository cơ bản
Tạo các tệp sau trong thư mục `repository/`:

1. [WeddingPlanRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/WeddingPlanRepository.java):
   ```java
   package com.fudn.planora.repository;

   import com.fudn.planora.entity.WeddingPlan;
   import org.springframework.data.jpa.repository.JpaRepository;
   import java.util.Optional;

   public interface WeddingPlanRepository extends JpaRepository<WeddingPlan, Long> {
       Optional<WeddingPlan> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, com.fudn.planora.enums.EWeddingPlanStatus status);
   }
   ```
2. [WeddingStyleRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/WeddingStyleRepository.java):
   ```java
   package com.fudn.planora.repository;

   import com.fudn.planora.entity.WeddingStyle;
   import org.springframework.data.jpa.repository.JpaRepository;

   public interface WeddingStyleRepository extends JpaRepository<WeddingStyle, Long> {
   }
   ```
3. [ServiceCategorieRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/ServiceCategorieRepository.java) (Lưu ý tên `ServiceCategorie` tương ứng với thực thể):
   ```java
   package com.fudn.planora.repository;

   import com.fudn.planora.entity.ServiceCategorie;
   import org.springframework.data.jpa.repository.JpaRepository;

   public interface ServiceCategorieRepository extends JpaRepository<ServiceCategorie, Long> {
   }
   ```
4. [BudgetCategoryRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/BudgetCategoryRepository.java):
   ```java
   package com.fudn.planora.repository;

   import com.fudn.planora.entity.BudgetCategory;
   import org.springframework.data.jpa.repository.JpaRepository;
   import java.util.Optional;

   public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {
       Optional<BudgetCategory> findByName(String name);
   }
   ```
5. [BudgetItemRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/BudgetItemRepository.java):
   ```java
   package com.fudn.planora.repository;

   import com.fudn.planora.entity.BudgetItem;
   import org.springframework.data.jpa.repository.JpaRepository;

   public interface BudgetItemRepository extends JpaRepository<BudgetItem, Long> {
   }
   ```
6. [ChecklistTaskRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/ChecklistTaskRepository.java):
   ```java
   package com.fudn.planora.repository;

   import com.fudn.planora.entity.ChecklistTask;
   import org.springframework.data.jpa.repository.JpaRepository;

   public interface ChecklistTaskRepository extends JpaRepository<ChecklistTask, Long> {
   }
   ```
7. [TimelineEventRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/TimelineEventRepository.java):
   ```java
   package com.fudn.planora.repository;

   import com.fudn.planora.entity.TimelineEvent;
   import org.springframework.data.jpa.repository.JpaRepository;

   public interface TimelineEventRepository extends JpaRepository<TimelineEvent, Long> {
   }
   ```
8. [ConceptSuggestionRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/ConceptSuggestionRepository.java):
   ```java
   package com.fudn.planora.repository;

   import com.fudn.planora.entity.ConceptSuggestion;
   import org.springframework.data.jpa.repository.JpaRepository;

   public interface ConceptSuggestionRepository extends JpaRepository<ConceptSuggestion, Long> {
   }
   ```

---

## BƯỚC 4: Phát triển Service Layer (Core USP)

Đây là nơi xử lý thuật toán phân bổ ngân sách tự động, tạo checklist và timeline mặc định dựa vào thông tin của lễ cưới.

### 4.1. Tạo Interface `WeddingPlanService.java`
Tạo mới file trong thư mục `service/`:

```java
package com.fudn.planora.service;

import com.fudn.planora.dto.request.OnboardingRequest;
import com.fudn.planora.dto.response.ActivePlanResponse;
import com.fudn.planora.dto.response.WeddingPlanResponse;

public interface WeddingPlanService {
    WeddingPlanResponse createOnboardingPlan(String userEmail, OnboardingRequest request);
    ActivePlanResponse getActivePlan(String userEmail);
}
```

### 4.2. Tạo lớp triển khai `WeddingPlanServiceImpl.java`
Tạo mới file trong thư mục `service/impl/`. Đây là nơi chứa toàn bộ thuật toán tự động:

```java
package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.OnboardingRequest;
import com.fudn.planora.dto.response.ActivePlanResponse;
import com.fudn.planora.dto.response.WeddingPlanResponse;
import com.fudn.planora.entity.*;
import com.fudn.planora.enums.*;
import com.fudn.planora.repository.*;
import com.fudn.planora.service.WeddingPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeddingPlanServiceImpl implements WeddingPlanService {

    private final UserRepository userRepository;
    private final WeddingPlanRepository planRepository;
    private final WeddingStyleRepository styleRepository;
    private final ServiceCategorieRepository categoryRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final ConceptSuggestionRepository conceptRepository;

    @Override
    @Transactional
    public WeddingPlanResponse createOnboardingPlan(String userEmail, OnboardingRequest request) {
        User user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 1. Khởi tạo Kế hoạch cưới mới
        WeddingPlan plan = WeddingPlan.builder()
                .user(user)
                .title(request.getTitle())
                .weddingDate(request.getWeddingDate())
                .location(request.getLocation())
                .guestCount(request.getGuestCount())
                .budget(request.getBudget())
                .status(EWeddingPlanStatus.PLANNING)
                .build();

        // Ánh xạ Wedding Styles đã chọn
        if (request.getStyleIds() != null && !request.getStyleIds().isEmpty()) {
            List<WeddingStyle> styles = styleRepository.findAllById(request.getStyleIds());
            plan.setWeddingStyles(new HashSet<>(styles));
        }

        // Ánh xạ Priority Service Categories đã chọn
        if (request.getPriorityCategoryIds() != null && !request.getPriorityCategoryIds().isEmpty()) {
            List<ServiceCategorie> categories = categoryRepository.findAllById(request.getPriorityCategoryIds());
            plan.setPriorityCategories(new HashSet<>(categories));
        }

        // 2. Tự động phân bổ ngân sách mặc định (Ví dụ tỷ lệ phân bổ: Venue 50%, Decoration 15%...)
        plan.setBudgetItems(allocateDefaultBudget(plan, request.getBudget()));

        // 3. Tự động tạo checklist công việc dựa trên ngày cưới (Wedding Date)
        plan.setChecklistTasks(generateDefaultChecklist(plan, request.getWeddingDate()));

        // 4. Tự động tạo Timeline ngày cưới mẫu
        plan.setTimelineEvents(generateDefaultTimeline(plan, request.getWeddingDate()));

        // Lưu kế hoạch
        WeddingPlan savedPlan = planRepository.save(plan);

        // 5. Tự động tạo concept gợi ý dựa trên styles đã chọn
        generateDefaultConcepts(savedPlan);

        return WeddingPlanResponse.builder()
                .id(savedPlan.getId())
                .title(savedPlan.getTitle())
                .weddingDate(savedPlan.getWeddingDate())
                .guestCount(savedPlan.getGuestCount())
                .budget(savedPlan.getBudget())
                .location(savedPlan.getLocation())
                .status(savedPlan.getStatus().name())
                .build();
    }

    @Override
    public ActivePlanResponse getActivePlan(String userEmail) {
        User user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Lấy plan gần nhất đang trong trạng thái PLANNING
        WeddingPlan plan = planRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), EWeddingPlanStatus.PLANNING)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch cưới nào đang hoạt động. Hãy hoàn thành Onboarding trước!"));

        // Tính toán thống kê checklist
        long totalTasks = plan.getChecklistTasks().size();
        long completedTasks = plan.getChecklistTasks().stream()
                .filter(task -> task.getStatus() == EChecklistTaskStatus.DONE)
                .count();

        // Map Budget Items
        List<ActivePlanResponse.BudgetItemSummary> budgetSummary = plan.getBudgetItems().stream()
                .map(item -> ActivePlanResponse.BudgetItemSummary.builder()
                        .categoryName(item.getCategory().getName())
                        .estimatedCost(item.getEstimatedCost())
                        .actualCost(item.getActualCost())
                        .note(item.getNote())
                        .build())
                .collect(Collectors.toList());

        // Map Concept suggestions
        List<ActivePlanResponse.ConceptSummary> concepts = plan.getBudgetItems().stream().findFirst().map(b -> 
            // Giả lập hoặc lấy từ DB (trong ví dụ này ta lấy từ database conceptRepository)
            conceptRepository.findAll().stream()
                .filter(c -> c.getWeddingPlan().getId().equals(plan.getId()))
                .map(c -> ActivePlanResponse.ConceptSummary.builder()
                        .conceptName(c.getConceptName())
                        .description(c.getDescription())
                        .estimatedBudget(c.getEstimatedBudget())
                        .build())
                .collect(Collectors.toList())
        ).orElse(new ArrayList<>());
        
        return ActivePlanResponse.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .weddingDate(plan.getWeddingDate())
                .guestCount(plan.getGuestCount())
                .budget(plan.getBudget())
                .location(plan.getLocation())
                .status(plan.getStatus().name())
                .budgetItems(budgetSummary)
                .conceptSuggestions(concepts)
                .checklistStats(new ActivePlanResponse.ChecklistStats(totalTasks, completedTasks))
                .build();
    }

    // ==========================================
    // THUẬT TOÁN TỰ ĐỘNG PHÂN BỔ NGÂN SÁCH (USP)
    // ==========================================
    private List<BudgetItem> allocateDefaultBudget(WeddingPlan plan, BigDecimal totalBudget) {
        List<BudgetItem> items = new ArrayList<>();
        
        // Tỷ lệ phần trăm phân bổ mẫu:
        // Venue (Nhà hàng tiệc cưới) -> 50%
        // Food & Beverage -> 15%
        // Decoration (Trang trí) -> 10%
        // Photography (Quay phim, chụp ảnh) -> 10%
        // Makeup -> 5%
        // Wedding Dress -> 5%
        // Entertainment -> 5%
        Map<String, Double> allocationRules = new LinkedHashMap<>();
        allocationRules.put("Venue", 0.50);
        allocationRules.put("Food & Beverage", 0.15);
        allocationRules.put("Decoration", 0.10);
        allocationRules.put("Photography", 0.10);
        allocationRules.put("Makeup", 0.05);
        allocationRules.put("Wedding Dress", 0.05);
        allocationRules.put("Entertainment", 0.05);

        for (Map.Entry<String, Double> rule : allocationRules.entrySet()) {
            BudgetCategory category = budgetCategoryRepository.findByName(rule.getKey())
                    .orElseGet(() -> budgetCategoryRepository.save(BudgetCategory.builder().name(rule.getKey()).build()));

            BigDecimal estimatedCost = totalBudget.multiply(BigDecimal.valueOf(rule.getValue()))
                    .setScale(2, RoundingMode.HALF_UP);

            items.add(BudgetItem.builder()
                    .weddingPlan(plan)
                    .category(category)
                    .estimatedCost(estimatedCost)
                    .actualCost(BigDecimal.ZERO)
                    .note("Phân bổ tự động từ Planora")
                    .build());
        }
        return items;
    }

    // ==========================================
    // TỰ ĐỘNG TẠO CHECKLIST NHIỆM VỤ THEO NGÀY CƯỚI
    // ==========================================
    private List<ChecklistTask> generateDefaultChecklist(WeddingPlan plan, LocalDate weddingDate) {
        List<ChecklistTask> tasks = new ArrayList<>();

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Xác định tổng ngân sách & Lập kế hoạch tài chính")
                .description("Lập kế hoạch phân bổ chi tiết ngân sách ban đầu.")
                .dueDate(weddingDate.minusMonths(9))
                .priority(EChecklistTaskPriority.HIGH)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Tìm kiếm & Đặt nhà hàng tiệc cưới (Venue)")
                .description("Tham quan và đặt cọc sảnh tiệc để giữ ngày.")
                .dueDate(weddingDate.minusMonths(6))
                .priority(EChecklistTaskPriority.HIGH)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Tìm kiếm Wedding Planner / Đơn vị trang trí hoa tươi")
                .description("Thảo luận ý tưởng trang trí đám cưới phù hợp với phong cách cưới.")
                .dueDate(weddingDate.minusMonths(5))
                .priority(EChecklistTaskPriority.MEDIUM)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Đặt lịch Studio chụp hình Pre-wedding & Makeup")
                .description("Chụp hình cưới ngoại cảnh hoặc tại studio.")
                .dueDate(weddingDate.minusMonths(3))
                .priority(EChecklistTaskPriority.HIGH)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Thuê váy cưới & Vest chú rể")
                .description("Thử váy, vest và hoàn tất thuê/may đo.")
                .dueDate(weddingDate.minusMonths(2))
                .priority(EChecklistTaskPriority.MEDIUM)
                .status(EChecklistTaskStatus.TODO)
                .build());

        tasks.add(ChecklistTask.builder()
                .weddingPlan(plan)
                .title("Gửi thiệp mời đám cưới & Chốt số lượng khách")
                .description("Gửi thiệp giấy và thiệp online cho khách mời.")
                .dueDate(weddingDate.minusMonths(1))
                .priority(EChecklistTaskPriority.HIGH)
                .status(EChecklistTaskStatus.TODO)
                .build());

        return tasks;
    }

    // ==========================================
    // TỰ ĐỘNG TẠO TIMELINE MẪU NGÀY CƯỚI
    // ==========================================
    private List<TimelineEvent> generateDefaultTimeline(WeddingPlan plan, LocalDate weddingDate) {
        List<TimelineEvent> events = new ArrayList<>();
        LocalDateTime baseTime = weddingDate.atStartOfDay();

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Trang điểm cô dâu tại nhà")
                .description("Thời gian Makeup Artist làm tóc và trang điểm cô dâu đón lễ gia tiên.")
                .eventDate(baseTime.withHour(7).withMinute(0))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Lễ Gia Tiên tại nhà gái")
                .description("Nhà trai sang thắp hương báo cáo tổ tiên và xin dâu.")
                .eventDate(baseTime.withHour(9).withMinute(0))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Đón dâu về nhà trai")
                .description("Lễ thành hôn chính thức tại nhà trai.")
                .eventDate(baseTime.withHour(11).withMinute(0))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Đón khách tại trung tâm tiệc cưới")
                .description("Chụp hình kỷ niệm tại backdrop và hướng dẫn khách mời vào sảnh tiệc.")
                .eventDate(baseTime.withHour(17).withMinute(30))
                .build());

        events.add(TimelineEvent.builder()
                .weddingPlan(plan)
                .title("Khai tiệc & Cử hành hôn lễ")
                .description("Cô dâu chú rể bước vào sảnh, cắt bánh, rót rượu và bắt đầu khai tiệc.")
                .eventDate(baseTime.withHour(18).withMinute(30))
                .build());

        return events;
    }

    // ==========================================
    // TẠO GỢI Ý CONCEPT DỰA TRÊN PHONG CÁCH ĐÃ CHỌN
    // ==========================================
    private void generateDefaultConcepts(WeddingPlan plan) {
        if (plan.getWeddingStyles() == null || plan.getWeddingStyles().isEmpty()) {
            return;
        }

        for (WeddingStyle style : plan.getWeddingStyles()) {
            String conceptName = "Concept " + style.getName() + " Dream";
            String description = "Một concept trọn gói được thiết kế tỉ mỉ theo trường phái " 
                    + style.getName() + " nhằm đem lại không khí ấm áp, sang trọng phù hợp với ngân sách dự kiến.";

            BigDecimal estimatedBudget = plan.getBudget().multiply(BigDecimal.valueOf(0.40))
                    .setScale(2, RoundingMode.HALF_UP);

            conceptRepository.save(ConceptSuggestion.builder()
                    .weddingPlan(plan)
                    .conceptName(conceptName)
                    .description(description)
                    .estimatedBudget(estimatedBudget)
                    .generatedBy(EConceptSuggestionGeneratedBy.RULE_BASED)
                    .build());
        }
    }
}
```

### 4.3. Tạo Interface và Impl cho WeddingStyle và ServiceCategory
Tạo các tệp để hỗ trợ cho việc hiển thị danh sách styles và categories ở màn hình Onboarding:

1. Interface [WeddingStyleService.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/WeddingStyleService.java):
   ```java
   package com.fudn.planora.service;

   import com.fudn.planora.dto.response.WeddingStyleResponse;
   import java.util.List;

   public interface WeddingStyleService {
       List<WeddingStyleResponse> getAllStyles();
   }
   ```
2. Class [WeddingStyleServiceImpl.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl/WeddingStyleServiceImpl.java):
   ```java
   package com.fudn.planora.service.impl;

   import com.fudn.planora.dto.response.WeddingStyleResponse;
   import com.fudn.planora.repository.WeddingStyleRepository;
   import com.fudn.planora.service.WeddingStyleService;
   import lombok.RequiredArgsConstructor;
   import org.springframework.stereotype.Service;
   import java.util.List;
   import java.util.stream.Collectors;

   @Service
   @RequiredArgsConstructor
   public class WeddingStyleServiceImpl implements WeddingStyleService {

       private final WeddingStyleRepository styleRepository;

       @Override
       public List<WeddingStyleResponse> getAllStyles() {
           return styleRepository.findAll().stream()
                   .map(style -> WeddingStyleResponse.builder()
                           .id(style.getId())
                           .name(style.getName())
                           .description(style.getDescription())
                           .build())
                   .collect(Collectors.toList());
       }
   }
   ```
3. Interface [ServiceCategoryService.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/ServiceCategoryService.java):
   ```java
   package com.fudn.planora.service;

   import com.fudn.planora.dto.response.ServiceCategoryResponse;
   import java.util.List;

   public interface ServiceCategoryService {
       List<ServiceCategoryResponse> getAllActiveCategories();
   }
   ```
4. Class [ServiceCategoryServiceImpl.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl/ServiceCategoryServiceImpl.java):
   ```java
   package com.fudn.planora.service.impl;

   import com.fudn.planora.dto.response.ServiceCategoryResponse;
   import com.fudn.planora.repository.ServiceCategorieRepository;
   import com.fudn.planora.service.ServiceCategoryService;
   import lombok.RequiredArgsConstructor;
   import org.springframework.stereotype.Service;
   import java.util.List;
   import java.util.stream.Collectors;

   @Service
   @RequiredArgsConstructor
   public class ServiceCategoryServiceImpl implements ServiceCategoryService {

       private final ServiceCategorieRepository categoryRepository;

       @Override
       public List<ServiceCategoryResponse> getAllActiveCategories() {
           return categoryRepository.findAll().stream()
                   .filter(ServiceCategorie::getActive)
                   .map(cat -> ServiceCategoryResponse.builder()
                           .id(cat.getId())
                           .name(cat.getName())
                           .build())
                   .collect(Collectors.toList());
       }
   }
   ```

---

## BƯỚC 5: Viết REST Controllers

Tạo mới các REST Controllers trong thư mục `controller/` để xử lý các Endpoint tương ứng.

### 5.1. Tạo [WeddingPlanController.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/WeddingPlanController.java)
Lớp này xử lý hai tính năng chính là nhận kết quả khảo sát từ Client và cung cấp chi tiết Dashboard:

```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.request.OnboardingRequest;
import com.fudn.planora.dto.response.ActivePlanResponse;
import com.fudn.planora.dto.response.WeddingPlanResponse;
import com.fudn.planora.service.WeddingPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wedding-plans")
@RequiredArgsConstructor
public class WeddingPlanController {

    private final WeddingPlanService planService;

    @PostMapping("/onboarding")
    public WeddingPlanResponse createOnboarding(@RequestBody @Valid OnboardingRequest request) {
        String email = getLoggedInUserEmail();
        return planService.createOnboardingPlan(email, request);
    }

    @GetMapping("/active")
    public ActivePlanResponse getActivePlan() {
        String email = getLoggedInUserEmail();
        return planService.getActivePlan(email);
    }

    private String getLoggedInUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("Người dùng chưa được xác thực");
    }
}
```

### 5.2. Tạo [WeddingStyleController.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/WeddingStyleController.java)
```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.response.WeddingStyleResponse;
import com.fudn.planora.service.WeddingStyleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/wedding-styles")
@RequiredArgsConstructor
public class WeddingStyleController {

    private final WeddingStyleService styleService;

    @GetMapping
    public List<WeddingStyleResponse> getStyles() {
        return styleService.getAllStyles();
    }
}
```

### 5.3. Tạo [ServiceCategoryController.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/ServiceCategoryController.java)
```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.response.ServiceCategoryResponse;
import com.fudn.planora.service.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/service-categories")
@RequiredArgsConstructor
public class ServiceCategoryController {

    private final ServiceCategoryService categoryService;

    @GetMapping
    public List<ServiceCategoryResponse> getCategories() {
        return categoryService.getAllActiveCategories();
    }
}
```

---

## BƯỚC 6: Hướng dẫn Test API chi tiết bằng Postman

Sau khi chạy dự án Spring Boot, bạn có thể kiểm thử các API của Module 2 thông qua Postman theo hướng dẫn chi tiết dưới đây.

* **Base URL:** `http://localhost:8080`
* **Header xác thực yêu cầu:** `Authorization: Bearer <accessToken_cua_user>`

---

### 6.1. API Lấy danh sách phong cách cưới (Wedding Styles)
API này là công khai (Public) để hiển thị danh sách lựa chọn ở màn hình Onboarding (Bước 3).

* **HTTP Method:** `GET`
* **Endpoint:** `/api/wedding-styles`
* **Headers:** Không yêu cầu
* **Body:** Không có (None)

* **Phản hồi thành công (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Traditional",
      "description": "Traditional Vietnamese wedding style"
    },
    {
      "id": 2,
      "name": "Minimalist",
      "description": "Simple and elegant wedding"
    },
    {
      "id": 3,
      "name": "Luxury",
      "description": "High-end luxury wedding"
    }
  ]
  ```

---

### 6.2. API Lấy danh sách dịch vụ cưới ưu tiên (Service Categories)
API công khai hiển thị các danh mục dịch vụ phục vụ Bước 4 của Onboarding.

* **HTTP Method:** `GET`
* **Endpoint:** `/api/service-categories`
* **Headers:** Không yêu cầu
* **Body:** Không có (None)

* **Phản hồi thành công (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Studio"
    },
    {
      "id": 2,
      "name": "Makeup"
    },
    {
      "id": 3,
      "name": "Venue"
    }
  ]
  ```

---

### 6.3. API Gửi khảo sát để tự tạo Kế hoạch cưới (Wedding Plan Onboarding)
Khi cặp đôi hoàn tất nhấn nút "Tạo kế hoạch" ở màn hình Onboarding, dữ liệu sẽ được gửi lên đây để khởi tạo thuật toán phân bổ tự động.

* **HTTP Method:** `POST`
* **Endpoint:** `/api/wedding-plans/onboarding`
* **Headers:** 
  * `Content-Type: application/json`
  * `Authorization: Bearer <accessToken>`
* **Body (raw - JSON):**
  ```json
  {
    "title": "Đám cưới cổ tích của A & B",
    "weddingDate": "2026-12-25",
    "location": "Hà Nội",
    "guestCount": 200,
    "budget": 200000000.00,
    "styleIds": [2, 4],
    "priorityCategoryIds": [1, 2, 7]
  }
  ```

* **Phản hồi thành công (200 OK):**
  ```json
  {
    "id": 1,
    "title": "Đám cưới cổ tích của A & B",
    "weddingDate": "2026-12-25",
    "guestCount": 200,
    "budget": 200000000.00,
    "location": "Hà Nội",
    "status": "PLANNING"
  }
  ```

---

### 6.4. API Lấy kế hoạch đang hoạt động (Get Active Plan)
API này dùng để lấy dữ liệu tổng hợp cho trang Dashboard sau khi hoàn thành tạo kế hoạch hoặc khi truy cập lại vào hệ thống.

* **HTTP Method:** `GET`
* **Endpoint:** `/api/wedding-plans/active`
* **Headers:**
  * `Authorization: Bearer <accessToken>`
* **Body:** Không có (None)

* **Phản hồi thành công (200 OK):**
  ```json
  {
    "id": 1,
    "title": "Đám cưới cổ tích của A & B",
    "weddingDate": "2026-12-25",
    "guestCount": 200,
    "budget": 200000000.00,
    "location": "Hà Nội",
    "status": "PLANNING",
    "budgetItems": [
      {
        "categoryName": "Venue",
        "estimatedCost": 100000000.00,
        "actualCost": 0.00,
        "note": "Phân bổ tự động từ Planora"
      },
      {
        "categoryName": "Food & Beverage",
        "estimatedCost": 30000000.00,
        "actualCost": 0.00,
        "note": "Phân bổ tự động từ Planora"
      },
      {
        "categoryName": "Decoration",
        "estimatedCost": 20000000.00,
        "actualCost": 0.00,
        "note": "Phân bổ tự động từ Planora"
      }
    ],
    "conceptSuggestions": [
      {
        "conceptName": "Concept Minimalist Dream",
        "description": "Một concept trọn gói được thiết kế tỉ mỉ theo trường phái Minimalist nhằm đem lại không khí ấm áp, sang trọng phù hợp với ngân sách dự kiến.",
        "estimatedBudget": 80000000.00
      }
    ],
    "checklistStats": {
      "totalTasks": 6,
      "completedTasks": 0
    }
  }
  ```
