# Quy Chuẩn Thiết Kế UI Planora (UI Design System Rule)

> **Tiêu chuẩn thiết kế chuẩn mực (Benchmark)**: Toàn bộ giao diện Planora lấy **Marketplace (`/marketplace`, `/marketplace/[id]`)** làm chuẩn mực thị giác tối cao. Mọi màn hình (Dashboard, Budget, Checklist, Timeline, Messages, Onboarding, Vendor Hub) đều phải phản ánh đồng bộ 100% phong cách thiết kế này.
> **Phong cách nhận diện cốt lõi**: *Quiet Luxury & Editorial Romance* (Sang trọng, Tinh tế, Chuẩn mực Tạp chí Cưới Cao Cấp).

---

## 1. Triết Lý Thiết Kế Bất Di Bất Dịch (Core Rules)

1. **Nền Canvas Sáng Ấm (Warm Linen Canvas)**:
   - Toàn trang luôn dùng nền ấm dịu mắt `#FFFBF5` (`bg-[#FFFBF5]` hoặc `bg-canvas`), tuyệt đối không dùng màu trắng tinh trơn tuột `#FFFFFF` cho toàn bộ trang.
   - Các khối bọc nội dung lớn (Section Container / Showcase) dùng màu linen sáng `#FAF8F5` (`bg-[#FAF8F5]`).
2. **Nghiêm Cấm Nền Đỏ Nguyên Khối Lớn**:
   - Tuyệt đối **không bao giờ** dùng nền màu đỏ sẫm `#5D0F12` phủ kín section, container, sidebar hay grid lớn.
   - Sắc đỏ rượu vang `#5D0F12` chỉ được dùng làm màu nhận diện thương hiệu: tiêu đề Serif, nút hành động chính (CTA), icon trọng tâm, điểm nhấn kích hoạt hoặc border highlight.
3. **Hình Dáng Viên Thuốc (Pill-shaped Controls)**:
   - Tất cả các nút bấm (Button), nhãn phân loại (Badge/Tag), ô tìm kiếm (Search Bar), nút chuyển tab (Filter Pills) và thanh phân trang (Pagination Dots) **bắt buộc dùng `rounded-full`**.
4. **Hệ Thống Bo Góc Mềm Mại (Curved Radii)**:
   - Thẻ card chuẩn (Vendor Card, Summary Card): `rounded-[1.75rem]` (28px).
   - Khung ảnh bên trong thẻ card: `rounded-2xl` (16px).
   - Khối section lớn: `rounded-[1.75rem] sm:rounded-[2rem]`.
   - Card bộ lọc / Drawer nhỏ: `rounded-2xl`.

---

## 2. Bảng Màu Tiêu Chuẩn (Color Palette & Tailwind Tokens)

| Token / Nhóm | Mã HEX / Tailwind | Vai Trò & Vị Trí Áp Dụng |
| :--- | :--- | :--- |
| **Canvas Background** | `#FFFBF5` / `bg-[#FFFBF5]` | Nền tổng thể toàn bộ trang (Page Canvas) |
| **Section Surface** | `#FAF8F5` / `bg-[#FAF8F5]` | Khối bọc danh sách, Showcase Grid, Card bọc lớn |
| **Card / Surface White** | `#FFFFFF` / `bg-white` | Mặt thẻ Card, Modal dialog, Input form, Dropdown |
| **Glass Badge** | `bg-white/85 backdrop-blur-sm` | Badge danh mục trên ảnh, nút tim floating |
| **Imperial Burgundy** (Chủ đạo) | `#5D0F12` | Tiêu đề Serif, nút CTA chính, icon nổi bật, border active |
| **Burgundy Hover** | `#4A0C0E` | Trạng thái hover/active của nút CTA chính |
| **Champagne Cream** | `#FFFBF5` / `!text-[#FFFBF5]` | Màu chữ tương phản trên nền đỏ `#5D0F12` |
| **Star Gold** | `text-amber-400 fill-amber-400` | 5 sao đánh giá dịch vụ |
| **Match Bronze** | `#B45309` / `text-amber-700` | Biểu tượng `✦ Match: 98%` |
| **Heart / Saved** | `text-red-600 fill-red-600` | Nút tim đã lưu vào Shortlist |
| **Neutral Dark** | `#1A1A1A` / `text-neutral-900` | Tiêu đề card, giá tiền, số liệu thống kê |
| **Neutral Body** | `#4A4A4A` / `text-neutral-700` | Nội dung mô tả, văn bản thường |
| **Neutral Muted** | `#737373` / `text-neutral-500` | Số lượt đánh giá `(32 reviews)`, nhãn phụ |
| **Neutral Light / Border** | `border-neutral-100` / `border-neutral-200/80` / `border-neutral-300` | Đường viền mảnh thanh lịch, ngăn cách tinh tế |

