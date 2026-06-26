# Hướng dẫn Xây dựng API - Module 4: Budget Management

Tài liệu này hướng dẫn chi tiết từng bước (kèm code mẫu chuẩn Spring Boot) để bạn tự tay xây dựng cụm API cho **Module 4 (Quản lý Ngân sách & Phân bổ chi tiêu đám cưới)** trong dự án Planora.

---

## 1. Các bước thực hiện tổng quan
1.  **Bước 1:** Tạo mới Repository Layer cho các hạng mục chi tiêu (`BudgetItemRepository`).
2.  **Bước 2:** Tạo các lớp truyền dữ liệu (DTO - Data Transfer Object) cho Request và Response.
3.  **Bước 3:** Xây dựng tầng Service (`BudgetService` và class Implementation tương ứng).
4.  **Bước 4:** Viết REST Controller (`BudgetController`).
5.  **Bước 5:** Hướng dẫn Test API chi tiết bằng Postman.

---

## BƯỚC 1: Tạo mới Repository Layer

Thực thể [BudgetCategory.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/BudgetCategory.java) và [BudgetItem.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/BudgetItem.java) đã được ánh xạ sẵn với database. Chúng ta cần định nghĩa thêm Repository cho `BudgetItem`.

### 1.1. Tạo mới [BudgetItemRepository.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/BudgetItemRepository.java)
Tạo mới file trong thư mục `repository/` để truy vấn danh sách hạng mục ngân sách theo `wedding_plan_id`:

```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.BudgetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetItemRepository extends JpaRepository<BudgetItem, Long> {
    List<BudgetItem> findByWeddingPlanId(Long weddingPlanId);
}
```

---

## BƯỚC 2: Tạo các lớp DTO (Data Transfer Object)

Các DTO này phục vụ nhận thông tin cập nhật chi tiêu và định dạng JSON trả về cho màn hình Dashboard ngân sách.

### 2.1. Request cập nhật hạng mục: `UpdateBudgetItemRequest.java`
Tạo mới file `UpdateBudgetItemRequest.java` trong thư mục [dto/request](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request):

```java
package com.fudn.planora.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class UpdateBudgetItemRequest {
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String note;
}
```

### 2.2. Response chi tiết hạng mục: `BudgetItemResponse.java`
Tạo mới file `BudgetItemResponse.java` trong thư mục [dto/response](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):

```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetItemResponse {
    private Long itemId;
    private Long categoryId;
    private String categoryName;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String note;
}
```

### 2.3. Response tổng hợp ngân sách: `BudgetResponse.java`
Tạo mới file `BudgetResponse.java` trong thư mục [dto/response](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):

```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {
    private BigDecimal totalBudget;
    private BigDecimal totalEstimated;
    private BigDecimal totalActualSpent;
    private List<BudgetItemResponse> categories;
}
```

---

## BƯỚC 3: Xây dựng Tầng Service Layer

Tầng Service chịu trách nhiệm tính toán tổng ngân sách đã phân bổ (Estimated), tổng chi tiêu thực tế (Actual Spent), và xác thực quyền sở hữu kế hoạch đám cưới của User đang thực hiện thao tác.

### 3.1. Định nghĩa [BudgetService.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/BudgetService.java)
Tạo interface trong thư mục `service/`:

```java
package com.fudn.planora.service;

import com.fudn.planora.dto.request.UpdateBudgetItemRequest;
import com.fudn.planora.dto.response.BudgetResponse;
import com.fudn.planora.dto.response.BudgetItemResponse;

public interface BudgetService {
    BudgetResponse getBudget(Long planId, String email);
    BudgetItemResponse updateBudgetItem(Long itemId, UpdateBudgetItemRequest request, String email);
}
```

### 3.2. Triển khai [BudgetServiceImpl.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl/BudgetServiceImpl.java)
Tạo class implementation trong thư mục `service/impl/`:

