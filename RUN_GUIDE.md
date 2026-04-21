# Hướng dẫn chạy dự án CredBack

Tài liệu này tổng hợp các câu lệnh cần thiết để khởi chạy toàn bộ hệ thống (Database, Backend, Frontend).

## 1. Yêu cầu hệ thống
Đảm bảo bạn đã cài đặt:
- [Docker](https://www.docker.com/products/docker-desktop/) (để chạy MongoDB)
- [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (để chạy frontend)

---

## 2. Các bước khởi chạy

### Bước 1: Chạy Database (MongoDB)
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
docker-compose up -d
```
*Lưu ý: Đảm bảo Docker Desktop đang chạy.*

### Bước 2: Chạy Backend (ASP.NET Core)
Mở một terminal mới, di chuyển vào thư mục `backend` và chạy:
```bash
cd backend
dotnet watch
```
*(`dotnet watch` sẽ tự động tải lại mỗi khi bạn thay đổi code)*
- **API URL:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/swagger`

### Bước 3: Chạy Frontend (React + Vite)
Mở thêm một terminal nữa, di chuyển vào thư mục `client` và chạy:
```bash
cd client
npm install   # Nếu là lần đầu chạy
npm run dev
```
- **Frontend URL:** `http://localhost:5173` (mặc định của Vite)

---

## 3. Một số lưu ý
- Nếu backend báo lỗi không kết nối được database, hãy kiểm tra xem container `chitieuthongminh_db` trong Docker đã ở trạng thái **Running** chưa.
- Token JWT và các cấu hình bảo mật khác nằm trong `backend/appsettings.json`.
