# Planora 🕊️
> **AI-Powered Wedding Planning Marketplace**
> *Nền tảng hỗ trợ lập kế hoạch đám cưới toàn diện và kết nối nhà cung cấp dịch vụ tiệc cưới tích hợp trí tuệ nhân tạo (AI).*

---

## 🌟 Giới thiệu Dự án
**Planora** là một hệ sinh thái cưới "All-in-one" được thiết kế nhằm đơn giản hóa toàn bộ hành trình chuẩn bị đám cưới của các cặp đôi. Thay vì phải tự tìm kiếm rời rạc trên mạng xã hội hay bảng tính thủ công, Planora cung cấp công cụ lập kế hoạch cưới cá nhân hóa tích hợp AI, giúp các cặp đôi tự động phân bổ ngân sách, gợi ý concept và kết nối trực tiếp với các nhà cung cấp dịch vụ cưới (Vendors) phù hợp nhất.

Dự án được phát triển dưới dạng bài tập lớn cho môn học **EXE101 – Experiential Entrepreneurship 1** tại **Đại học FPT**.

---

## 🚀 Tính Năng Cốt Lõi (Core Features)

### 1. Công cụ Lập Kế hoạch Cá nhân hóa (Wedding Plan Generator)
*   **Onboarding thông minh:** Người dùng nhập các dữ liệu đầu vào: ngân sách dự kiến, thời gian, địa điểm, số lượng khách mời, phong cách cưới mong muốn và mức độ ưu tiên cho từng hạng mục.
*   **Tạo kế hoạch tự động:** Hệ thống đề xuất concept cưới phù hợp, tự động tính toán phân bổ ngân sách tham khảo cho từng hạng mục dịch vụ (trang trí, váy cưới, chụp ảnh, makeup, tiệc cưới...) và thiết lập timeline/checklist công việc cụ thể theo từng giai đoạn chuẩn bị.

### 2. Sàn Giao dịch Dịch vụ Cưới (Vendor Marketplace & Matching)
*   **Khám phá & Tìm kiếm:** Nơi các vendor (Studio, Makeup Artist, Váy cưới, Decor, Planner...) đăng tải hồ sơ chuyên nghiệp, portfolio hình ảnh, bảng giá tham khảo và các gói dịch vụ.
*   **Gợi ý thông minh (Matching Engine):** Tự động kết nối các cặp đôi với vendor phù hợp nhất dựa trên vị trí địa lý, ngân sách khả dụng và phong cách mong muốn.
*   **So sánh & Shortlist:** Hỗ trợ lưu trữ danh sách các vendor tiềm năng và so sánh chi phí, đánh giá từ khách hàng trước khi đưa ra quyết định.

### 3. Quản lý Tiến trình (Interactive Dashboard)
*   **Checklist công việc:** Theo dõi và nhắc nhở các đầu việc cần chuẩn bị theo dòng thời gian từ lúc bắt đầu đến ngày cưới.
*   **Quản lý ngân sách (Budget Management):** Ghi nhận chi phí thực tế, so sánh với ngân sách dự kiến và cảnh báo khi có nguy cơ vượt ngân sách (Over-budget).
*   **Kênh trao đổi (Inquiry Flow):** Gửi yêu cầu tư vấn trực tiếp từ hệ thống đến các vendor và quản lý phản hồi, báo giá tập trung tại một nơi.

---

## 💻 Công Nghệ Sử Dụng (Technology Stack)

Hệ thống được phát triển theo mô hình **Client-Server** sử dụng kiến trúc **RESTful API** để tách biệt rõ ràng giữa Frontend và Backend.

### Frontend (`/planora-frontend`)
*   **Core:** React 19, Vite, TypeScript
*   **UI/UX:** Tailwind CSS, Radix UI, Lucide Icons (Thiết kế Responsive tối ưu cho mọi màn hình)
*   **State Management & Data Fetching:** Zustand, React Query (TanStack Query)
*   **Form & Validation:** React Hook Form, Zod
*   **Data Visualization:** Recharts (Hiển thị biểu đồ phân bổ ngân sách và tiến độ chuẩn bị)

