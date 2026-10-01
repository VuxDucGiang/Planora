# PLANORA DESIGN SYSTEM & UI STYLE GUIDE
> **Phiên bản**: 1.0 (Chuẩn hóa toàn diện dự án Planora)  
> **Phong cách cốt lõi**: *Quiet Luxury & Editorial Romance* (Sang trọng, Tinh tế, Chuẩn mực Báo chí Cưới)

---

## 1. Triết Lý Thiết Kế (Design Philosophy)

Toàn bộ ứng dụng **Planora** được xây dựng dựa trên cảm xúc của ngày trọng đại: vừa lãng mạn, thiêng liêng, vừa chuẩn mực, cao cấp và đáng tin cậy.

```
                  ┌──────────────────────────────────────────────┐
                  │          QUIET LUXURY & ROMANCE              │
                  ├──────────────────────────────────────────────┤
                  │  Nền Canvas Linen Ấm   (#FFFBF5 / #FAF8F5)   │
                  │  Điểm Nhấn Đỏ Rượu Vang (#5D0F12)            │
                  │  Phông Chữ Serif Quý Tộc ("EB Garamond")     │
                  │  Bo Góc Mềm Mại          (rounded-[1.75rem]) │
                  │  Đổ Bóng Tinh Tế & Nổi   (shadow-[0_10px_30px])│
                  └──────────────────────────────────────────────┘
```

### Nguyên Tắc Bất Di Bất Dịch:
1. **Không dùng nền đỏ nguyên khối lớn**: Tránh hoàn toàn việc bọc các container hoặc section lớn bằng màu đỏ sẫm nguyên mảng (gây cảm giác nặng nề, bí bách). Sắc đỏ rượu vang `#5D0F12` chỉ được dùng làm màu nhận diện thương hiệu, tiêu đề, nút hành động chính (CTA) và các điểm nhấn tinh tế.
2. **Nền sáng ấm (Warm Ivory Canvas)**: Không dùng màu trắng tinh `#FFFFFF` trơn tuột cho toàn trang. Luôn sử dụng màu nền ấm `#FFFBF5` (Warm Canvas) kết hợp với các khối container màu linen `#FAF8F5` để tạo chiều sâu dịu mắt.
3. **Thẩm mỹ Báo chí & Tỉ lệ Vàng (Editorial Elegance)**: Hình ảnh luôn có tỷ lệ đẹp, bố cục thoáng đãng, các nhãn dán (tag/badge) và nút bấm được tạo hình viên thuốc tròn (`rounded-full`) thanh lịch.
4. **Phân cấp thị giác rõ ràng**: Typography kết hợp hài hòa giữa phông Serif cổ điển hoàng gia cho tiêu đề và phông Sans-serif hiện đại, thanh thoát cho dữ liệu.

---

## 2. Bảng Màu Tiêu Chuẩn (Color Palette & Tokens)

### 2.1. Màu Nhận Diện Thương Hiệu (Brand & Primary Accent)
| Tên Token | Mã HEX | Vai Trò & Vị Trí Sử Dụng |
| :--- | :--- | :--- |
| **Imperial Burgundy** (Chủ đạo) | `#5D0F12` | Tiêu đề thương hiệu, nút CTA chính (`INQUIRE NOW`), icon trọng tâm, border kích hoạt |
| **Burgundy Active** (Hover/Active) | `#4A0C0E` | Trạng thái hover và active của nút chính, liên kết đang chọn |
| **Champagne Cream** (Chữ trên nền đỏ)| `#FFFBF5` | Màu chữ trên nền nút `#5D0F12`, icon nổi |
| **Lace Dark** (Viền ren phụ) | `#D4B896` | Họa tiết phân cách, divider hoa văn cổ điển |

### 2.2. Màu Nền & Mặt Bề (Surfaces & Backgrounds)
| Tên Token | Mã HEX | Tailwind Class | Vị Trí Sử Dụng |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#FFFBF5` | `bg-[#FFFBF5]` hoặc `bg-canvas` | Nền tổng thể của toàn bộ trang |
| **Linen Section Surface** | `#FAF8F5` | `bg-[#FAF8F5]` | Khối bọc lớn (Showcase container, Saved Vendors container) |
| **Card / Surface White** | `#FFFFFF` | `bg-white` | Thẻ Card nội dung, Modal dialog, Input fields, Dropdown |
| **Glass Surface (Badge)** | `rgba(255,255,255,0.85)`| `bg-white/85 backdrop-blur-sm` | Badge phân loại danh mục, nút tim nổi trên ảnh |

