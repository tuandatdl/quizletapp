# Tú Trinh Language Worker

Cloudflare Worker này là cổng công khai duy nhất từ GitHub Pages tới Workers AI. Worker không lưu từ vựng hay hồ sơ người dùng.

## Endpoints

- `POST /v1/vocabulary/enrich`: tối đa 25 từ/cụm từ mỗi batch.
- `POST /v1/translate`: dịch đoạn đọc hoặc phần văn bản được chọn sang tiếng Việt.

Browser chỉ gửi trường dữ liệu có cấu trúc; Worker tự tạo prompt, giới hạn kích thước, kiểm tra origin, áp rate limit và validate lại output của model.

## Cấu hình

1. Cài Wrangler trong thư mục này: `npm install`.
2. Đặt `ALLOWED_ORIGINS` thành origin GitHub Pages thật, ví dụ `https://USERNAME.github.io`. Có thể phân tách nhiều origin bằng dấu phẩy.
3. Giữ AI binding tên `AI`. Có thể thêm Rate Limiting binding tên `RATE_LIMITER`.
4. Chạy `npm run dev`, sau đó `npm run deploy` khi operator đã đăng nhập Cloudflare.

Không đưa API token hoặc secret vào frontend. URL Worker là public và được đặt trong `VITE_LANGUAGE_API_URL` ở GitHub Actions.