### Backend (`/planora-backend`)
*   **Framework:** Spring Boot 3.5+ (Java)
*   **Security:** Spring Security, JWT (JSON Web Token), OAuth2 (Đăng nhập Google/Facebook)
*   **Database & Migration:** MySQL 8.0, Flyway (Quản lý phiên bản cơ sở dữ liệu)
*   **Real-time:** Spring WebSocket, STOMP (Hỗ trợ thông báo realtime khi có yêu cầu tư vấn hoặc phản hồi từ vendor)
*   **AI Integration:** Spring AI + Google GenAI (Gemini API) (Xử lý gợi ý concept, checklist và ngân sách)
*   **Image Hosting:** Cloudinary
*   **Payment Gateway:** PayOS Integration (Hỗ trợ thanh toán đặt cọc hoặc dịch vụ trong các giai đoạn sau)

---

## 🛠️ Kiến Trúc Hệ Thống (System Architecture)

```mermaid
graph TD
    Client[React Frontend - React 19 / Vite]
    API[RESTful API Gateway]
    Security[Spring Security + JWT/OAuth2]
    Service[Spring Boot Backend - Service Layer]
    DB[(MySQL Database)]
    
    %% External Services %%
    GenAI[Google GenAI - Gemini]
    Cloudinary[Cloudinary Image Hosting]
    PayOS[PayOS Payment]
    WS[WebSocket / STOMP]

    Client -->|HTTPS / JSON| API
    Client <-->|WebSocket| WS
    API --> Security
    Security --> Service
    Service --> DB
    
    Service <--> GenAI
    Service <--> Cloudinary
    Service <--> PayOS
```

---

## 📅 Lộ Trình Triển Khai (Roadmap)

*   **Phase 1: Core Foundation (Nền tảng)**
    *   Thiết lập cấu trúc dự án Spring Boot và React 19.
    *   Thiết kế cơ sở dữ liệu MySQL và tích hợp Flyway.
    *   Xây dựng hệ thống đăng ký, đăng nhập (Authentication & Authorization) bằng JWT.
    *   Tạo hồ sơ cá nhân cho người dùng và hồ sơ dịch vụ cho Vendor.
*   **Phase 2: Planning & Matching Core (Tính năng lõi)**
    *   Form nhập thông tin chuẩn bị cưới (Budget, Style, Location,...).
    *   Logic/Thuật toán phân bổ ngân sách dự kiến và gợi ý concept.
    *   API Matching Vendor và hiển thị kết quả kế hoạch cưới trên Dashboard.
*   **Phase 3: Marketplace & Inquiry Flow (Kết nối)**
    *   Trang danh sách Vendor, lọc và tìm kiếm theo danh mục dịch vụ, giá, khu vực.
    *   Xem chi tiết hồ sơ Vendor & Portfolio.
    *   Luồng gửi yêu cầu tư vấn (Inquiry) giữa cô dâu/chú rể và nhà cung cấp.
*   **Phase 4: Dashboard, Realtime & Payment Extension (Nâng cao)**
    *   Dashboard quản lý Checklist & Timeline tương tác.
    *   Thông báo realtime qua WebSocket khi có tin nhắn/inquiry mới.
    *   Tích hợp thanh toán đặt cọc qua cổng PayOS.

---

## 👥 Thành Viên Nhóm (Team Planora)

*   **Vũ Đức Giang** (DE190556) - *FullStack Developer*
*   **Phan Thanh Nguyên** (DE180215) - *FullStack Developer*
*   **Lê Văn Quân** (DS190663) - *Business Analyst*
*   **Nguyễn Thị Thuỳ Trâm** (DS190540) - *Business Analyst*
*   **Phan Thị Tuyết Ngân** (DE190738) - *UI/UX Designer*

*Giáo viên hướng dẫn:* **ThS. Nguyễn Thị Tú Sương**

---

## 🏁 Hướng Dẫn Cài Đặt & Chạy Thử (Setup & Run)

### Yêu cầu hệ thống
*   JDK 17 trở lên (để chạy Spring Boot)
*   Node.js v18+ (để chạy React Frontend)
*   MySQL 8.0

### 1. Khởi động Backend
1.  Di chuyển vào thư mục backend:
    ```bash
    cd planora-backend
    ```
2.  Cấu hình cơ sở dữ liệu MySQL trong file `src/main/resources/application.properties` (hoặc tạo file `application-local.properties`).
3.  Chạy ứng dụng bằng Maven:
    ```bash
    ./mvnw spring-boot:run
    ```

### 2. Khởi động Frontend
1.  Di chuyển vào thư mục frontend:
    ```bash
    cd planora-frontend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Khởi động máy chủ dev ở chế độ local:
    ```bash
    npm run dev
    ```