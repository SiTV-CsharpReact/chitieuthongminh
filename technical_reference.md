# Tài liệu Kỹ thuật & Giao diện Zenith

Tài liệu này tổng hợp các chức năng đã triển khai, cấu trúc màu sắc và các chỉ số kỹ thuật để thuận tiện cho việc quản lý và phát triển sau này.

## 1. Các Chức Năng Chính (Implemented Features)

### 📂 Quản lý Nội dung (Admin CMS)
- **Quản lý Thẻ Tín dụng (AdminCards)**:
    - CRUD (Thêm/Sửa/Xóa) thông tin thẻ ngân hàng.
    - Quy tắc hoàn tiền (Cashback Rules) theo từng danh mục chi tiêu.
    - Tìm kiếm và lọc theo Ngân hàng.
    - Phân trang linh hoạt (mặc định 10 dòng, có tùy chọn "Hiện tất cả").
- **Quản lý Danh mục (AdminCategories)**:
    - CRUD các danh mục chi tiêu với mã màu HEX tùy chỉnh.
    - Đồng bộ màu sắc hiển thị trên toàn hệ thống.
- **Quản lý Bài viết (AdminArticles)**:
    - Tích hợp trình soạn thảo bài viết chuyên nghiệp **TinyMCE** (đã xác thực API Key).
    - Tự động tạo Slug (URL SEO) từ tiêu đề.
    - Quản lý trạng thái bài viết, danh mục và ảnh bìa.

### 🌐 Cổng thông tin Tin tức (Zenith News Portal)
- **Trang chủ Tin tức (/news)**:
    - Giao diện cao cấp (Zenith Design) với hiệu ứng Glassmorphism.
    - Hero section nổi bật với badge "Xu hướng" (Trending).
    - Lọc bài viết linh hoạt theo danh mục linh động từ database.
- **Chi tiết bài viết (/news/:id)**:
    - Chế độ đọc tập trung (Readability-focused) sử dụng Tailwind Prose.
    - Hiển thị nội dung rich-text từ TinyMCE chính xác.

### 🔐 Hệ thống & Bảo mật
- **Admin Guard**: Bảo vệ tất cả các route `/admin/*`, yêu cầu đăng quyền quản trị.
- **Dockerized MongoDB**: Toàn bộ dữ liệu được lưu trữ trong container Docker để đảm bảo tính nhất quán (Cổng 27017).

---

## 2. Bảng Mã Màu (Color Palette)

Hệ thống sử dụng bảng màu **Tailwind CSS** tùy chỉnh, tập trung vào tông Xanh lá (Green) cho sự thịnh vượng và Slate cho sự hiện đại.

### 🟢 Màu Chính (Primary - Green)
| Cấp độ | Mã Màu (HEX) | Sử dụng |
| :--- | :--- | :--- |
| **Primary 500** | `#22c55e` | Màu chủ đạo (Nút, Badge, Highlight) |
| **Primary 400** | `#4ade80` | Hiệu ứng Hover, Gradient |
| **Primary 600** | `#16a34a` | Màu active, viền tối |

### 🌑 Màu Nền (Slate - Neutral)
| Cấp độ | Mã Màu (HEX) | Sử dụng |
| :--- | :--- | :--- |
| **Slate 50** | `#f8fafc` | Nền trang chế độ Light |
| **Slate 900** | `#0f172a` | Nền thẻ (Card), Sidebar |
| **Slate 950** | `#020617` | Nền trang chế độ Dark |
| **Slate 400** | `#94a3b8` | Văn bản phụ, placeholder |

### ✨ Hiệu ứng Đặc biệt (Special FX)
- **Glassmorphism**: `rgba(255, 255, 255, 0.03)` + `backdrop-filter: blur(12px)`.
- **Card Gradient**: `linear-gradient(180deg, #0f172a99 0%, #020617cc 100%)`.
- **Text Shimmer**: Gradient xanh lá kết hợp chuyển động lấp lánh (dùng cho tiêu đề cao cấp).

---

## 3. Thông số Kỹ thuật khác
- **Font chữ**: Manrope, sans-serif (Google Fonts).
- **Icons**: Material Symbols Outlined.
- **Backend API**: `http://127.0.0.1:5169/api`.
- **Database**: MongoDB (CreditCards, Articles, Categories, Spending).

---
*Tài liệu được cập nhật tự động bởi Antigravity AI.*
