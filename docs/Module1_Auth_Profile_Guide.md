# Hướng dẫn Xây dựng API - Module 1: Authentication & User Profile

Tài liệu này hướng dẫn chi tiết từng bước (kèm code mẫu chuẩn Spring Boot) để bạn tự tay xây dựng cụm API cho **Module 1 (Đăng ký tài khoản & Quản lý Hồ sơ cá nhân)** trong dự án Planora.

---

## 1. Các bước thực hiện tổng quan
1.  **Bước 1:** Hoàn thiện JPA Entity cho Địa chỉ người dùng (`UserAddress`) và ánh xạ quan hệ trong `User`.
2.  **Bước 2:** Tạo các Lớp truyền dữ liệu (DTO - Data Transfer Object) cho Request và Response.
3.  **Bước 3:** Tạo Repository cho thực thể `UserAddress`.
4.  **Bước 4:** Cấu hình bảo mật (`SecurityConfig`) cho phép truy cập Public vào API đăng ký.
5.  **Bước 5:** Cập nhật Service Layer (`AuthService` và viết thêm `UserService`).
6.  **Bước 6:** Viết các Rest Controllers (`AuthController` và `UserController`).

---

## BƯỚC 1: Hoàn thiện JPA Entity `UserAddress` & Ánh xạ `User`

Trong database (xem `V1__init_schema.sql`), bảng `user_addresses` liên kết khóa ngoại với bảng `users` qua cột `user_id`. Ở đây, ta sẽ thiết lập quan hệ **Một - Một (One-to-One)**.

### 1.1. Cập nhật file `UserAddress.java`
Bạn mở file [UserAddress.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/UserAddress.java) và thay thế nội dung bằng code dưới đây:

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String city;
    private String district;
    private String ward;

    @Column(name = "detail_address")
    private String detailAddress;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.2. Thêm liên kết Address vào `User.java`
Mở file [User.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/User.java), thêm trường `address` để thiết lập quan hệ hai chiều:

```java
    // Thêm vào trong class User
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserAddress address;
```

---

## BƯỚC 2: Tạo các lớp DTO (Data Transfer Object)

Các DTO này nằm trong các folder con của `dto/` tương ứng.

### 2.1. Request Đăng ký: `RegisterRequest.java`
Tạo mới file `RegisterRequest.java` trong thư mục [dto/request](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request):

```java
package com.fudn.planora.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự trở lên")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullname;

    private String phone;

    @NotBlank(message = "Vai trò (role) không được để trống")
    private String role; // "USER" hoặc "VENDOR"
}
```

### 2.2. Request Cập nhật Profile: `UpdateProfileRequest.java` và `AddressDto.java`
Tạo mới các DTO sau để nhận dữ liệu cập nhật từ Client.

1.  Tạo `AddressDto.java` trong thư mục [dto/request](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request) (hoặc một thư mục dùng chung):
    ```java
    package com.fudn.planora.dto.request;

    import lombok.Getter;
    import lombok.Setter;

    @Getter
    @Setter
    public class AddressDto {
        private String city;
        private String district;
        private String ward;
        private String detailAddress;
    }
    ```

2.  Tạo `UpdateProfileRequest.java` trong thư mục [dto/request](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request):
    ```java
    package com.fudn.planora.dto.request;

    import lombok.Getter;
    import lombok.Setter;

    @Getter
    @Setter
    public class UpdateProfileRequest {
        private String fullname;
        private String phone;
        private String avatarUrl;
        private AddressDto address;
    }
    ```

### 2.3. Response thông tin Profile: `UserProfileResponse.java`
Tạo mới file `UserProfileResponse.java` trong thư mục [dto/response](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response) để trả về client một cách an toàn (tránh lộ trường `password`):

```java
package com.fudn.planora.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullname;
    private String phone;
    private String avatarUrl;
    private String role;
    private String provider;
    private String status;
    private AddressResponse address;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressResponse {
        private String city;
        private String district;
        private String ward;
        private String detailAddress;
    }
}
```

---

## BƯỚC 3: Tạo Repository cho Address

