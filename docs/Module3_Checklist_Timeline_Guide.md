# Hướng dẫn Xây dựng API - Module 3: Checklist & Timeline Management

Tài liệu này hướng dẫn chi tiết từng bước (kèm code mẫu chuẩn Spring Boot) để bạn tự tay xây dựng cụm API cho **Module 3 (Quản lý Checklist nhiệm vụ & Dòng thời gian Timeline)** trong dự án Planora.

---

## 1. Các bước thực hiện tổng quan
1.  **Bước 1:** Cập nhật Repository Layer (`ChecklistTaskRepository` và `TimelineEventRepository`).
2.  **Bước 2:** Tạo các lớp truyền dữ liệu (DTO - Data Transfer Object) cho Request và Response.
3.  **Bước 3:** Xây dựng tầng Service (`ChecklistService` và `TimelineService` cùng các class Implementation tương ứng).
4.  **Bước 4:** Viết các REST Controllers (`ChecklistController` và `TimelineController`).
5.  **Bước 5:** Hướng dẫn Test API chi tiết bằng Postman.

---

## BƯỚC 1: Cập nhật Repository Layer

Hai thực thể [ChecklistTask.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/ChecklistTask.java) và [TimelineEvent.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/TimelineEvent.java) đã được ánh xạ sẵn với database. Chúng ta cần định nghĩa thêm các phương thức tìm kiếm theo `wedding_plan_id` và sắp xếp dữ liệu.

### 1.1. Cập nhật [ChecklistTaskRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/ChecklistTaskRepository.java)
Mở file [ChecklistTaskRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/ChecklistTaskRepository.java) và thêm phương thức truy vấn danh sách công việc của kế hoạch cưới, sắp xếp theo hạn chót (`dueDate`):

```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.ChecklistTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChecklistTaskRepository extends JpaRepository<ChecklistTask, Long> {
    List<ChecklistTask> findByWeddingPlanIdOrderByDueDateAsc(Long weddingPlanId);
}
```

### 1.2. Cập nhật [TimelineEventRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/TimelineEventRepository.java)
Mở file [TimelineEventRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/TimelineEventRepository.java) và định nghĩa phương thức lấy các mốc sự kiện của dòng thời gian sắp xếp theo thứ tự ngày diễn ra (`eventDate`):

```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimelineEventRepository extends JpaRepository<TimelineEvent, Long> {
    List<TimelineEvent> findByWeddingPlanIdOrderByEventDateAsc(Long weddingPlanId);
}
```

---

## BƯỚC 2: Tạo các lớp DTO (Data Transfer Object)

Các DTO này phục vụ việc nhận dữ liệu từ client gửi lên và trả về dữ liệu chuẩn hóa cho client.

### 2.1. Request tạo công việc mới: `CreateTaskRequest.java`
Tạo mới file `CreateTaskRequest.java` trong thư mục [dto/request](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request):

```java
package com.fudn.planora.dto.request;

import com.fudn.planora.enums.EChecklistTaskPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class CreateTaskRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    private LocalDate dueDate;

    private EChecklistTaskPriority priority; // Mặc định là MEDIUM nếu null
}
```

### 2.2. Request cập nhật công việc: `UpdateTaskRequest.java`
Tạo mới file `UpdateTaskRequest.java` trong thư mục [dto/request](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request):

```java
package com.fudn.planora.dto.request;

import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class UpdateTaskRequest {
    private String title;
    private String description;
    private LocalDate dueDate;
    private EChecklistTaskStatus status; // TODO, IN_PROGRESS, DONE
    private EChecklistTaskPriority priority; // LOW, MEDIUM, HIGH
}
```

### 2.3. Response thông tin công việc: `TaskResponse.java`
Tạo mới file `TaskResponse.java` trong thư mục [dto/response](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):

```java
package com.fudn.planora.dto.response;

import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    private Long id;
    private Long weddingPlanId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private EChecklistTaskStatus status;
    private EChecklistTaskPriority priority;
    private LocalDateTime createdAt;
}
```

### 2.4. Request tạo/cập nhật sự kiện dòng thời gian: `CreateEventRequest.java` và `UpdateEventRequest.java`
1.  Tạo `CreateEventRequest.java` trong thư mục [dto/request](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request):
    ```java
    package com.fudn.planora.dto.request;

    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.NotNull;
    import lombok.Getter;
    import lombok.Setter;
    import java.time.LocalDateTime;

    @Getter
    @Setter
    public class CreateEventRequest {
        @NotBlank(message = "Tiêu đề sự kiện không được để trống")
        private String title;

        private String description;

        @NotNull(message = "Thời gian diễn ra không được để trống")
        private LocalDateTime eventDate;
    }
    ```