---

## 3. Hệ Thống Phông Chữ (Typography Hierarchy)

### 3.1. Phông Chữ Tiêu Đề (Serif Display)
- **Font Family**: `"ITC Garamond Std", "EB Garamond", Garamond, serif`
- **Quy tắc sử dụng**:
  - Tiêu đề thương hiệu, tên vendor, tiêu đề khối: Viết hoa (`uppercase`), tracking rộng (`tracking-wide` hoặc `tracking-widest`), màu chủ đạo `#5D0F12`.
  - Cỡ chữ mẫu:
    - Tên Vendor trên thẻ: `font-serif text-lg sm:text-xl font-bold uppercase tracking-wide text-[#5D0F12]`
    - Tiêu đề khối / Section Header: `font-serif text-xl sm:text-2xl font-normal uppercase tracking-widest text-[#5D0F12]`
    - Lời dẫn / Subtitle: Chữ nghiêng thanh nhã `font-serif italic text-neutral-800 text-xs sm:text-base`

### 3.2. Phông Chữ Giao Diện & Dữ Liệu (Sans-serif UI)
- **Font Family**: `"Barlow", "Inter", -apple-system, sans-serif`
- **Quy tắc sử dụng**:
  - Badge / Nhãn tag: `text-xs font-semibold uppercase tracking-wider`
  - Nút bấm (CTA): `text-xs sm:text-sm font-bold uppercase tracking-wider`
  - Dòng Match & Giá: `text-sm font-semibold text-neutral-800` & `text-sm text-neutral-600 font-medium`
  - Input & Form: `text-sm text-neutral-900 placeholder:text-neutral-400`

---

## 4. Các Thành Phần Giao Diện Chuẩn Mực (Standard UI Components)

### 4.1. Breadcrumb / Eyebrow Header Row (Dải Tiêu Đề Đầu Trang)
Luôn đặt ở đầu khu vực nội dung chính:
```tsx
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-6">
  <div>
    {/* Breadcrumb Pill Badge */}
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-xs">
      <Building2 className="w-4 h-4 text-[#5D0F12]" />
      <span className="font-serif tracking-widest text-xs font-bold uppercase text-[#5D0F12]">
        DỊCH VỤ CƯỚI & ĐỐI TÁC
      </span>
    </div>

    {/* Subtitle nghiêng */}
    <h2 className="text-xs sm:text-base font-serif italic text-neutral-800 mt-1.5 pl-1">
      Khám phá và kết nối cùng các thương hiệu cưới cao cấp tuyển chọn
    </h2>
  </div>

  {/* Search Pill Input */}
  <div className="relative w-full md:w-[280px]">
    <input
      type="text"
      placeholder="Tìm kiếm dịch vụ, tên đối tác..."
      className="w-full bg-white border border-neutral-300 rounded-full pl-10 pr-4 py-2 text-sm text-neutral-900 shadow-xs focus:outline-none focus:border-[#5D0F12] placeholder:text-neutral-400"
    />
    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
  </div>
</div>
```