Tạo mới interface `UserAddressRepository.java` trong thư mục [repository](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository):

```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    Optional<UserAddress> findByUserId(Long userId);
}
```

---

## BƯỚC 4: Cập nhật Cấu hình Bảo mật `SecurityConfig`

Chúng ta cần cấu hình để endpoint Đăng ký (`/api/auth/register`) có thể được gọi mà không cần kèm theo JWT Token.

Mở file [SecurityConfig.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/config/SecurityConfig.java) và thêm dòng requestMatchers permit cho đăng ký:

```diff
                 .authorizeHttpRequests(auth -> auth
                         .requestMatchers("/api/auth/login").permitAll()
                         .requestMatchers("/api/auth/logout").permitAll()
                         .requestMatchers("/api/auth/google").permitAll()
+                        .requestMatchers("/api/auth/register").permitAll()
                         .anyRequest().authenticated()
                 );
```

---

## BƯỚC 5: Phát triển Service Layer

### 5.1. Bổ sung chức năng Đăng ký vào `AuthService`
1.  Mở [AuthService.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/AuthService.java), thêm method:
    ```java
    LoginResponse register(RegisterRequest request);
    ```

2.  Mở [AuthServiceImpl.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl/AuthServiceImpl.java) để viết implementation. Chú ý logic kiểm tra email trùng, mã hóa mật khẩu bằng BCrypt, và tạo tài khoản mặc định (gán Role).
    ```java
    // import com.fudn.planora.dto.request.RegisterRequest;
    // import org.springframework.transaction.annotation.Transactional;

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // 1. Kiểm tra xem Email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống!");
        }

        // 2. Tìm Role tương ứng từ Request (USER hoặc VENDOR)
        ERole roleEnum;
        try {
            roleEnum = ERole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Vai trò không hợp lệ. Chỉ chấp nhận USER hoặc VENDOR.");
        }

        Role role = roleRepository.findByRoleName(roleEnum)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Role " + roleEnum));

        // 3. Tạo mới thực thể User
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Mã hóa
                .fullname(request.getFullname())
                .phone(request.getPhone())
                .role(role)
                .eUserProvider(EUserProvider.LOCAL)
                .eUserStatus(EUserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        // Nếu role đăng ký là VENDOR, ta có thể tự động tạo một bản ghi Vendor rỗng tương ứng
        if (roleEnum == ERole.VENDOR) {
            // import com.fudn.planora.repository.VendorRepository; (Inject thêm vendorRepository vào service)
            // Vendor vendor = Vendor.builder().user(user).businessName(user.getFullname()).build();
            // vendorRepository.save(vendor);
        }

        // 4. Sinh và trả về Token để Frontend tự động Login
        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, "Bearer");
    }
    ```

### 5.2. Tạo `UserService` và `UserServiceImpl` xử lý Profile
Chúng ta tạo mới tầng Service để thao tác lấy thông tin và cập nhật Profile.

1.  Tạo interface `UserService.java` trong thư mục [service](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service):
    ```java
    package com.fudn.planora.service;

    import com.fudn.planora.dto.request.UpdateProfileRequest;
    import com.fudn.planora.dto.response.UserProfileResponse;

    public interface UserService {
        UserProfileResponse getUserProfile(String email);
        UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
    }
    ```