2.  Tạo `UpdateEventRequest.java` trong thư mục [dto/request](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request):
    ```java
    package com.fudn.planora.dto.request;

    import lombok.Getter;
    import lombok.Setter;
    import java.time.LocalDateTime;

    @Getter
    @Setter
    public class UpdateEventRequest {
        private String title;
        private String description;
        private LocalDateTime eventDate;
    }
    ```

### 2.5. Response thông tin sự kiện Timeline: `EventResponse.java`
Tạo mới file `EventResponse.java` trong thư mục [dto/response](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):

```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {
    private Long id;
    private Long weddingPlanId;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private LocalDateTime createdAt;
}
```

---

## BƯỚC 3: Xây dựng Tầng Service Layer

Tầng Service chịu trách nhiệm xử lý logic nghiệp vụ, liên kết DTO với Entity thông qua các Repository.

### 3.1. Thiết lập Interface & Implementation cho Checklist

1.  Tạo interface [ChecklistService.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/ChecklistService.java) trong thư mục `service/`:
    ```java
    package com.fudn.planora.service;

    import com.fudn.planora.dto.request.CreateTaskRequest;
    import com.fudn.planora.dto.request.UpdateTaskRequest;
    import com.fudn.planora.dto.response.TaskResponse;
    import java.util.List;

    public interface ChecklistService {
        List<TaskResponse> getChecklistByPlan(Long planId);
        TaskResponse createTask(Long planId, CreateTaskRequest request);
        TaskResponse updateTask(Long taskId, UpdateTaskRequest request);
        void deleteTask(Long taskId);
    }
    ```

2.  Tạo class implementation [ChecklistServiceImpl.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl/ChecklistServiceImpl.java) trong thư mục `service/impl/`:
    ```java
    package com.fudn.planora.service.impl;

    import com.fudn.planora.dto.request.CreateTaskRequest;
    import com.fudn.planora.dto.request.UpdateTaskRequest;
    import com.fudn.planora.dto.response.TaskResponse;
    import com.fudn.planora.entity.ChecklistTask;
    import com.fudn.planora.entity.WeddingPlan;
    import com.fudn.planora.enums.EChecklistTaskPriority;
    import com.fudn.planora.enums.EChecklistTaskStatus;
    import com.fudn.planora.repository.ChecklistTaskRepository;
    import com.fudn.planora.repository.WeddingPlanRepository;
    import com.fudn.planora.service.ChecklistService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    import java.util.List;
    import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    public class ChecklistServiceImpl implements ChecklistService {

        private final ChecklistTaskRepository taskRepository;
        private final WeddingPlanRepository planRepository;

        @Override
        public List<TaskResponse> getChecklistByPlan(Long planId) {
            // Đảm bảo plan tồn tại
            if (!planRepository.existsById(planId)) {
                throw new RuntimeException("Không tìm thấy kế hoạch đám cưới có ID: " + planId);
            }
            return taskRepository.findByWeddingPlanIdOrderByDueDateAsc(planId)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public TaskResponse createTask(Long planId, CreateTaskRequest request) {
            WeddingPlan plan = planRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch đám cưới"));

            ChecklistTask task = ChecklistTask.builder()
                    .weddingPlan(plan)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .dueDate(request.getDueDate())
                    .status(EChecklistTaskStatus.TODO)
                    .priority(request.getPriority() != null ? request.getPriority() : EChecklistTaskPriority.MEDIUM)
                    .build();

            ChecklistTask savedTask = taskRepository.save(task);
            return mapToResponse(savedTask);
        }

        @Override
        @Transactional
        public TaskResponse updateTask(Long taskId, UpdateTaskRequest request) {
            ChecklistTask task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc cần cập nhật"));

            if (request.getTitle() != null) task.setTitle(request.getTitle());
            if (request.getDescription() != null) task.setDescription(request.getDescription());
            if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
            if (request.getStatus() != null) task.setStatus(request.getStatus());
            if (request.getPriority() != null) task.setPriority(request.getPriority());

            ChecklistTask updatedTask = taskRepository.save(task);
            return mapToResponse(updatedTask);
        }

        @Override
        @Transactional
        public void deleteTask(Long taskId) {
            if (!taskRepository.existsById(taskId)) {
                throw new RuntimeException("Không tìm thấy công việc cần xóa");
            }
            taskRepository.deleteById(taskId);
        }

        private TaskResponse mapToResponse(ChecklistTask task) {
            return TaskResponse.builder()
                    .id(task.getId())
                    .weddingPlanId(task.getWeddingPlan().getId())
                    .title(task.getTitle())
                    .description(task.getDescription())
                    .dueDate(task.getDueDate())
                    .status(task.getStatus())
                    .priority(task.getPriority())
                    .createdAt(task.getCreatedAt())
                    .build();
        }
    }
    ```

