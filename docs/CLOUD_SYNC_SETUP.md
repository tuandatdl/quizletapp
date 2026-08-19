# HƯỚNG DẪN THIẾT LẬP SUPABASE CLOUD SYNC CHO TÚ TRINH LANGUAGE

Tài liệu này hướng dẫn chi tiết từng bước cho Quản trị viên (Operator) để kích hoạt tính năng **Đồng bộ đám mây đa thiết bị (Multi-Device Cloud Sync)** cho ứng dụng **TÚ TRINH LANGUAGE** bằng Supabase.

---

## 1. Tổng quan Kiến trúc (Architecture)

- **Nguyên lý Local-First**: Dữ liệu được lưu trữ trực tiếp trên IndexedDB của trình duyệt. Ứng dụng hoạt động mượt mà ngay cả khi offline hoặc chưa đăng nhập.
- **Supabase Backend**:
  - **Supabase Auth**: Xác thực người dùng bằng Email Magic Link (hoặc OTP), không cần lưu mật khẩu thô.
  - **Supabase Postgres Database**: Lưu trữ dữ liệu đồng bộ dạng hàng (`user_sync_records`, `user_sync_state`).
  - **Row Level Security (RLS)**: Bắt buộc 100%. Người dùng chỉ có quyền đọc/ghi/xóa dữ liệu của chính mình (`auth.uid() = user_id`).
- **An toàn Bảo mật (Security)**:
  - Chỉ sử dụng `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (Public Anon Key) trong frontend.
  - **TUYỆT ĐỐI KHÔNG** dùng `service_role` key trong frontend hoặc đẩy lên GitHub.

---

## 2. Các bước triển khai cho Operator

### Bước 1: Tạo dự án trên Supabase
1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập.
2. Nhấp **"New project"**, chọn Organization và đặt tên dự án (ví dụ: `tu-trinh-language`).
3. Chọn khu vực máy chủ (Region) gần nhất (ví dụ: `Singapore - ap-southeast-1`).
4. Đặt mật khẩu cơ sở dữ liệu và bấm **"Create new project"**.

---

### Bước 2: Lấy thông tin kết nối Public
1. Vào **Project Settings** -> **API**.
2. Sao chép 2 giá trị:
   - **Project URL**: Ví dụ `https://xyzcompany.supabase.co`
   - **Project API keys** -> `anon` / `public`: Chuỗi JWT public key bắt đầu bằng `eyJ...`

---

### Bước 3: Chạy SQL Migration
1. Vào mục **SQL Editor** trong bảng điều khiển Supabase.
2. Nhấp **"New query"**.
3. Mở file migration [`supabase/migrations/20260819000000_cloud_sync.sql`](../supabase/migrations/20260819000000_cloud_sync.sql), copy toàn bộ nội dung và dán vào SQL Editor.
4. Bấm **"Run"** (hoặc `Ctrl + Enter` / `Cmd + Enter`).
5. Kiểm tra kết quả: Đã tạo 2 bảng `user_sync_records`, `user_sync_state` cùng các chỉ mục (Indexes) và chính sách RLS.

---

### Bước 4: Kiểm tra Row Level Security (RLS)
1. Vào **Authentication** -> **Policies** (hoặc **Table Editor**).
2. Đảm bảo cả hai bảng `user_sync_records` và `user_sync_state` đều hiển thị trạng thái:
   - **RLS Enabled** (Màu xanh).
   - 4 chính sách: `SELECT`, `INSERT`, `UPDATE`, `DELETE` với điều kiện `auth.uid() = user_id`.

---

### Bước 5: Cấu hình Auth & URL Chuyển hướng (Redirect URLs)
1. Vào **Authentication** -> **URL Configuration**.
2. **Site URL**: Nhập URL production của GitHub Pages:
   ```
   https://tuandatdl.github.io/quizletapp/
   ```
3. **Redirect URLs**: Bấm **"Add URL"** và thêm các URL sau:
   - `https://tuandatdl.github.io/quizletapp/`
   - `https://tuandatdl.github.io/quizletapp/**`
   - `http://localhost:5173/**`
   - `http://localhost:3000/**`
4. Bấm **"Save"**.

---

### Bước 6: Cấu hình biến môi trường trên GitHub Repository
Để GitHub Actions tự động nhúng các biến public vào gói build GitHub Pages:
1. Truy cập Repository GitHub: [https://github.com/tuandatdl/quizletapp](https://github.com/tuandatdl/quizletapp)
2. Vào **Settings** -> **Secrets and variables** -> **Actions** -> tab **Variables**.
3. Thêm 2 biến:
   - Name: `VITE_SUPABASE_URL`, Value: URL từ Bước 2.
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: Anon key từ Bước 2.

---

### Bước 7: Kích hoạt triển khai (Deploy)
1. Vào tab **Actions** trên GitHub, chọn workflow **"Deploy static edition to GitHub Pages"**.
2. Nhấp **"Run workflow"** (hoặc push commit mới lên nhánh `main`).
3. Đợi workflow hoàn thành thành công.

---

## 3. Kịch bản kiểm thử nghiệm thu 2 thiết bị (Two-Device Acceptance Test)

Sau khi cấu hình xong, thực hiện kiểm thử theo các bước:

1. **Thiết bị A (Máy tính / Trình duyệt 1)**:
   - Truy cập `https://tuandatdl.github.io/quizletapp/#/settings`.
   - Nhập email -> Bấm **"Gửi liên kết đăng nhập"**.
   - Mở email và bấm link xác nhận.
   - Thêm 4 từ vựng: `go`, `car`, `live`, `total`.
   - Vào Settings bấm **"Đồng bộ ngay"** -> Ghi nhận trạng thái *"✓ Đã đồng bộ"*.

2. **Thiết bị B (Điện thoại / Trình duyệt 2 - Ẩn danh)**:
   - Truy cập `https://tuandatdl.github.io/quizletapp/#/settings`.
   - Đăng nhập bằng cùng email ở Bước 1.
   - Mở màn hình **Kho từ vựng**: 4 từ `go`, `car`, `live`, `total` xuất hiện đầy đủ!
   - Thêm từ mới `apple` trên Thiết bị B -> Đồng bộ.

3. **Kiểm tra đồng bộ ngược (B -> A)**:
   - Trên Thiết bị A, tải lại trang hoặc bấm **"Đồng bộ ngay"**.
   - Từ `apple` xuất hiện trên Thiết bị A.

4. **Kiểm tra xóa có Tombstone**:
   - Xóa từ `car` trên Thiết bị A -> Đồng bộ.
   - Trên Thiết bị B bấm đồng bộ -> Từ `car` được xóa đồng bộ trên Thiết bị B.

---

## 4. Hỗ trợ sự cố thường gặp (Troubleshooting)

- **Không nhận được email Magic Link**: Kiểm tra mục thư rác (Spam) hoặc kiểm tra cấu hình Rate Limit Email trong Supabase (`Authentication -> Rate Limits`).
- **Sau khi bấm link email bị lỗi trang**: Kiểm tra mục Redirect URLs ở Bước 5 xem đã có `https://tuandatdl.github.io/quizletapp/**` chưa.
- **Ứng dụng báo "Khác tài khoản" (ACCOUNT_MISMATCH)**: Đây là cơ chế bảo vệ của TÚ TRINH LANGUAGE để ngăn việc tải đè dữ liệu của Người dùng A vào tài khoản Người dùng B khi dùng chung trình duyệt. Hãy bấm **"Đăng xuất"** hoặc xóa dữ liệu cục bộ trước khi đăng nhập tài khoản khác.
