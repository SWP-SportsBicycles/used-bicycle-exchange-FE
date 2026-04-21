## FE Team Working Agreement (3 người) — SportsBicyclesExchange

**Mục tiêu**: team FE làm nhanh, ít lệch BE, tránh “demo logic” lọt vào production.  
**Nguồn chuẩn**: Swagger BE + các plan trong `docs/` + Git workflow chuẩn tại `docs/git-workflow.md`.

---

## Ownership & boundaries (không dẫm chân nhau)

- **Đạt (Lead)**: foundation + public + buyer  
  - Sở hữu: `src/lib/api/http.ts`, `src/lib/api/queryClient.ts`, `src/lib/api/buyer-api.ts`, buyer queries/hooks/screens/routes.
- **Vũ**: auth + seller  
  - Sở hữu: `src/lib/api/auth-api.ts`, `src/lib/api/seller-api.ts`, auth screens/routes, seller module/routes.
- **Trí**: admin + inspector + chatbot  
  - Sở hữu: `src/lib/api/admin-api.ts`, `src/lib/api/inspector-api.ts`, `src/lib/api/chat-api.ts`, admin/inspector modules/routes, `ChatWidget`.

**Rules**:
- Không sửa file “không thuộc ownership” nếu không tag owner trong PR.
- Mọi API call phải đi qua `src/lib/api/http.ts` (không `fetch()` trực tiếp trong screen).

---

## Environments & accounts seeding (để test E2E không bị nghẽn)

### Admin account (đã có)

- **Email**: `admin@sportsbicycles.com`
- **Password**: `Admin@123`
- **Role**: `ADMIN`

### OTP là email thật (quy ước bắt buộc)

- **Mỗi dev dùng 1 inbox riêng** (không share 1 email để tránh giẫm OTP).
- Test nhiều role: dùng **mỗi role 1 browser profile** (Chrome profile A/B/C) để tránh cookie refreshToken và accessToken chồng nhau.

### Seed inspector accounts (bằng Admin)

Swagger endpoint:
- `POST /api/AdminAccount/admin/create-inspector`

Tạo tối thiểu:
- `inspector1@...` (Trí dùng)
- `inspector2@...` (backup)

### Seed buyer/seller accounts (mỗi dev tự tạo)

Flow (Swagger):
- `POST /api/Auth/signup`
- `POST /api/Auth/verify-otp`
- `POST /api/Auth/signin`
- `GET /api/Auth/me`

---

## API contract rules (khớp Swagger)

### Auth/session rules

- Mọi request cần cookie refresh token phải dùng `credentials: "include"` (đặc biệt `renew-token`, `logout`).
- Access token lưu `localStorage` và gửi qua `Authorization: Bearer <token>`.
- `POST /api/Auth/logout` có tham số cookie `refreshToken` (Swagger) → nếu không có cookie thì coi như “đã logout client-side”.

### Endpoint list (core)

- **Auth**:  
  - `POST /api/Auth/signup`, `POST /api/Auth/verify-otp`, `POST /api/Auth/resend-otp`  
  - `POST /api/Auth/signin`, `GET /api/Auth/me`, `POST /api/Auth/renew-token`, `POST /api/Auth/logout`
- **Buyer listing**: `GET /api/buyer-listing`, `GET /api/buyer-listing/{listingId}`, `GET /api/buyer-listing/search`
- **Buyer order**: `POST /api/buyer-order`, `POST /api/buyer-order/{orderId}/paid`
- **Wishlist**: `GET /api/wishlist`, `POST /api/wishlist/{bikeId}`, `DELETE /api/wishlist/{bikeId}`
- **Shipment**: `POST/GET /api/buyer-shipment/{orderId}`, `POST /api/buyer-shipment/sync/{orderId}`
- **Seller listing**:  
  - `GET/POST /api/seller-listing`  
  - `GET/PUT/DELETE /api/seller-listing/{listingId}`  
  - `POST /api/seller-listing/{listingId}/submit`, `POST /api/seller-listing/{listingId}/withdraw`