### 3.2. Thiết lập Interface & Implementation cho Timeline

1.  Tạo interface [TimelineService.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/TimelineService.java) trong thư mục `service/`:
    ```java
    package com.fudn.planora.service;

    import com.fudn.planora.dto.request.CreateEventRequest;
    import com.fudn.planora.dto.request.UpdateEventRequest;
    import com.fudn.planora.dto.response.EventResponse;
    import java.util.List;

    public interface TimelineService {
        List<EventResponse> getTimelineByPlan(Long planId);
        EventResponse createEvent(Long planId, CreateEventRequest request);
        EventResponse updateEvent(Long eventId, UpdateEventRequest request);
        void deleteEvent(Long eventId);
    }
    ```

2.  Tạo class implementation [TimelineServiceImpl.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl/TimelineServiceImpl.java) trong thư mục `service/impl/`:
    ```java
    package com.fudn.planora.service.impl;

    import com.fudn.planora.dto.request.CreateEventRequest;
    import com.fudn.planora.dto.request.UpdateEventRequest;
    import com.fudn.planora.dto.response.EventResponse;
    import com.fudn.planora.entity.TimelineEvent;
    import com.fudn.planora.entity.WeddingPlan;
    import com.fudn.planora.repository.TimelineEventRepository;
    import com.fudn.planora.repository.WeddingPlanRepository;
    import com.fudn.planora.service.TimelineService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    import java.util.List;
    import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    public class TimelineServiceImpl implements TimelineService {

        private final TimelineEventRepository eventRepository;
        private final WeddingPlanRepository planRepository;

        @Override
        public List<EventResponse> getTimelineByPlan(Long planId) {
            if (!planRepository.existsById(planId)) {
                throw new RuntimeException("Không tìm thấy kế hoạch đám cưới có ID: " + planId);
            }
            return eventRepository.findByWeddingPlanIdOrderByEventDateAsc(planId)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public EventResponse createEvent(Long planId, CreateEventRequest request) {
            WeddingPlan plan = planRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch đám cưới"));

            TimelineEvent event = TimelineEvent.builder()
                    .weddingPlan(plan)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .eventDate(request.getEventDate())
                    .build();

            TimelineEvent savedEvent = eventRepository.save(event);
            return mapToResponse(savedEvent);
        }

        @Override
        @Transactional
        public EventResponse updateEvent(Long eventId, UpdateEventRequest request) {
            TimelineEvent event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mốc thời gian cần cập nhật"));

            if (request.getTitle() != null) event.setTitle(request.getTitle());
            if (request.getDescription() != null) event.setDescription(request.getDescription());
            if (request.getEventDate() != null) event.setEventDate(request.getEventDate());

            TimelineEvent updatedEvent = eventRepository.save(event);
            return mapToResponse(updatedEvent);
        }

        @Override
        @Transactional
        public void deleteEvent(Long eventId) {
            if (!eventRepository.existsById(eventId)) {
                throw new RuntimeException("Không tìm thấy mốc thời gian cần xóa");
            }
            eventRepository.deleteById(eventId);
        }

        private EventResponse mapToResponse(TimelineEvent event) {
            return EventResponse.builder()
                    .id(event.getId())
                    .weddingPlanId(event.getWeddingPlan().getId())
                    .title(event.getTitle())
                    .description(event.getDescription())
                    .eventDate(event.getEventDate())
                    .createdAt(event.getCreatedAt())
                    .build();
        }
    }
    ```

---

## BƯỚC 4: Viết Rest Controllers

Rest Controllers cung cấp các endpoints và xử lý các tham số được gửi từ client thông qua HTTP. Các Rest Controllers này sẽ sử dụng cơ chế bảo mật (JWT) mặc định của hệ thống.

### 4.1. Tạo mới [ChecklistController.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/ChecklistController.java)
Tạo tệp này trong thư mục `controller/`:

```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.request.CreateTaskRequest;
import com.fudn.planora.dto.request.UpdateTaskRequest;
import com.fudn.planora.dto.response.TaskResponse;
import com.fudn.planora.service.ChecklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;

    // 1. Lấy danh sách Checklist nhiệm vụ
    @GetMapping("/wedding-plans/{planId}/checklist")
    public List<TaskResponse> getChecklist(@PathVariable Long planId) {
        return checklistService.getChecklistByPlan(planId);
    }

    // 2. Tạo công việc mới (Custom Task)
    @PostMapping("/wedding-plans/{planId}/checklist")
    public TaskResponse createTask(
            @PathVariable Long planId,
            @RequestBody @Valid CreateTaskRequest request) {
        return checklistService.createTask(planId, request);
    }

    // 3. Cập nhật trạng thái/thông tin công việc
    @PutMapping("/checklist-tasks/{taskId}")
    public TaskResponse updateTask(
            @PathVariable Long taskId,
            @RequestBody @Valid UpdateTaskRequest request) {
        return checklistService.updateTask(taskId, request);
    }

    // 4. Xóa công việc
    @DeleteMapping("/checklist-tasks/{taskId}")
    public String deleteTask(@PathVariable Long taskId) {
        checklistService.deleteTask(taskId);
        return "Xóa công việc thành công!";
    }
}
```