2.  Tạo lớp `UserServiceImpl.java` trong thư mục [service/impl](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl):
    ```java
    package com.fudn.planora.service.impl;

    import com.fudn.planora.dto.request.AddressDto;
    import com.fudn.planora.dto.request.UpdateProfileRequest;
    import com.fudn.planora.dto.response.UserProfileResponse;
    import com.fudn.planora.entity.User;
    import com.fudn.planora.entity.UserAddress;
    import com.fudn.planora.repository.UserAddressRepository;
    import com.fudn.planora.repository.UserRepository;
    import com.fudn.planora.service.UserService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    @Service
    @RequiredArgsConstructor
    public class UserServiceImpl implements UserService {

        private final UserRepository userRepository;
        private final UserAddressRepository addressRepository;

        @Override
        public UserProfileResponse getUserProfile(String email) {
            User user = userRepository.findUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            return mapToResponse(user);
        }

        @Override
        @Transactional
        public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
            User user = userRepository.findUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Cập nhật thông tin cơ bản
            if (request.getFullname() != null) user.setFullname(request.getFullname());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

            // Cập nhật Địa chỉ nếu có gửi
            if (request.getAddress() != null) {
                AddressDto addrDto = request.getAddress();
                UserAddress address = user.getAddress();
                
                if (address == null) {
                    address = UserAddress.builder().user(user).build();
                }
                
                address.setCity(addrDto.getCity());
                address.setDistrict(addrDto.getDistrict());
                address.setWard(addrDto.getWard());
                address.setDetailAddress(addrDto.getDetailAddress());
                
                addressRepository.save(address);
                user.setAddress(address);
            }

            User savedUser = userRepository.save(user);
            return mapToResponse(savedUser);
        }

        // Helper mapper thủ công (có thể thay thế bằng MapStruct sau này)
        private UserProfileResponse mapToResponse(User user) {
            UserProfileResponse.AddressResponse addrResp = null;
            if (user.getAddress() != null) {
                UserAddress address = user.getAddress();
                addrResp = UserProfileResponse.AddressResponse.builder()
                        .city(address.getCity())
                        .district(address.getDistrict())
                        .ward(address.getWard())
                        .detailAddress(address.getDetailAddress())
                        .build();
            }

            return UserProfileResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullname(user.getFullname())
                    .phone(user.getPhone())
                    .avatarUrl(user.getAvatarUrl())
                    .role(user.getRole().getRoleName().name())
                    .provider(user.getEUserProvider().name())
                    .status(user.getEUserStatus().name())
                    .address(addrResp)
                    .build();
        }
    }
    ```

---

## BƯỚC 6: Viết Rest Controllers

### 6.1. Thêm API Đăng ký vào `AuthController`
Mở file [AuthController.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/AuthController.java) và tích hợp phương thức `register`:

```diff
+import com.fudn.planora.dto.request.RegisterRequest;

...

     @PostMapping("/google")
     public LoginResponse loginWithGoogle(@RequestBody @Valid GoogleLoginRequest googleLoginRequest) {
         return authService.loginWithGoogle(googleLoginRequest);
     }
+
+    @PostMapping("/register")
+    public LoginResponse register(@RequestBody @Valid RegisterRequest request) {
+        return authService.register(request);
+    }
 }
```

### 6.2. Tạo `UserController` cho thông tin cá nhân (Profile)
Tạo mới file `UserController.java` trong thư mục [controller](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller):

```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.request.UpdateProfileRequest;
import com.fudn.planora.dto.response.UserProfileResponse;
import com.fudn.planora.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public UserProfileResponse getMyProfile() {
        String email = getLoggedInUserEmail();
        return userService.getUserProfile(email);
    }

    @PutMapping("/profile")
    public UserProfileResponse updateMyProfile(@RequestBody @Valid UpdateProfileRequest request) {
        String email = getLoggedInUserEmail();
        return userService.updateProfile(email, request);
    }

    // Lấy thông tin email từ JWT Token được Spring Security tự động giải mã
    private String getLoggedInUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName(); // Trả về email (hoặc username) lưu trong SecurityContext
        }
        throw new RuntimeException("Người dùng chưa được xác thực");
    }
}
```

---

## 5. Tổng kết & Cách Test API

Sau khi viết xong các lớp trên, bạn hãy chạy dự án Spring Boot (hoặc sử dụng lệnh `./mvnw spring-boot:run`).

1.  **Test API Register (`POST /api/auth/register`):**
    *   Sử dụng Postman gửi request không kèm Token.
    *   Nhận về JWT Token.
2.  **Test API Profile (`GET /api/users/profile` & `PUT /api/users/profile`):**
    *   Đính kèm Token vào Header: `Authorization: Bearer <token_nhan_duoc>`.
    *   Kiểm tra lấy thông tin cá nhân và cập nhật thêm thông tin địa chỉ (sẽ tự động tạo bản ghi trong bảng `user_addresses`).