- **Admin listing**: `POST /api/admin-listing/{listingId}/approve`, `POST /api/admin-listing/{listingId}/reject`
- **Inspector**: `GET /api/inspector/pending`, `GET /api/inspector/{orderId}`, `POST /api/inspector/{orderId}/submit`, `GET /api/inspector/history`, `GET /api/inspector/history/{inspectionId}`
- **Chat**: `POST /api/Chat`
- **Upload**: `POST /api/Upload/image`, `POST /api/Upload/video`, `POST /api/Upload/file`

### Error handling chuẩn (ProblemDetails)

BE dùng kiểu lỗi dạng **ProblemDetails** (RFC7807). Quy ước FE:
- Nếu response có `errors` (object `{ field: [messages...] }`) → map vào form errors (React Hook Form `setError`).
- Nếu không có `errors` → show toast theo `detail/title/message`.
- Không hardcode string lỗi theo endpoint; luôn parse từ payload.

---

## Git workflow (đủ chặt để tránh merge demo)

Quy chuẩn đầy đủ cho toàn bộ nhánh/commit/PR/merge nằm tại `docs/git-workflow.md`. Mục dưới đây là bản rút gọn theo ngữ cảnh FE team.

### Branch naming

- `feat/buyer-<short>`
- `feat/auth-<short>`
- `feat/admin-<short>`
- `fix/<short>`

### PR checklist (bắt buộc)

- Không còn dependency vào mock data trong screen/hook (trừ khi có flag dev rõ ràng).
- API calls đi qua `src/lib/api/*-api.ts` + `src/lib/api/http.ts`.
- Có `loading / error / empty` state (tối thiểu).
- Query keys consistent + invalidate đúng phạm vi.
- Nếu chạm `src/lib/api/http.ts` hoặc auth foundation → owner review bắt buộc.

### GitNexus / impact — khi nào bắt buộc (team nhỏ: đủ an toàn, không “xiềng” quá)

- **Bắt buộc** chạy `gitnexus impact` (upstream) trước khi merge nếu PR đụng tới: `src/lib/api/http.ts`, `src/lib/auth/**`, refactor đổi chữ ký hàm xuyên module, guard/RBAC dùng chung, hoặc đổi contract dùng chung (normalize lỗi, base URL, token).
- **Không bắt buộc** cho: chỉnh copy, layout/spacing, icon/ảnh, component UI cục bộ trong 1–2 file **mà không** đổi luồng API hoặc import từ `http.ts`/auth.
- Impact trả **HIGH/CRITICAL** (nhiều d=1 hoặc đường auth/payment): **không tự merge** — tag owner foundation + ghi blast radius ngắn trong mô tả PR.

### Kích thước PR (để ai cũng “tung hoành” mà không phá repo)

- Ưu tiên **một vertical slice**: màn hình + hook/query + route; nếu cần guard thì cùng PR (cùng domain).
- Tránh gom “chuẩn hoá production” nhiều module trong một PR; nếu diff > ~300–400 dòng hoặc chạm >5 file lõi API → **tách PR** hoặc đánh dấu cần review kỹ trước merge.

---

## E2E smoke checklist (manual, chạy mỗi lần trước demo)

### Auth

- Sign in (admin/buyer/seller/inspector) → `GET /api/Auth/me` OK  
- Hết token → `POST /api/Auth/renew-token` tự refresh (không văng khỏi app)

### Buyer

- Marketplace list + search
- PDP load detail
- Wishlist add/remove
- Create order (`POST /api/buyer-order`)
- Mark paid (`POST /api/buyer-order/{orderId}/paid`)

### Seller

- Create listing + upload image
- Submit listing
- Withdraw listing (khi hợp lệ)

### Admin

- Approve listing
- Reject listing (có reason)
- Create inspector account

### Inspector

- Pending list
- View assignment detail
- Submit report
- History list + detail

