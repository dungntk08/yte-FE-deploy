# Hướng dẫn Triển khai Production (Deployment Guide)

Hệ thống đã được cấu hình để triển khai linh hoạt trên môi trường Production bằng Docker.

## Các file quan trọng
- **`docker-compose.yml`**: File cấu hình chính, sử dụng biến môi trường.
- **`.env.docker`**: File mẫu cấu hình môi trường (cần đổi tên thành `.env` khi chạy).
- **`duoc_dump.sql`**: File dữ liệu khởi tạo.

## Các bước triển khai

1.  **Chuẩn bị mã nguồn**:
    Copy toàn bộ project lên server.

2.  **Cấu hình Environment**:
    Trên Server, tại thư mục gốc của dự án:
    ```bash
    cp .env.docker .env
    ```
    Mở file `.env` và chỉnh sửa các thông số quan trọng:
    - `APP_ENV=production`
    - `APP_URL=http://your-domain.com`
    - `DB_PASSWORD`: Mật khẩu cho Database MySQL nội bộ.
    - **Kết nối SQL Server**: Điền thông tin vào các biến `DB_SQLSRV_*` nếu cần kết nối CSDL ngoài (Ví dụ: 42.96.40.232).

3.  **Khởi chạy**:
    ```bash
    docker-compose up -d --build
    ```

4.  **Kiểm tra & Vận hành**:
    - Truy cập Website theo domain/IP đã cấu hình.
    - Container Database sẽ tự động import `duoc_dump.sql` lần đầu tiên.

## Lưu ý Bảo mật
- Đảm bảo không commit file `.env` chứa mật khẩu thực lên Git.
- Nên thiết lập Firewall chỉ mở port 80/443 (Web) và đóng port 3307 (Database) ra ngoài internet nếu không cần thiết.
