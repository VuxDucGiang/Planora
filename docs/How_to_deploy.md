# Hướng dẫn triển khai dự án Planora (Aiven + Koyeb + Vercel + Cloudinary)

Tài liệu này hướng dẫn chi tiết các bước thiết lập và deploy toàn bộ hệ thống Planora lên các nền tảng đám mây miễn phí tốt nhất hiện nay bao gồm:
*   **Database (MySQL)**: Aiven.io
*   **Storage (Image/Video)**: Cloudinary
*   **Backend (Spring Boot)**: Koyeb
*   **Frontend (Next.js)**: Vercel

---

## 1. Cấu hình Database MySQL trên Aiven.io

1. Truy cập [Aiven.io](https://aiven.io) và đăng ký một tài khoản miễn phí.
2. Tạo dịch vụ mới (**Create Service**):
   * **Service Type**: Chọn **MySQL**.
   * **Cloud Provider & Region**: Chọn **AWS** hoặc **GCP**, khu vực **Singapore (ap-southeast-1)** (hoặc khu vực gần Việt Nam nhất) để tối ưu hóa độ trễ đường truyền.
   * **Service Plan**: Chọn **Free** (Miễn phí).
   * **Service name**: Đặt tên gợi nhớ (ví dụ: `mysql-planora`).
3. Nhấn **Create Service** và chờ khoảng 3-5 phút để trạng thái của máy chủ chuyển sang **Running**.
4. Tại tab **Overview**, kéo xuống mục **Connection information** và sao chép các thông số sau:
   * **Host**: (Ví dụ: `mysql-planora-xxxxx.aivencloud.com`)
   * **Port**: Cổng kết nối (thường là `26265` trở lên)
   * **User**: `avnadmin`
   * **Password**: Mật khẩu ngẫu nhiên được cấp
   * **Database**: Tên DB mặc định là `defaultdb`.

---

## 2. Cấu hình Storage trên Cloudinary

1. Đăng ký tài khoản miễn phí tại [Cloudinary.com](https://cloudinary.com).
2. Sau khi đăng nhập thành công, tại màn hình **Dashboard** chính, lưu lại các thông tin cấu hình tại mục **Product Environment Credentials**:
   * **Cloud Name**
   * **API Key**
   * **API Secret**

---

## 3. Triển khai Backend Spring Boot lên Koyeb

Koyeb hỗ trợ deploy trực tiếp từ mã nguồn GitHub của bạn và tự động lắng nghe thay đổi để tự động build lại (Auto Deploy).

### 3.1 Cấu hình Environment Variables trên Koyeb
Đăng nhập vào [Koyeb.com](https://www.koyeb.com) bằng tài khoản GitHub, nhấn **Create Service** -> Chọn **GitHub** -> Chọn Repo **Planora** và thiết lập:

*   **App Directory**: Điền `planora-backend` (Koyeb sẽ trỏ trực tiếp vào thư mục con chứa Backend).
*   **Build & Run Settings**: Giữ nguyên chế độ mặc định (**Buildpack**). Koyeb tự động nhận diện Java 21 từ `pom.xml`.
*   **Environment Variables**: Thêm đầy đủ các biến môi trường sau:

| Tên biến môi trường | Giá trị mẫu/Mô tả |
| :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://<HOST_AIVEN>:<PORT_AIVEN>/defaultdb?ssl-mode=REQUIRED` *(Thay thế Host và Port từ Aiven, bắt buộc có `ssl-mode=REQUIRED`)* |
| `SPRING_DATASOURCE_USERNAME` | `avnadmin` |
| `SPRING_DATASOURCE_PASSWORD` | `<PASSWORD_AIVEN>` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `none` *(Bảng sẽ được quản lý bởi Flyway)* |
| `SPRING_FLYWAY_ENABLED` | `true` |
| `APP_JWT_SECRET` | `<KHÓA_BẢO_MẬT_JWT_CỦA_BẠN>` |
| `APP_JWT_EXPIRATION` | `86400000` |
| `GOOGLE_CLIENT_ID` | `<GOOGLE_CLIENT_ID>` |
| `CLOUDINARY_CLOUD_NAME` | `<CLOUD_NAME_CỦA_BẠN>` |
| `CLOUDINARY_API_KEY` | `<API_KEY_CỦA_BẠN>` |
| `CLOUDINARY_API_SECRET` | `<API_SECRET_CỦA_BẠN>` |
| `JAVA_TOOL_OPTIONS` | `-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC` *(Cực kỳ quan trọng để giới hạn RAM của Java dưới 512MB RAM của gói Koyeb Free)* |

Nhấn **Deploy** và đợi Koyeb hoàn tất quá trình build. Sau khi thành công, sao chép URL backend được cấp (Ví dụ: `https://planora-backend-youruser.koyeb.app`).

---

## 4. Triển khai Frontend Next.js lên Vercel

1. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Chọn **Add New** -> **Project** -> Chọn repo **Planora**.
3. Cấu hình Project trên Vercel:
   * **Root Directory**: Chọn thư mục con `planora-frontend`. Vercel sẽ tự động phát hiện Next.js.
   * **Framework Preset**: Chọn `Next.js`.
   * **Environment Variables**: Thêm biến môi trường:
     * `NEXT_PUBLIC_API_URL` = `https://planora-backend-youruser.koyeb.app` *(Địa chỉ URL Backend Koyeb bạn vừa copy ở bước trên)*.
4. Nhấn **Deploy** và sao chép URL Frontend Vercel nhận được (Ví dụ: `https://planora-frontend.vercel.app`).

---

## 5. Cấu hình CORS bảo mật trên Backend (Bắt buộc)

Để Frontend gọi được API của Backend mà không bị trình duyệt chặn CORS, bạn cần thêm cấu hình CORS vào Spring Security.

1. Mở file [SecurityConfig.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/config/SecurityConfig.java).
2. Cập nhật phương thức `securityFilterChain` để cấu hình CORS cho phép domain của Vercel truy cập:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(request -> {
            var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
            corsConfiguration.setAllowedOrigins(java.util.List.of(
                "https://planora-frontend.vercel.app", // Thay thế bằng domain Vercel của bạn
                "http://localhost:3000"                // Môi trường Local Test
            ));
            corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
            corsConfiguration.setAllowCredentials(true);
            return corsConfiguration;
        }))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/login").permitAll()
            .requestMatchers("/api/auth/logout").permitAll()
            .requestMatchers("/api/auth/google").permitAll()
            .requestMatchers("/api/auth/register").permitAll()
            .requestMatchers("/api/*").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

3. Commit và push thay đổi lên GitHub. Koyeb sẽ tự động deploy lại Backend với cấu hình CORS mới. Hệ thống lúc này đã sẵn sàng hoạt động!
