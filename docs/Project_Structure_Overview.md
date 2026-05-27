# Project Structure Overview

```plaintext
src/main/java/com/planora/
├── config/
├── controller/
├── service/
├── service/impl/
├── repository/
├── entity/
├── dto/
├── mapper/
├── security/
└── exception/
```

## 1. config/

Package này chứa toàn bộ class cấu hình của hệ thống.

### Responsibilities
- Cấu hình framework
- Khai báo Bean
- Cấu hình third-party service
- Cấu hình project-level behavior

### Common Components
- Swagger/OpenAPI Configuration
- CORS Configuration
- Jackson Configuration
- WebSocket Configuration
- Cloudinary Configuration
- Spring AI Configuration
- PayOS Configuration
- PasswordEncoder Bean
- Application-level Bean Configuration

### Example Structure

```plaintext
config/
├── SwaggerConfig.java
├── CorsConfig.java
├── WebSocketConfig.java
├── CloudinaryConfig.java
├── SecurityBeanConfig.java
└── OpenApiConfig.java
```

### Notes
Package này không nên chứa business logic.

---

## 2. controller/

Package này chứa toàn bộ REST API endpoint của hệ thống.

### Responsibilities
- Nhận HTTP request
- Validate request
- Gọi Service layer
- Trả HTTP response

### Common Components
- REST Controller
- API Endpoint
- Request Mapping
- ResponseEntity Handling

### Example Structure

```plaintext
controller/
├── AuthController.java
├── UserController.java
├── VendorController.java
├── PlanningController.java
├── InquiryController.java
└── AdminController.java
```

### Example Endpoint

```java
@PostMapping("/vendors")
public VendorResponse createVendor(
    @Valid @RequestBody VendorRequest request
)
```

### Notes
Controller nên mỏng và không nên:
- Xử lý business logic phức tạp
- Query database trực tiếp

---

## 3. service/

Package này chứa các interface của business logic.

### Responsibilities
- Tạo abstraction layer
- Hỗ trợ Dependency Injection
- Dễ mock khi testing
- Tách interface và implementation

### Example Structure

```plaintext
service/
├── AuthService.java
├── UserService.java
├── VendorService.java
├── PlanningService.java
└── InquiryService.java
```

### Example

```java
public interface VendorService {
    VendorResponse createVendor(VendorRequest request);
}
```

---

## 4. service/impl/

Package này chứa implementation thực tế của Service layer.

### Responsibilities
- Xử lý business logic
- Workflow handling
- Validation nghiệp vụ
- Transaction handling
- Matching algorithm
- Budget calculation

### Common Components
- Wedding planning logic
- Vendor matching logic
- Budget allocation
- AI orchestration
- Inquiry workflow
- Notification handling

### Example Structure

```plaintext
service/impl/
├── AuthServiceImpl.java
├── VendorServiceImpl.java
├── PlanningServiceImpl.java
└── MatchingServiceImpl.java
```

### Notes
Đây là package quan trọng nhất trong backend vì chứa phần lớn business logic của hệ thống.

---

## 5. repository/

Package này chứa Data Access Layer.

### Responsibilities
- Tương tác với database
- CRUD dữ liệu
- Query dữ liệu bằng JPA/Hibernate

### Technologies
- Spring Data JPA
- Hibernate

### Example Structure

```plaintext
repository/
├── UserRepository.java
├── VendorRepository.java
├── WeddingPlanRepository.java
└── InquiryRepository.java
```

### Example

```java
public interface VendorRepository
    extends JpaRepository<Vendor, Long> {

    List<Vendor> findByCity(String city);
}
```

### Notes
Repository không nên chứa business logic.

---

## 6. entity/

Package này chứa các entity mapping với database.

### Responsibilities
- Mapping object với database table
- Định nghĩa relationship giữa các bảng

### Common Components
- JPA Entity
- Table Mapping
- Relationship Annotation

### Example Structure

