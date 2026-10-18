# HƯỚNG DẪN QUY TRÌNH PHÁT TRIỂN & DEPLOY TIẾP TỤC (CI/CD WORKFLOW)
**Dự án:** Planora - Nền tảng lập kế hoạch cưới thông minh  
**Hệ thống:** Mô hình lai (Frontend trên Vercel + Backend & MySQL trên VPS Ubuntu)

---

## 1. TỔNG QUAN HỆ THỐNG ĐANG HOẠT ĐỘNG

| Thành phần | Nền tảng | Địa chỉ / Tên miền | Cơ chế triển khai |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel (Next.js) | `https://planora.id.vn`<br>`https://www.planora.id.vn` | **Tự động 100% (Git Auto Deploy)** khi push lên nhánh `develop`. |
| **Backend API** | VPS Ubuntu 2GB RAM | `https://api.planora.id.vn` | Đóng gói `.jar` ➔ Đẩy lên VPS ➔ Docker Compose chạy qua Nginx SSL. |
| **Database** | Docker MySQL 8.0 | Lưu tại volume nội bộ VPS | Tự động migrate dữ liệu qua **Flyway** mỗi khi Backend khởi động. |

---

## 2. QUY TRÌNH KHI BẠN CODE TIẾP FRONTEND (NEXT.JS)

Frontend đã được liên kết với GitHub và Vercel nên quy trình **hoàn toàn tự động**:

```
[Code trên máy] ➔ [Git Commit & Push lên develop] ➔ [Vercel tự động Build & Cập nhật web]
```

### Các bước thực hiện:
1. Bạn mở thư mục `planora-frontend`, code tính năng mới và test trên `localhost:3000`.
2. Khi code xong và muốn đưa lên trang web chính `planora.id.vn`:
   ```bash
   git add .
   git commit -m "feat: cập nhật giao diện mới"
   git push origin develop
   ```
3. **Xong!** Bạn không cần làm gì thêm. Vercel sẽ tự động lắng nghe commit mới, build và cập nhật lên `https://planora.id.vn` trong vòng 1-2 phút.

---

## 3. QUY TRÌNH KHI BẠN CODE TIẾP BACKEND (SPRING BOOT & DATABASE)

Khi bạn viết thêm API mới, sửa logic nghiệp vụ hoặc sửa cơ sở dữ liệu:

```
[Code & Test Local] ➔ [Build file .jar] ➔ [Tải lên VPS] ➔ [Restart Container Backend]
```

### Chi tiết từng bước:

#### Bước 3.1: Nếu có thay đổi bảng trong Database (Thêm cột, thêm bảng, thêm dữ liệu)
- **Tuyệt đối không sửa trực tiếp vào các file `V1`, `V2`, `V3` cũ** vì Flyway đã lưu checksum.
- Hãy tạo file mới theo thứ tự phiên bản tăng dần trong `planora-backend/src/main/resources/db/migration/`:
  - Ví dụ: `V4__add_payment_table.sql`, `V5__update_user_fields.sql`,...
- Khi Backend chạy trên VPS, Flyway sẽ tự động phát hiện và chạy file mới mà không làm mất dữ liệu cũ.

#### Bước 3.2: Đóng gói ứng dụng tại máy tính (Local)
Mở PowerShell tại máy tính của bạn và chạy:
```powershell
cd e:\Github\Planora\planora-backend
.\mvnw.cmd clean package -DskipTests
```
*(Lệnh này chỉ mất khoảng 15-20 giây để tạo ra file `target/planora-0.0.1-SNAPSHOT.jar` mới nhất).*

#### Bước 3.3: Đẩy file `.jar` mới lên VPS
Chạy lệnh `scp` từ máy tính:
```powershell
scp target/planora-0.0.1-SNAPSHOT.jar root@160.191.51.35:/root/planora/target/
```
*(Nhập mật khẩu VPS)*.

#### Bước 3.4: Rebuild và khởi động lại Backend trên VPS
SSH vào VPS (hoặc nếu đang mở cửa sổ SSH):
```bash
cd /root/planora
docker rm -f planora-backend
docker compose up -d --build backend
```
*(Nếu server dùng bản docker-compose cũ thì có thể dùng `docker-compose up -d --build backend`).*

Kiểm tra log xem backend đã khởi động xong chưa:
```bash
docker-compose logs -f backend
```

---

## 4. SCRIPT DEPLOY BACKEND "1 CLICK" (TIỆN LỢI CHO LẦN SAU)

Để bạn không phải gõ từng lệnh thủ công mỗi lần cập nhật Backend, dự án đã có sẵn script `deploy-backend.bat` hoặc PowerShell. Bạn chỉ cần chạy script này:

```powershell
# Chạy ngay tại thư mục planora-backend:
.\deploy.bat
```
*(Script sẽ tự động: Build Maven ➔ Tải file lên VPS ➔ Khởi động lại container Backend).*

---

## 5. CÁC LỆNH BẢO TRÌ & QUẢN LÝ VPS CẦN NHỚ

Khi SSH vào VPS (`ssh root@160.191.51.35`), dưới đây là các lệnh hữu ích:

### 1. Xem trạng thái các dịch vụ đang chạy:
```bash
cd /root/planora
docker-compose ps
```

### 2. Xem trực tiếp log lỗi Backend (nếu API có vấn đề):
```bash
cd /root/planora
docker-compose logs -f --tail=100 backend
```

### 3. Kiểm tra mức tiêu thụ RAM & CPU:
```bash
docker stats
```
*(Sẽ hiển thị chính xác MySQL và Backend đang ăn bao nhiêu MB RAM).*

### 4. Sao lưu (Backup) Database MySQL:
```bash
docker exec planora-mysql mysqldump -u root -pplanora_secure_password_123 planora_db > /root/backup_$(date +%Y%m%d).sql
```

### 5. Khởi động lại toàn bộ nếu VPS bị đơ/lag:
```bash
cd /root/planora
docker-compose down
docker-compose up -d
```