```java
package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.UpdateBudgetItemRequest;
import com.fudn.planora.dto.response.BudgetItemResponse;
import com.fudn.planora.dto.response.BudgetResponse;
import com.fudn.planora.entity.BudgetItem;
import com.fudn.planora.entity.User;
import com.fudn.planora.entity.WeddingPlan;
import com.fudn.planora.repository.BudgetItemRepository;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.repository.WeddingPlanRepository;
import com.fudn.planora.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetItemRepository budgetItemRepository;
    private final WeddingPlanRepository weddingPlanRepository;
    private final UserRepository userRepository;

    @Override
    public BudgetResponse getBudget(Long planId, String email) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, email);
        
        List<BudgetItem> items = budgetItemRepository.findByWeddingPlanId(planId);

        BigDecimal totalBudget = plan.getBudget() != null ? plan.getBudget() : BigDecimal.ZERO;
        
        // Tính tổng ngân sách ước tính đã phân bổ
        BigDecimal totalEstimated = items.stream()
                .map(BudgetItem::getEstimatedCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính tổng chi tiêu thực tế
        BigDecimal totalActualSpent = items.stream()
                .map(BudgetItem::getActualCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Map danh sách các hạng mục chi tiêu sang DTO
        List<BudgetItemResponse> categories = items.stream()
                .map(item -> BudgetItemResponse.builder()
                        .itemId(item.getId())
                        .categoryId(item.getCategory().getId())
                        .categoryName(item.getCategory().getName())
                        .estimatedCost(item.getEstimatedCost())
                        .actualCost(item.getActualCost())
                        .note(item.getNote())
                        .build())
                .collect(Collectors.toList());

        return BudgetResponse.builder()
                .totalBudget(totalBudget)
                .totalEstimated(totalEstimated)
                .totalActualSpent(totalActualSpent)
                .categories(categories)
                .build();
    }

    @Override
    @Transactional
    public BudgetItemResponse updateBudgetItem(Long itemId, UpdateBudgetItemRequest request, String email) {
        BudgetItem item = budgetItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng mục ngân sách có ID: " + itemId));

        // Xác thực người sở hữu kế hoạch đám cưới
        validateWeddingPlanOwner(item.getWeddingPlan().getId(), email);

        if (request.getEstimatedCost() != null) {
            item.setEstimatedCost(request.getEstimatedCost());
        }
        if (request.getActualCost() != null) {
            item.setActualCost(request.getActualCost());
        }
        if (request.getNote() != null) {
            item.setNote(request.getNote());
        }

        BudgetItem updatedItem = budgetItemRepository.save(item);

        return BudgetItemResponse.builder()
                .itemId(updatedItem.getId())
                .categoryId(updatedItem.getCategory().getId())
                .categoryName(updatedItem.getCategory().getName())
                .estimatedCost(updatedItem.getEstimatedCost())
                .actualCost(updatedItem.getActualCost())
                .note(updatedItem.getNote())
                .build();
    }

    private WeddingPlan validateWeddingPlanOwner(Long planId, String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        WeddingPlan plan = weddingPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Kế hoạch đám cưới"));
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền truy cập vào kế hoạch đám cưới này");
        }
        return plan;
    }
}
```

---

## BƯỚC 4: Viết REST Controller

### 4.1. Tạo mới [BudgetController.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/BudgetController.java)
Tạo endpoint tiếp nhận và trả dữ liệu trong thư mục `controller/`:

```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.request.UpdateBudgetItemRequest;
import com.fudn.planora.dto.response.BudgetItemResponse;
import com.fudn.planora.dto.response.BudgetResponse;
import com.fudn.planora.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/wedding-plans/{planId}/budget")
    public ResponseEntity<BudgetResponse> getBudget(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        BudgetResponse response = budgetService.getBudget(planId, email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/budget-items/{itemId}")
    public ResponseEntity<BudgetItemResponse> updateBudgetItem(
            @PathVariable Long itemId,
            @RequestBody UpdateBudgetItemRequest request,
            @AuthenticationPrincipal String email
    ) {
        BudgetItemResponse response = budgetService.updateBudgetItem(itemId, request, email);
        return ResponseEntity.ok(response);
    }
}
```

---

## BƯỚC 5: Hướng dẫn Test API chi tiết bằng Postman

### 5.1. Xem chi tiết ngân sách và phân bổ (Yêu cầu Token Đăng nhập)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/wedding-plans/1/budget`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Mô tả:** Trả về tổng ngân sách đám cưới, tổng ngân sách đã phân bổ, tổng thực chi và danh sách breakdown các hạng mục chi tiêu.

### 5.2. Cập nhật ước tính / thực chi hoặc ghi chú của một hạng mục (Yêu cầu Token Đăng nhập)
*   **Method:** `PUT`
*   **URL:** `http://localhost:8080/api/budget-items/1`
*   **Headers:** 
    *   `Authorization: Bearer <JWT_TOKEN>`
    *   `Content-Type: application/json`
*   **Body (JSON):**
    ```json
    {
      "estimatedCost": 120000000.00,
      "actualCost": 60000000.00,
      "note": "Đã thanh toán nốt 50% tiền mặt cho địa điểm"
    }
    ```
*   **Mô tả:** Cập nhật thông tin chi phí ước tính, chi phí thực tế đã thanh toán và ghi chú đi kèm của hạng mục có ID = 1.
