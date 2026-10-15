# Quy Tắc Kiểm Thử & Chạy Lệnh (Testing Policy)

## Nguyên Tắc Bắt Buộc:
1. **Không tự động chạy test sau khi code xong**:
   - Sau khi hoàn thành việc chỉnh sửa, tạo mới hoặc cập nhật code (backend hoặc frontend), Agent **KHÔNG ĐƯỢC TỰ Ý CHẠY TEST** (ví dụ: `mvn test`, `./mvnw test`, `npm test`, `npm run build`, `mvn package`, v.v.).
2. **Chỉ chạy test khi có yêu cầu cụ thể**:
   - Chỉ chạy các bộ test hoặc lệnh kiểm thử build khi người dùng yêu cầu trực tiếp trong câu lệnh (ví dụ: "chạy test giúp tôi", "kiểm tra test xem pass không",...).
3. **Phản hồi sau khi code**:
   - Sau khi hoàn tất việc chỉnh sửa code, báo cáo ngắn gọn, rõ ràng các thay đổi đã thực hiện và để người dùng tự quyết định khi nào kiểm thử hoặc chạy ứng dụng.