### 2.3. Màu Chữ & Trung Tính (Typography & Neutrals)
| Mức Độ | Mã HEX / Tailwind | Ứng Dụng |
| :--- | :--- | :--- |
| **Ink Black** (Đậm nhất) | `#1A1A1A` / `text-neutral-900` | Tiêu đề card, nhãn filter quan trọng, số liệu lớn |
| **Brand Ink** (Nhấn thương hiệu) | `#5D0F12` | Tên Vendor trên thẻ card (`PLANORA PALACE`), tiêu đề section chính |
| **Body Dark** (Văn bản thường) | `#4A4A4A` / `text-neutral-700` | Văn bản nội dung, mô tả gói dịch vụ, nhãn form |
| **Muted Neutral** (Thông tin phụ) | `#737373` / `text-neutral-500` | Số lượt đánh giá `(32 reviews)`, khoảng giá ước tính, breadcrumbs |
| **Subtle Grey** (Mờ nhẹ) | `#A3A3A3` / `text-neutral-400` | Placeholder input, icon phụ, trạng thái disable |

### 2.4. Màu Đánh Giá, Tương Thích & Trạng Thái (Feedback & Accents)
| Loại | Mã HEX | Tailwind Class | Ứng Dụng |
| :--- | :--- | :--- | :--- |
| **Amber Gold** | `#F59E0B` | `text-amber-500 fill-amber-400` | 5 sao đánh giá uy tín |
| **Bronze Star** | `#B45309` | `text-amber-700` | Biểu tượng `✦ Match: 98%` |
| **Bookmark Rose** | `#DC2626` | `text-red-600 fill-red-600` | Nút tim đã lưu vào Shortlist |
| **Success Emerald**| `#059669` | `bg-emerald-50 text-emerald-700` | Thông báo lưu thành công, xác nhận |
| **Danger Rose** | `#BE123C` | `bg-rose-50 text-rose-700` | Nút xóa kế hoạch, cảnh báo hủy |

---

## 3. Hệ Thống Phông Chữ (Typography System)

Planora sử dụng cặp phông chữ song hành hoàn hảo:

### 3.1. Phông Chữ Tiêu Đề (Serif Display)
- **Font Family**: `"ITC Garamond Std", "EB Garamond", Garamond, serif`
- **Đặc trưng**:
  - Tên Vendor trên thẻ card: In hoa, đậm, màu `#5D0F12`, cỡ chữ `text-lg sm:text-xl font-bold uppercase tracking-wide`.
  - Tiêu đề Section chính: `text-2xl sm:text-3xl lg:text-4xl font-normal tracking-widest uppercase`.
  - Subtitle / Lời dẫn: Chữ nghiêng thanh nhã `font-serif italic text-neutral-700 text-sm sm:text-base`.

```html
<!-- Ví dụ tên Vendor chuẩn -->
<h4 
  className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wide line-clamp-1 mb-1 text-[#5D0F12]"
  style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
>
  PLANORA PALACE
</h4>
```

### 3.2. Phông Chữ Giao Diện & Dữ Liệu (Sans-serif UI)
- **Font Family**: `"Barlow", "Inter", -apple-system, BlinkMacSystemFont, sans-serif`
- **Đặc trưng**: Rõ ràng, dễ đọc trên mọi thiết bị.
  - **Badge / Tag**: `text-[10px] sm:text-xs font-semibold uppercase tracking-wider`
  - **Nút CTA**: `text-xs font-bold uppercase tracking-wider`
  - **Dòng Match / Price**: `text-xs font-medium` hoặc `text-xs font-semibold`
  - **Số liệu thống kê / Tiền tệ**: `font-mono` hoặc `font-sans font-bold`

---

## 4. Kích Thước & Tỷ Lệ Chuẩn (Layout, Radii & Spacing)

### 4.1. Quy Chuẩn Bo Góc (Border Radii Hierarchy)
| Cấp Độ Bo Góc | Giá Trị CSS | Tailwind Class | Đối Tượng Sử Dụng |
| :--- | :--- | :--- | :--- |
| **Pill (Viên thuốc)** | `9999px` | `rounded-full` | Nút bấm (INQUIRE NOW, View), Badge danh mục, Search input |
| **Standard Card** | `28px` | `rounded-[1.75rem]` | Thẻ nhà cung cấp (Vendor Card), thẻ tổng kết đám cưới |
| **Inner Media Box**| `16px` | `rounded-2xl` | Khung ảnh bên trong thẻ card, modal con |
| **Section Container**| `32px - 40px`| `rounded-[2rem]` hoặc `rounded-[2.5rem]` | Khối bọc lớn (Showcase container, Saved Vendors container) |
| **Filter / Input** | `12px - 16px`| `rounded-xl` hoặc `rounded-2xl` | Thẻ sidebar bộ lọc, modal form, input |