```plaintext
entity/
├── User.java
├── Vendor.java
├── WeddingPlan.java
├── BudgetItem.java
├── Inquiry.java
└── Role.java
```

### Example

```java
@Entity
@Table(name = "vendors")
```

### Notes
Entity không nên:
- Trả trực tiếp cho API response
- Chứa business logic phức tạp

---

## 7. dto/

DTO (Data Transfer Object) dùng để truyền dữ liệu giữa các layer.

### Responsibilities
- Request body
- Response body
- Tách entity khỏi API layer
- Bảo mật dữ liệu
- Chuẩn hóa response structure

### Example Structure

```plaintext
dto/
├── request/
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   └── CreateVendorRequest.java
│
├── response/
│   ├── AuthResponse.java
│   ├── VendorResponse.java
│   └── WeddingPlanResponse.java
```

### Benefits
- Không expose dữ liệu nhạy cảm
- Kiểm soát dữ liệu trả về
- Tách biệt database model và API model

---

## 8. mapper/

Package này chứa các class convert dữ liệu giữa Entity và DTO.

### Responsibilities
- Convert Entity → DTO
- Convert DTO → Entity

### Example Structure

```plaintext
mapper/
├── UserMapper.java
├── VendorMapper.java
└── WeddingPlanMapper.java
```

### Example

```java
VendorResponse toResponse(Vendor vendor)
```

### Recommended Technologies
- MapStruct
- ModelMapper
- Manual Mapping

### Recommendation
MapStruct phù hợp hơn cho enterprise project vì:
- Compile-time safe
- Performance tốt
- Clean architecture

---

## 9. security/

Package này chứa toàn bộ logic bảo mật hệ thống.

### Responsibilities
- Authentication
- Authorization
- JWT handling
- OAuth2 integration
- Security filter chain

### Example Structure

```plaintext
security/
├── jwt/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtEntryPoint.java
│
├── oauth2/
│   ├── OAuth2SuccessHandler.java
│   └── CustomOAuth2UserService.java
│
├── CustomUserDetailsService.java
├── SecurityConfig.java
└── SecurityConstants.java
```

### Common Components
- JWT Token
- Login Authentication
- Role-based Access Control
- OAuth2 Login
- Password Encoding

---

## 10. exception/

Package này chứa custom exception và global error handling.

### Responsibilities
- Xử lý lỗi tập trung
- Chuẩn hóa API error response
- Tạo custom exception

### Example Structure

```plaintext
exception/
├── GlobalExceptionHandler.java
├── ResourceNotFoundException.java
├── UnauthorizedException.java
├── BusinessException.java
└── ErrorResponse.java
```

### Example

```java
throw new ResourceNotFoundException("Vendor not found");
```

### Global Exception Handler

```java
@RestControllerAdvice
```

### Benefits
- Response lỗi đồng nhất
- Dễ debug
- Clean API response

---

# Suggested Future Packages

Khi hệ thống mở rộng, nên bổ sung thêm các package sau:

```plaintext
├── common/
├── util/
├── enums/
├── validator/
├── event/
├── scheduler/
├── websocket/
├── ai/
├── payment/
├── notification/
├── constant/
```

## Important Future Modules

### notification/
Chứa:
- Email service
- Push notification
- WebSocket notification

### ai/
Chứa:
- Prompt templates
- Recommendation engine
- Wedding concept generator

### payment/
Chứa:
- PayOS integration
- Transaction handling
- Webhook verification

### websocket/
Chứa:
- Realtime inquiry
- Vendor notification
- Chat event handling

---

# Architecture Summary

Kiến trúc hiện tại phù hợp với:
- Spring Boot RESTful API
- Marketplace architecture
- Scalable monolith
- MVP startup product
- Enterprise-ready backend structure

Kiến trúc này giúp:
- Tách biệt trách nhiệm rõ ràng
- Dễ maintain
- Dễ test
- Dễ mở rộng
- Hỗ trợ teamwork hiệu quả

Phù hợp với định hướng phát triển của dự án Planora wedding planning marketplace.