---

### 4.2. Thẻ Nhà Cung Cấp Chuẩn (Standard Vendor Card)
Mọi nơi hiển thị nhà cung cấp (Marketplace, Dashboard, Blueprint Onboarding, Saved Vendors) **bắt buộc** áp dụng chính xác cấu trúc và kích thước này:
- **Kích thước bao**: `w-full max-w-[310px]`
- **Bo góc ngoài**: `rounded-[1.75rem]`
- **Đổ bóng**: `shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-xl`
- **Khung ảnh**: `p-3 pb-0`, kích thước ảnh `w-full h-52 sm:h-56 rounded-2xl overflow-hidden`

```tsx
<div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 select-none origin-center w-full max-w-[310px] hover:scale-[1.02] cursor-pointer group">
  {/* 1. Khung ảnh trên */}
  <div className="p-3 pb-0">
    <div className="w-full h-52 sm:h-56 rounded-2xl overflow-hidden relative bg-neutral-100">
      <img
        src={vendor.imageUrl}
        alt={vendor.businessName}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Category Pill Tag */}
      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/85 text-neutral-800 backdrop-blur-sm shadow-sm uppercase tracking-wider">
        {vendor.categoryName}
      </span>

      {/* Heart Bookmark Button */}
      <button
        type="button"
        onClick={onToggleShortlist}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-sm shadow-sm transition-all active:scale-90 z-10 cursor-pointer"
      >
        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'text-red-600 fill-red-600' : 'text-neutral-400 hover:text-red-500'}`} />
      </button>
    </div>
  </div>

  {/* 2. Thân nội dung */}
  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
    {/* Đánh giá sao */}
    <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="font-semibold text-neutral-700">({rating.toFixed(1)})</span>
      </div>
      <span className="text-xs text-neutral-400">({reviewsCount} reviews)</span>
    </div>

    {/* Tên Vendor Serif đỏ rượu vang */}
    <h4
      className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wide line-clamp-1 mb-1 text-[#5D0F12]"
      style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
    >
      {vendor.businessName}
    </h4>

    {/* Độ tương thích Match & Mức giá */}
    <div className="space-y-0.5 mb-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
        <span className="text-amber-700 text-xs">✦</span>
        <span>Match: {matchScore}%</span>
      </div>
      <p className="text-sm text-neutral-600 font-medium">{priceText}</p>
    </div>

    {/* 3. Bộ đôi nút bấm dạng viên thuốc */}
    <div className="flex items-center gap-2 pt-1">
      {/* Primary CTA Button */}
      <button
        onClick={onInquire}
        className="flex-1 py-2 px-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-sm hover:opacity-95 active:scale-95 cursor-pointer bg-[#5D0F12] !text-[#FFFBF5]"
      >
        INQUIRE NOW
      </button>
      {/* Secondary Outline Button */}
      <button
        onClick={onView}
        className="py-2 px-4 rounded-full text-xs sm:text-sm font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 text-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
      >
        View
      </button>
    </div>
  </div>
</div>
```

---

### 4.3. Khối Showcase Container Lớn (Section Container)
Dùng cho vùng chứa danh sách cards hoặc cụm chức năng chính:
```tsx
<div className="bg-[#FAF8F5] border border-neutral-200/60 rounded-[1.75rem] sm:rounded-[2rem] p-4 sm:p-8 shadow-xs flex flex-col justify-between">
  {/* Thanh điều hướng / Đếm số lượng trên đỉnh */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-600 mb-6 pb-4 border-b border-neutral-200/80 text-sm">
    <span className="font-serif italic text-neutral-700 text-sm sm:text-base tracking-wide">
      Hiển thị 1 - 9 trong số 48 đối tác
    </span>
    {/* Select lọc dạng viên thuốc */}
    <select className="text-sm font-semibold bg-white border border-neutral-300 rounded-full px-3.5 py-1.5 text-neutral-700 focus:outline-none focus:border-[#5D0F12] shadow-xs cursor-pointer">
      <option value="featured">Nổi bật nhất</option>
      <option value="rating">Đánh giá cao nhất</option>
    </select>
  </div>

  {/* Lưới thẻ Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
    {/* VendorCard items */}
  </div>
</div>
```

---

### 4.4. Hệ Thống Nút Bấm Chuẩn (Button Style Matrix)

```tsx
/* 1. Primary Action Button (Đỏ rượu vang chữ kem, hình viên thuốc) */
className="py-2 px-5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-sm hover:opacity-95 active:scale-95 cursor-pointer bg-[#5D0F12] !text-[#FFFBF5]"

/* 2. Secondary / Outline Button (Nền trắng viền xám, hover nền sáng) */
className="py-2 px-4 rounded-full text-xs sm:text-sm font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 text-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"

/* 3. Danger / Delete Button (Nhẹ nhàng quý phái, không dùng đỏ chói) */
className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"

/* 4. Filter Clear / Inline Action */
className="text-xs text-neutral-500 hover:text-[#5D0F12] hover:underline cursor-pointer font-medium"
```

---

### 4.5. Thanh Phân Trang Chuẩn (Marketplace Pagination)

```tsx
<div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-neutral-200/80 text-sm">
  <button className="font-semibold uppercase tracking-wider text-[#5D0F12] hover:underline disabled:opacity-30 cursor-pointer flex items-center gap-1">
    <span>&larr;</span> Trang trước
  </button>

  {/* Dots chỉ số */}
  <div className="flex items-center gap-2">
    {pages.map((_, i) => (
      <button
        key={i}
        className={`transition-all duration-300 rounded-full cursor-pointer ${
          currentPage === i ? 'w-7 h-2.5 bg-[#5D0F12]' : 'w-2.5 h-2.5 bg-neutral-300 hover:bg-neutral-400'
        }`}
      />
    ))}
  </div>

  <button className="font-semibold uppercase tracking-wider text-[#5D0F12] hover:underline disabled:opacity-30 cursor-pointer flex items-center gap-1">
    Trang tiếp <span>&rarr;</span>
  </button>
</div>
```

---

## 5. Danh Sách Những Điều Nghiêm Cấm Khi Thiết Kế (Design Don'ts)

1. ❌ **Không dùng nền đỏ nguyên khối lớn**: Tránh tuyệt đối việc bọc card, grid, bảng hay container lớn bằng nền đỏ sẫm.
2. ❌ **Không dùng góc vuông hoặc bo góc nhọn thô**: Nút bấm luôn là `rounded-full`, thẻ card luôn là `rounded-[1.75rem]`. Cấm dùng `rounded-none`, `rounded-sm`.
3. ❌ **Không tự ý thay đổi tỷ lệ thẻ Vendor Card**: Kích thước `max-w-[310px]`, chiều cao ảnh `h-52 sm:h-56` là kích thước chuẩn mực đồng bộ xuyên suốt ứng dụng.
4. ❌ **Không dùng phông chữ uốn lượn (Script) cho thông tin chức năng**: Phông Script chỉ dùng điểm xuyết nghệ thuật thiệp cưới, tuyệt đối không dùng cho tiêu đề, nhãn, nút hay tên vendor.
5. ❌ **Không dùng viền đen đậm sắc cạnh**: Luôn dùng viền mỏng tinh tế `border-neutral-100`, `border-neutral-200/80` hoặc `border-neutral-300`.
6. ❌ **Không để tràn viewport ngoài ý muốn**: Các trang làm việc dashboard (như Hộp thư tin nhắn `/messages`) phải đảm bảo vừa khít màn hình `h-screen overflow-hidden` và chỉ cuộn trong từng vùng nội dung.

---
*Tài liệu này là quy tắc bắt buộc cho mọi Agent khi tạo mới hoặc chỉnh sửa bất kỳ giao diện nào trong Planora.*