### 4.2. Kích Thước Thẻ Chuẩn (Standard Vendor Card Dimensions)
Mọi nơi hiển thị nhà cung cấp (Dashboard, Marketplace, Gợi ý Onboarding, Saved Vendors) **bắt buộc** áp dụng kích thước này:
- **Chiều rộng tối đa**: `w-full max-w-[310px]`
- **Chiều cao khung ảnh**: `h-52 sm:h-56`
- **Padding khung ảnh**: `p-3 pb-0` (ảnh cách mép thẻ 12px ở 3 phía)
- **Padding nội dung thân**: `p-4 sm:p-5 flex flex-col justify-between flex-1`
- **Hiệu ứng hover**: `hover:scale-[1.02] hover:shadow-xl transition-all duration-300`
- **Đổ bóng tĩnh**: `shadow-[0_10px_30px_rgba(0,0,0,0.06)]`

---

## 5. Đặc Tả Component Mẫu (Component Specifications)

### 5.1. Thẻ Nhà Cung Cấp Chuẩn (Standard Vendor Card Component)

```tsx
function VendorCard({ vendor, isSaved, onToggleShortlist, onInquire, onView }) {
  const rating = vendor.ratingAverage || 4.8;
  const reviews = vendor.totalReviews || 32;
  const categoryTag = vendor.primaryCategoryName || 'DỊCH VỤ CƯỚI';
  const matchScore = vendor.matchScore || 98;
  const priceText = vendor.priceText || 'Est: $1,500 – $2,000';

  return (
    <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 select-none origin-center w-full max-w-[310px] hover:scale-[1.02] cursor-pointer group">
      
      {/* 1. Khung ảnh trên */}
      <div className="p-3 pb-0">
        <div className="w-full h-52 sm:h-56 rounded-2xl overflow-hidden relative bg-neutral-100">
          <img
            src={vendor.imageUrl}
            alt={vendor.businessName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Tag danh mục (Pill mờ góc trái) */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/85 text-neutral-800 backdrop-blur-sm shadow-sm uppercase tracking-wider">
            {categoryTag}
          </span>

          {/* Nút tim yêu thích (Pill mờ góc phải) */}
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
        
        {/* Hàng sao đánh giá */}
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-500">
              {/* 5 sao hổ phách */}
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-neutral-700">({rating.toFixed(1)})</span>
          </div>
          <span className="text-[11px] text-neutral-400">({reviews} reviews)</span>
        </div>

        {/* Tên Vendor Serif */}
        <h4
          className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wide line-clamp-1 mb-1"
          style={{ color: '#5D0F12', fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
        >
          {vendor.businessName}
        </h4>

        {/* Độ tương thích & Mức giá */}
        <div className="space-y-0.5 mb-4">
          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-800">
            <span className="text-amber-700 text-xs">✦</span>
            <span>Match: {matchScore}%</span>
          </div>
          <p className="text-xs text-neutral-600 font-medium">{priceText}</p>
        </div>

        {/* 3. Bộ đôi nút bấm dạng viên thuốc */}
        <div className="flex items-center gap-2 pt-1">
          {/* Nút chính: Đỏ mận đậm chữ kem */}
          <button
            onClick={onInquire}
            className="flex-1 py-2 px-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-sm hover:opacity-95 active:scale-95 cursor-pointer !text-[#FFFBF5]"
            style={{ backgroundColor: '#5D0F12', color: '#FFFBF5' }}
          >
            INQUIRE NOW
          </button>

          {/* Nút phụ: Nền trắng viền mảnh */}
          <button
            onClick={onView}
            className="py-2 px-4 rounded-full text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 text-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            View
          </button>
        </div>

      </div>
    </div>
  );
}
```

---

### 5.2. Hệ Thống Nút Bấm Chuẩn (Button Style Matrix)

