# Quy Chuẩn Thiết Kế UI Planora (UI Design System Rule)

Tất cả các giao diện frontend của Planora phải tuân thủ nghiêm ngặt tài liệu quy chuẩn thiết kế tại [PLANORA_DESIGN_SYSTEM.md](file:///e:/Github/Planora/PLANORA_DESIGN_SYSTEM.md).

## Các Quy Tắc Bắt Buộc:
1. **Màu Nền Canvas**: Luôn dùng nền canvas sáng ấm `#FFFBF5` (`bg-[#FFFBF5]` hoặc `bg-canvas`) kết hợp với container bọc `#FAF8F5`. Tuyệt đối không dùng nền màu đỏ sẫm phủ kín section/container lớn.
2. **Màu Đỏ Rượu Vang Chủ Đạo**: `#5D0F12` (hover `#4A0C0E`) dùng cho tiêu đề Serif, nút chính (CTA), điểm nhấn và icon. Màu chữ tương phản trên nền đỏ luôn là `#FFFBF5`.
3. **Typography**:
   - Tiêu đề, tên thương hiệu, tên vendor: Phông Serif `"ITC Garamond Std", "EB Garamond", serif`, viết hoa (uppercase), tracking rộng (`tracking-wide` hoặc `tracking-wider`).
   - Dữ liệu, mô tả, nhãn: Phông Sans-serif (`Barlow`, `Inter`, sans-serif).
4. **Kích Thước Thẻ Vendor Chuẩn**:
   - Chiều rộng tối đa: `w-full max-w-[310px]`.
   - Bo góc: `rounded-[1.75rem]`.
   - Viền: `border border-neutral-100` với đổ bóng `shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-xl hover:scale-[1.02]`.
   - Khung ảnh: `p-3 pb-0`, ảnh `h-52 sm:h-56 rounded-2xl overflow-hidden`.
   - Badge danh mục: `bg-white/85 text-neutral-800 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider`.
   - Bộ đôi nút bấm dạng viên thuốc (`rounded-full`): `INQUIRE NOW` (`bg-[#5D0F12] text-[#FFFBF5]`) và `View` (`bg-white border border-neutral-300 text-neutral-800`).
5. **Hệ Thống Nút & Badge**: Luôn dùng kiểu dáng viên thuốc tròn mềm mại (`rounded-full`).