### 4.2. Tạo mới [TimelineController.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/TimelineController.java)
Tạo tệp này trong thư mục `controller/`:

```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.request.CreateEventRequest;
import com.fudn.planora.dto.request.UpdateEventRequest;
import com.fudn.planora.dto.response.EventResponse;
import com.fudn.planora.service.TimelineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    // 5. Lấy dòng thời gian đám cưới (Timeline)
    @GetMapping("/wedding-plans/{planId}/timeline")
    public List<EventResponse> getTimeline(@PathVariable Long planId) {
        return timelineService.getTimelineByPlan(planId);
    }

    // 6. Thêm mốc thời gian
    @PostMapping("/wedding-plans/{planId}/timeline")
    public EventResponse createEvent(
            @PathVariable Long planId,
            @RequestBody @Valid CreateEventRequest request) {
        return timelineService.createEvent(planId, request);
    }

    // 7. Sửa thông tin mốc thời gian
    @PutMapping("/timeline-events/{eventId}")
    public EventResponse updateEvent(
            @PathVariable Long eventId,
            @RequestBody @Valid UpdateEventRequest request) {
        return timelineService.updateEvent(eventId, request);
    }

    // 8. Xóa mốc thời gian
    @DeleteMapping("/timeline-events/{eventId}")
    public String deleteEvent(@PathVariable Long eventId) {
        timelineService.deleteEvent(eventId);
        return "Xóa mốc thời gian thành công!";
    }
}
```

---

## BƯỚC 5: Hướng dẫn Test API bằng Postman

Do các API trên đều nằm dưới phân quyền bảo mật, bạn cần gửi một **Bearer Token** hợp lệ trong Header `Authorization` khi thực hiện các yêu cầu.

### 5.1. Test Cụm API Checklist

1.  **Lấy danh sách nhiệm vụ**
    *   **Method**: `GET`
    *   **URL**: `http://localhost:8080/api/wedding-plans/{planId}/checklist`
    *   **Headers**: `Authorization: Bearer <token_nhan_duoc_khi_login>`
    *   **Response mẫu**: Trả về mảng JSON các tasks sắp xếp theo `due_date`.

2.  **Tạo một công việc tùy chọn (Custom Task)**
    *   **Method**: `POST`
    *   **URL**: `http://localhost:8080/api/wedding-plans/{planId}/checklist`
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Body** (JSON):
        ```json
        {
          "title": "Đặt cọc nhà hàng tiệc cưới",
          "description": "Thanh toán 20.000.000đ đợt 1 tại White Palace",
          "dueDate": "2026-08-15",
          "priority": "HIGH"
        }
        ```

3.  **Cập nhật thông tin/trạng thái công việc**
    *   **Method**: `PUT`
    *   **URL**: `http://localhost:8080/api/checklist-tasks/{taskId}`
    *   **Body** (JSON):
        ```json
        {
          "status": "IN_PROGRESS",
          "priority": "HIGH"
        }
        ```

4.  **Xóa một công việc**
    *   **Method**: `DELETE`
    *   **URL**: `http://localhost:8080/api/checklist-tasks/{taskId}`

### 5.2. Test Cụm API Timeline

1.  **Lấy dòng thời gian đám cưới**
    *   **Method**: `GET`
    *   **URL**: `http://localhost:8080/api/wedding-plans/{planId}/timeline`

2.  **Tạo một mốc sự kiện mới**
    *   **Method**: `POST`
    *   **URL**: `http://localhost:8080/api/wedding-plans/{planId}/timeline`
    *   **Body** (JSON):
        ```json
        {
          "title": "Đón dâu",
          "description": "Nhà trai xuất phát từ Cầu Giấy sang Long Biên",
          "eventDate": "2026-10-10T07:30:00"
        }
        ```

3.  **Sửa đổi mốc sự kiện**
    *   **Method**: `PUT`
    *   **URL**: `http://localhost:8080/api/timeline-events/{eventId}`
    *   **Body** (JSON):
        ```json
        {
          "title": "Đón dâu (Thời gian mới)",
          "eventDate": "2026-10-10T08:00:00"
        }
        ```

4.  **Xóa mốc sự kiện**
    *   **Method**: `DELETE`
    *   **URL**: `http://localhost:8080/api/timeline-events/{eventId}`