```tsx
/* 1. Primary Button (Hành động chính, Đặt dịch vụ, Gửi yêu cầu) */
className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-center transition-all shadow-sm hover:opacity-95 active:scale-95 cursor-pointer !text-[#FFFBF5] bg-[#5D0F12]"

/* 2. Secondary Button (Xem chi tiết, Hủy bỏ, Đóng) */
className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 text-center transition-all shadow-sm active:scale-95 cursor-pointer"

/* 3. Danger / Delete Button (Xóa kế hoạch, Xóa mục chi phí) */
className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"

/* 4. Filter Clear Button */
className="text-[10px] text-neutral-500 hover:text-[#5D0F12] hover:underline cursor-pointer font-medium"
```

---

### 5.3. Khối Container Bao Bọc Lớn (Section Containers)
Dùng cho khu vực danh sách như **Saved Vendors**, **Marketplace Grid**, **Blueprint Steps**:

```tsx
<div className="bg-[#FAF8F5] border border-neutral-200/60 rounded-[2rem] p-6 sm:p-8 shadow-xs">
  {/* Header Section */}
  <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200/80">
    <h3 
      className="text-xl sm:text-2xl font-normal uppercase tracking-widest text-[#5D0F12]"
      style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
    >
      TIÊU ĐỀ KHỐI NỘI DUNG
    </h3>
  </div>

  {/* Nội dung lưới thẻ Card */}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
    {/* Các thẻ VendorCard max-w-[310px] */}
  </div>
</div>
```

---

## 6. Bảng Tra Cứu Nhanh Cho Lập Trình Viên (Developer Quick Reference)

| Muốn làm gì? | Sử dụng cấu trúc class nào? |
| :--- | :--- |
| **Nền trang chính** | `min-h-screen bg-[#FFFBF5] text-neutral-800 font-sans` |
| **Khối bọc danh sách** | `bg-[#FAF8F5] border border-neutral-200/60 rounded-[2rem] p-6 shadow-xs` |
| **Thẻ Card chuẩn** | `bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-xl w-full max-w-[310px]` |
| **Nút bấm chính** | `bg-[#5D0F12] text-[#FFFBF5] rounded-full py-2 px-4 text-xs font-bold uppercase tracking-wider` |
| **Nút bấm phụ** | `bg-white border border-neutral-300 text-neutral-800 rounded-full py-2 px-4 text-xs font-semibold` |
| **Badge danh mục trên ảnh**| `bg-white/85 text-neutral-800 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider` |
| **Tiêu đề Serif đỏ mận** | `font-serif font-bold uppercase tracking-wide text-[#5D0F12]` |
| **Ngôi sao đánh giá** | `w-3.5 h-3.5 fill-amber-400 text-amber-400` |
| **Chỉ số Match** | `<span className="text-amber-700">✦</span> Match: {score}%` |
| **Checkbox bộ lọc** | `accent-[#5D0F12] text-[#5D0F12] focus:ring-[#5D0F12] rounded` |

---

## 7. Các Điều Nghiêm Cấm Khi Thiết Kế (Design Don'ts)

1. ❌ **Không dùng nền đỏ sẫm chiếm trọn màn hình**: Tránh việc lặp lại lỗi trước đây của Marketplace (khối đỏ `#5D0F12` bao trùm toàn bộ lưới card gây tối và chìm ảnh).
2. ❌ **Không dùng phông chữ uốn lượn (Script) cho các thông tin quan trọng**: Phông Script chỉ dùng cho tên cô dâu chú rể hoặc điểm xuyết nghệ thuật thiệp cưới, tuyệt đối không dùng cho tên vendor hay thông số giá.
3. ❌ **Không dùng góc vuông (`rounded-none`) hoặc bo góc quá nhọn (`rounded-sm`)** cho các thành phần chính: Toàn bộ thẻ card phải đạt độ mềm mại `rounded-[1.75rem]`, nút bấm luôn là `rounded-full`.
4. ❌ **Không tự ý đổi kích thước thẻ vendor**: Mọi trang cần hiển thị vendor đều dùng chung chuẩn `max-w-[310px]` để giữ trải nghiệm đồng nhất từ Dashboard sang Marketplace.
5. ❌ **Không dùng viền đen đậm thô ráp**: Luôn dùng viền mờ tinh tế `border-neutral-100`, `border-neutral-200/60` hoặc `border-hairline`.

---
*Tài liệu này là quy chuẩn thiết kế chính thức của Planora, áp dụng cho tất cả các trang: Dashboard, Marketplace, Onboarding Blueprint, Budget, Checklist và Timeline.*
