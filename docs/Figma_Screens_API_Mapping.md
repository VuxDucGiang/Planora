# Tài liệu Phân tích & Bản đồ Ánh xạ: Màn hình Figma → API Endpoints

Tài liệu này ánh xạ chi tiết danh sách **60 màn hình** được định nghĩa trong [deep-research-report.md](file:///e:/Github/Planora/docs/deep-research-report.md) tới các thiết kế API hiện có tại [Planora_API_Design.md](file:///e:/Github/Planora/docs/Planora_API_Design.md) và xác định rõ các API cần xây dựng thêm để hoàn thiện hệ thống Backend.

---

## I. Tổng quan phân hệ & Trạng thái API

Hệ thống được chia làm 6 cụm phân hệ nghiệp vụ chính tương ứng với các nhóm màn hình trong tài liệu Figma:

| **Phân hệ (Module)** | **Màn hình Figma** | **Trạng thái API hiện tại** |
| :--- | :--- | :--- |
| **1. Public & Auth** | 1 - 5 | Đã thiết kế (Auth, Categories), Cần thêm (FAQ, Reset Pass) |
| **2. Customer Planning** | 6 - 20 | Đã thiết kế (Checklist, Timeline, Budget cơ bản, Onboarding) |
| **3. Marketplace & Shortlist** | 21 - 25 | Đã thiết kế (Search, Detail, Shortlist), Cần thêm (Compare) |
| **4. Inquiry & Communication** | 26 - 32 | Đã thiết kế (Chat, History), Cần thêm (Notifications) |
| **5. Vendor Portal** | 33 - 41 | Đã thiết kế (Inquiry), Cần thêm (Dashboard, Profile, Portfolio, Services) |
| **6. Payments** | 42 - 44 | Chưa thiết kế (Checkout PayOS, Webhook, History) |
| **7. Admin Panel** | 45 - 54 | Chưa thiết kế (Dashboard, User/Vendor Mgmt, Moderation) |

---

## II. Chi tiết Ánh xạ Màn hình → API Endpoints

### 1. Phân hệ Public & Authentication (Screens 1 – 5)
Phục vụ khách vãng lai và luồng đăng nhập/đăng ký thành viên.

*   **Màn hình 1: Landing Page**
    *   `GET /api/service-categories` (Public): Lấy danh mục dịch vụ (Venue, Decor, Makeup...).
    *   `GET /api/vendors/featured` (Public - **Cần thêm**): Lấy danh sách nhà cung cấp nổi bật cho Carousel.
*   **Màn hình 2: Login Page**
    *   `POST /api/auth/login` (Public): Đăng nhập bằng tài khoản cục bộ (Email & Password).
    *   `POST /api/auth/google` (Public): Đăng nhập nhanh qua Google OAuth2.
*   **Màn hình 3: Register Page**
    *   `POST /api/auth/register` (Public): Đăng ký tài khoản (Cặp đôi hoặc Nhà cung cấp).
*   **Màn hình 4: Forgot Password Page**
    *   `POST /api/auth/forgot-password` (Public - **Cần thêm**): Nhập email, hệ thống gửi liên kết hoặc OTP xác nhận đổi mật khẩu.
    *   `POST /api/auth/reset-password` (Public - **Cần thêm**): Xác nhận OTP và đặt lại mật khẩu mới.
*   **Màn hình 5: Help / FAQ Page**
    *   `GET /api/faqs` (Public - **Cần thêm**): Lấy danh sách câu hỏi thường gặp, hỗ trợ lọc theo từ khóa tìm kiếm (`?q=`).

---

### 2. Phân hệ Khách hàng – Công cụ lập kế hoạch (Screens 6 – 20)
Dành cho các cặp đôi thiết lập và quản lý quá trình chuẩn bị đám cưới.

*   **Màn hình 6 - 9: Onboarding (Multi-step Form)**
    *   `POST /api/wedding-plans/onboarding` (Authenticated): Gửi thông tin ngày cưới, địa điểm, số lượng khách, tổng ngân sách, phong cách mong muốn và danh mục ưu tiên. Hệ thống tự động tạo kế hoạch và các mục chi tiết.
*   **Màn hình 10: Plan Generation (Loading Screen)**
    *   *Sử dụng trạng thái chờ từ API Onboarding hoặc kiểm tra qua:* `GET /api/wedding-plans/{planId}/status` (**Cần thêm**).
*   **Màn hình 11: Wedding Plan Result & Màn hình 13: Wedding Plan Detail**
    *   `GET /api/wedding-plans/{planId}` (Authenticated): Lấy chi tiết kế hoạch cưới đã sinh ra.
    *   `PUT /api/wedding-plans/{planId}` (Authenticated - **Cần thêm**): Thay đổi các thông tin cơ bản (ngày cưới, số lượng khách, địa điểm).
*   **Màn hình 12: Customer Dashboard**
    *   `GET /api/wedding-plans/active` (Authenticated): Lấy thông tin đếm ngược, tiến độ checklist, ngân sách sử dụng hiển thị nhanh trên trang chủ.
*   **Màn hình 14: Budget Management Dashboard & Màn hình 15: Budget Category Detail**
    *   `GET /api/wedding-plans/{planId}/budget` (Authenticated): Lấy tổng quan ngân sách và danh sách Breakdown phân bổ theo danh mục (`estimatedCost` vs `actualCost`).
    *   `GET /api/wedding-plans/{planId}/budget/categories/{categoryId}` (Authenticated - **Cần thêm**): Lấy danh sách các khoản chi tiêu thực tế chi tiết của một danh mục.
*   **Màn hình 16: Add/Edit Budget Expense**
    *   `POST /api/budget-items` (Authenticated - **Cần thêm**): Thêm khoản chi tiêu mới.
    *   `PUT /api/budget-items/{itemId}` (Authenticated - **Cần thêm**): Sửa thông tin khoản chi tiêu (số tiền ước tính, số tiền thực tế, ghi chú).
    *   `DELETE /api/budget-items/{itemId}` (Authenticated - **Cần thêm**): Xóa khoản chi tiêu.
*   **Màn hình 17: Checklist Management Dashboard & Màn hình 18: Checklist Task Add/Edit**
    *   `GET /api/wedding-plans/{planId}/checklist` (Authenticated): Lấy danh sách các nhiệm vụ công việc.
    *   `POST /api/wedding-plans/{planId}/checklist` (Authenticated): Tạo mới một nhiệm vụ tùy chọn.
    *   `PUT /api/checklist-tasks/{taskId}` (Authenticated): Cập nhật tiêu đề, mô tả, hạn chót, trạng thái (`status`: `TODO`, `IN_PROGRESS`, `DONE`) hoặc mức độ ưu tiên.
    *   `DELETE /api/checklist-tasks/{taskId}` (Authenticated): Xóa công việc.
*   **Màn hình 19: Timeline Dashboard & Màn hình 20: Timeline Milestone Add/Edit**
    *   `GET /api/wedding-plans/{planId}/timeline` (Authenticated): Lấy dòng thời gian các mốc ngày cưới.
    *   `POST /api/wedding-plans/{planId}/timeline` (Authenticated): Thêm mốc thời gian sự kiện mới.
    *   `PUT /api/timeline-events/{eventId}` (Authenticated): Chỉnh sửa mốc sự kiện.
    *   `DELETE /api/timeline-events/{eventId}` (Authenticated): Xóa mốc sự kiện.

---

### 3. Phân hệ Marketplace, Inquiry & Profile (Screens 21 – 32)
Phục vụ tìm kiếm nhà cung cấp, lưu danh sách, gửi yêu cầu báo giá và quản lý tài khoản.

*   **Màn hình 21: Vendor Marketplace - List View & Màn hình 22: Search & Filter Panel**
    *   `GET /api/vendors` (Authenticated): Tìm kiếm và lọc nhà cung cấp (hỗ trợ phân trang và các bộ lọc: category, price, style, location).
    *   `GET /api/wedding-styles` (Public): Lấy danh sách styles phục vụ bộ lọc tìm kiếm.
*   **Màn hình 23: Vendor Detail Page**
    *   `GET /api/vendors/{vendorId}` (Authenticated): Chi tiết thông tin nhà cung cấp, portfolio ảnh, bảng giá các gói và đánh giá từ người dùng khác.
*   **Màn hình 24: Shortlist Page**
    *   `GET /api/shortlists` (Authenticated): Lấy danh sách Vendor yêu thích đã lưu.
    *   `POST /api/shortlists/{vendorId}` (Authenticated): Lưu Vendor vào mục yêu thích.
    *   `DELETE /api/shortlists/{vendorId}` (Authenticated): Xóa khỏi Shortlist.
*   **Màn hình 25: Compare Vendors**
    *   `GET /api/vendors/compare?ids=1,2,3` (Authenticated - **Cần thêm**): Trả về bảng thông tin đối sánh nhanh giữa các nhà cung cấp được chọn.
*   **Màn hình 26: Inquiry Form**
    *   `POST /api/inquiries` (Authenticated - Role USER): Gửi yêu cầu tư vấn/báo giá đầu tiên tới nhà cung cấp.
*   **Màn hình 27: Inquiry History**
    *   `GET /api/inquiries/customer` (Authenticated - Role USER): Lấy danh sách các yêu cầu tư vấn đã gửi và trạng thái hiện tại.
*   **Màn hình 28: Inquiry Detail**
    *   `GET /api/inquiries/{inquiryId}/messages` (Authenticated): Lấy cuộc hội thoại tin nhắn trao đổi.
    *   `POST /api/inquiries/{inquiryId}/messages` (Authenticated): Gửi tin nhắn phản hồi.
*   **Màn hình 29: Notification Center & Màn hình 30: Notification Detail**
    *   `GET /api/notifications` (Authenticated - **Cần thêm**): Lấy danh sách thông báo hệ thống.
    *   `PUT /api/notifications/{id}/read` (Authenticated - **Cần thêm**): Đánh dấu một thông báo là đã đọc.
    *   `PUT /api/notifications/read-all` (Authenticated - **Cần thêm**): Đánh dấu đọc tất cả.
*   **Màn hình 31: Profile Page & Màn hình 32: Settings Page**
    *   `GET /api/users/profile` (Authenticated): Xem thông tin cá nhân.
    *   `PUT /api/users/profile` (Authenticated): Cập nhật họ tên, số điện thoại, ảnh đại diện và địa chỉ.
    *   `PUT /api/users/settings` (Authenticated - **Cần thêm**): Cấu hình cài đặt nhận thông báo qua email/SMS.

---

### 4. Phân hệ Vendor Portal (Screens 33 – 41)
Dành riêng cho nhà cung cấp dịch vụ tiệc cưới quản lý gian hàng và khách hàng.

*   **Màn hình 33: Vendor Dashboard**
    *   `GET /api/vendor-portal/dashboard` (Authenticated - Role VENDOR - **Cần thêm**): Xem nhanh số liệu thống kê (yêu cầu mới, số lượt xem hồ sơ, đánh giá mới).
*   **Màn hình 34: Vendor Profile & Màn hình 35: Vendor Profile Edit**
    *   `GET /api/vendor-portal/profile` (Authenticated - Role VENDOR - **Cần thêm**): Lấy thông tin hồ sơ dịch vụ của chính mình và trạng thái duyệt.
    *   `PUT /api/vendor-portal/profile` (Authenticated - Role VENDOR - **Cần thêm**): Cập nhật mô tả dịch vụ, khu vực hoạt động, thông tin liên hệ.
*   **Màn hình 36: Portfolio Management**
    *   `GET /api/vendor-portal/portfolios` (Authenticated - Role VENDOR - **Cần thêm**): Lấy danh sách ảnh/video.
    *   `POST /api/vendor-portal/portfolios` (Authenticated - Role VENDOR - **Cần thêm**): Tải lên ảnh mới (tích hợp Cloudinary).
    *   `DELETE /api/vendor-portal/portfolios/{photoId}` (Authenticated - Role VENDOR - **Cần thêm**): Xóa ảnh.
    *   `PUT /api/vendor-portal/portfolios/reorder` (Authenticated - Role VENDOR - **Cần thêm**): Sắp xếp lại thứ tự hiển thị ảnh.
*   **Màn hình 37: Services Management**
    *   `GET /api/vendor-portal/services` (Authenticated - Role VENDOR - **Cần thêm**): Danh sách các gói dịch vụ/báo giá.
    *   `POST/PUT/DELETE /api/vendor-portal/services` (Authenticated - Role VENDOR - **Cần thêm**): CRUD gói dịch vụ.
*   **Màn hình 38: Inquiry Management (Vendor) & Màn hình 39: Inquiry Detail (Vendor)**
    *   `GET /api/inquiries/vendor` (Authenticated - Role VENDOR): Lấy danh sách các yêu cầu tư vấn nhận được từ khách hàng.
    *   `GET /api/inquiries/{inquiryId}/messages` & `POST /api/inquiries/{inquiryId}/messages` (Trao đổi trực tiếp với khách hàng).
*   **Màn hình 40: Vendor Analytics & Màn hình 41: Vendor Settings**
    *   `GET /api/vendor-portal/analytics` (Authenticated - Role VENDOR - **Cần thêm**): Thống kê doanh số, số lượt quan tâm qua các biểu đồ tháng.
    *   *Tái sử dụng API Settings chung:* `PUT /api/users/settings`.

---

### 5. Phân hệ Thanh toán (Screens 42 – 44)
Xử lý các giao dịch đặt cọc và dịch vụ trên hệ thống.

*   **Màn hình 42: Payment Checkout**
    *   `POST /api/payments/checkout` (Authenticated - **Cần thêm**): Khởi tạo giao dịch thanh toán và sinh Link checkout thông qua PayOS.
    *   `POST /api/payments/webhook` (Public - **Cần thêm**): Nhận tín hiệu callback tự động từ PayOS để đồng bộ trạng thái giao dịch vào DB.
*   **Màn hình 43: Payment History**
    *   `GET /api/payments` (Authenticated - **Cần thêm**): Xem lịch sử các đợt thanh toán đặt cọc.
*   **Màn hình 44: Payment Detail (Receipt)**
    *   `GET /api/payments/{paymentId}` (Authenticated - **Cần thêm**): Chi tiết biên nhận thanh toán.

---

### 6. Phân hệ Admin Panel (Screens 45 – 54)
Dành cho người quản trị vận hành và giám sát hệ sinh thái.

*   **Màn hình 45: Admin Dashboard**
    *   `GET /api/admin/dashboard` (Authenticated - Role ADMIN - **Cần thêm**): Thống kê tổng hợp số lượng user, vendor, tăng trưởng, danh sách chờ duyệt.
*   **Màn hình 46: Admin - User Management**
    *   `GET /api/admin/users` (Authenticated - Role ADMIN - **Cần thêm**): Danh sách khách hàng, bộ lọc tìm kiếm.
    *   `PUT /api/admin/users/{userId}/status` (Authenticated - Role ADMIN - **Cần thêm**): Khóa hoặc kích hoạt lại tài khoản khách hàng.
*   **Màn hình 47: Admin - Vendor Management**
    *   `GET /api/admin/vendors` (Authenticated - Role ADMIN - **Cần thêm**): Xem danh sách Vendor, lọc trạng thái (Pending/Approved/Blocked).
    *   `PUT /api/admin/vendors/{vendorId}/approve` (Authenticated - Role ADMIN - **Cần thêm**): Phê duyệt gian hàng của Vendor.
    *   `PUT /api/admin/vendors/{vendorId}/block` (Authenticated - Role ADMIN - **Cần thêm**): Khóa tài khoản Vendor vi phạm.
*   **Màn hình 48: Admin - Category Management**
    *   `POST/PUT/DELETE /api/admin/service-categories` (Authenticated - Role ADMIN - **Cần thêm**): Quản lý các danh mục dịch vụ cưới.
*   **Màn hình 49: Admin - Style Management**
    *   `POST/PUT/DELETE /api/admin/wedding-styles` (Authenticated - Role ADMIN - **Cần thêm**): Quản lý các phong cách thiết kế đám cưới.
*   **Màn hình 50: Admin - Review Management**
    *   `GET /api/admin/reviews` (Authenticated - Role ADMIN - **Cần thêm**): Xem danh sách review, lọc các bình luận bị báo cáo xấu.
    *   `DELETE /api/admin/reviews/{id}` (Authenticated - Role ADMIN - **Cần thêm**): Xóa review xấu.
*   **Màn hình 51 - 53: Reports, Notifications, Settings (Admin)**
    *   `GET /api/admin/reports` (Authenticated - Role ADMIN - **Cần thêm**): Xuất báo cáo dữ liệu.
    *   `GET /api/admin/notifications` (Authenticated - Role ADMIN - **Cần thêm**): Lấy thông báo hệ thống.
    *   `PUT /api/admin/settings` (Authenticated - Role ADMIN - **Cần thêm**): Cấu hình cài đặt toàn hệ thống.
