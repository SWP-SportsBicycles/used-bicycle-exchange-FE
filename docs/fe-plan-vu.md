# 👤 Vũ — Auth + Seller

**Mục tiêu:** Xây dựng toàn bộ hệ thống xác thực (đăng ký, đăng nhập, OTP, quên mật khẩu, Google login) và toàn bộ trải nghiệm Seller — từ đăng tin bán xe, upload ảnh/video, **cập nhật thông tin ngân hàng**, đến **quản lý đơn hàng đặt mua xe của mình** (xác nhận đóng gói trong 12h, theo dõi tracking GHN).

> **Nghiệp vụ tham chiếu:** [01-order-and-payment-rules.md](../01-order-and-payment-rules.md) | [business-spec.md](../business-spec.md) | [03-platform-policy.md](../03-platform-policy.md)

> **⚠️ LƯU Ý QUAN TRỌNG:** Nghiệp vụ mới **CẤM chỉnh sửa bài đăng** sau khi Published. Seller chỉ có quyền Ẩn (withdraw) hoặc Xóa. **Không còn trang Edit Listing**.

---

## Màn hình & Component cần build

| # | Màn hình | Route | Độ phức tạp |
|---|---------|-------|-------------|
| 1 | Login | `/auth/login` | 🟢 |
| 2 | Register (chọn role Buyer/Seller) | `/auth/register` | 🟡 |
| 3 | OTP Verification | `/auth/verify-otp` | 🟢 |
| 4 | Forgot Password | `/auth/forgot-password` | 🟢 |
| 5 | Reset Password | `/auth/reset-password` | 🟢 |
| 6 | Create Listing (form + upload ảnh/video) | `/seller/listings/new` | 🔴 |
| 7 | My Listings (list + status) | `/seller/listings` | 🟡 |
| 8 | Listing Detail (seller view — preview, KHÔNG CÓ EDIT) | `/seller/listings/[id]` | 🟡 |
| 9 | **⭐ Seller Orders (Quản lý đơn hàng đặt mua xe)** | `/seller/orders` | 🔴 |
| 10 | **⭐ Seller Order Detail (Confirm đóng gói + Tracking)** | `/seller/orders/[id]` | 🔴 |
| 11 | **⭐ Profile + Bank Info** | `/seller/profile` | 🟡 |

---

## Danh sách công việc

### Sprint 1 — Auth (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| V1 | Login page | Form email + password, submit gọi `POST /api/Auth/signin`, lưu accessToken vào localStorage, redirect `/` | 3h | Đạt D1 (http.ts) |
| V2 | Register page | Form fullName + email + phone + password + role (Buyer=1/Seller=2), gọi `POST /api/Auth/signup`, redirect `/auth/verify-otp` | 3h | V1 |
| V3 | OTP Verification page | Form 6 chữ số, gọi `POST /api/Auth/verify-otp` {email, otp}. Nút "Gửi lại" gọi `POST /api/Auth/resend-otp`. Timer 60s | 3h | V2 |
| V4 | Google Login button | Trên Login + Register: nút "Đăng nhập bằng Google", gọi `POST /api/Auth/google-login` {idToken, role}. Cần setup Google OAuth client | 3h | V1 |
| V5 | Seller Create Listing — Form cơ bản | Form với tất cả fields: title, description, serialNumber, category, brand, frameSize, frameMaterial, condition, paint, groupset, operating, tireRim, brakeType, overall, **price (Đây là "Giá đề nghị" — hệ thống tự động cộng 5% thành Giá niêm yết)**, city. Validation Zod | 4h | V1 |
| V6 | Seller Create Listing — Media Upload | Component `ImageUploader.tsx` + `VideoUploader.tsx`: multi-image upload + **BẮT BUỘC ≥1 video quay quanh xe**. Gọi `POST /api/Upload/image` và `POST /api/Upload/video` lấy URL, quản lý medias array. Submit toàn bộ gọi `POST /api/seller-listing` | 4h | V5 |

### Sprint 2 — Seller Listing & Order Management (4 ngày) ⭐ LUỒNG MỚI QUAN TRỌNG

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| V7 | My Listings page | Table/card list với status badge (draft / pending_review / published / locked / sold / rejected / withdrawn), pagination. `GET /api/seller-listing`. **KHÔNG CÓ nút Edit** cho tin đã Published. | 3h | V5 |
| V8 | Listing Detail — Seller view | `GET /api/seller-listing/{id}`: xem chi tiết tin đã đăng, preview giống Buyer thấy. Hiện action buttons: "Gửi duyệt" (draft), "Ẩn tin" (published), "Xóa" (draft/rejected). **KHÔNG CÓ nút Sửa** khi đã Published. | 3h | V7 |
| V9 | Submit for review + Withdraw + Delete | Nút "Gửi duyệt": `POST /api/seller-listing/{id}/submit`. Nút "Ẩn tin": `POST /api/seller-listing/{id}/withdraw`. Nút "Xóa": `DELETE /api/seller-listing/{id}`. Confirm dialog. | 2h | V7 |
| V10 | **⭐ Seller Orders — Danh sách đơn đặt mua xe** | Route `/seller/orders`. Table hiển thị: tên buyer, tiêu đề xe, mã vận đơn GHN, trạng thái, ngày đặt, tổng tiền. Gọi `GET /api/seller/orders`. Filter theo trạng thái. | 4h | V5 |
| V11 | **⭐ Seller Order Detail — Xác nhận đóng gói** | Route `/seller/orders/[id]`. Hiện thông tin buyer + xe + tracking GHN. **NÚT QUAN TRỌNG: "Sẵn sàng giao hàng"** → gọi `POST /api/seller/orders/{id}/confirm-ready`. Hiện cảnh báo **SLA 12 tiếng** ("Bạn cần xác nhận trong vòng 12h, nếu không đơn sẽ bị hủy"). | 4h | V10 |
| V12 | **⭐ Seller Order — Tracking GHN** | Trong Order Detail: component hiển thị step-by-step trạng thái vận chuyển GHN (picking_up → in_transit → delivered → completed). Waybill code dùng để kiểm tra trên web GHN. | 2h | V11 |

### Sprint 3 — Auth bổ sung + Profile + Bank (3 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| V13 | Forgot Password page | Form email, gọi `POST /api/Auth/forgot-password`, hiện thông báo "Đã gửi link reset qua email" | 2h | V1 |
| V14 | Reset Password page | Form newPassword + confirmPassword, lấy `token` từ query string, gọi `POST /api/Auth/reset-password-by-link?token=xxx` | 2h | V13 |
| V15 | **⭐ Profile + Bank Info** | `GET /api/Auth/me` hiển thị thông tin user, avatar upload. **PHẦN MỚI: Form nhập Thông Tin Ngân Hàng** (`bankAccountName`, `bankAccountNumber`, `bankName`) → gọi `POST /api/seller/profile/bank-info`. Hiện **warning nếu chưa điền bank info:** "Bạn cần cập nhật thông tin ngân hàng trước khi đăng bán xe." | 4h | V1 |
| V16 | Auth guard middleware | File `src/middleware.ts`: redirect `/auth/login` nếu chưa login. Check role phù hợp cho `/buyer/*`, `/seller/*`. | 2h | Đạt D2 |
| V17 | Polish + Bug fix | Responsive auth forms, loading states, error toast. **Kiểm tra flow SLA 12h hiển thị đúng** | 2h | All |

---

## Hướng dẫn triển khai

### Cấu trúc folder

```
src/app/auth/
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
├── verify-otp/
│   └── page.tsx
├── forgot-password/
│   └── page.tsx
└── reset-password/
    └── page.tsx

src/app/(seller)/seller/
├── layout.tsx                     ← Seller sidebar/nav layout
├── listings/
│   ├── page.tsx                   ← My Listings
│   ├── new/
│   │   └── page.tsx               ← Create Listing
│   └── [id]/
│       └── page.tsx               ← Listing Detail (CẤM EDIT — chỉ view + actions)
├── orders/                        ← ⭐ MỚI
│   ├── page.tsx                   ← Seller Orders (đơn đặt mua xe)
│   └── [id]/
│       └── page.tsx               ← Order Detail + Confirm Đóng Gói + Tracking
└── profile/
    └── page.tsx                   ← Profile + Bank Info

src/modules/seller/
├── screens/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── OtpScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── ResetPasswordScreen.tsx
│   ├── SellerListingsScreen.tsx
│   ├── SellerListingDetailScreen.tsx
│   ├── SellerListingFormScreen.tsx     ← Chỉ dùng cho Create (KHÔNG CÓ Edit)
│   ├── SellerOrdersScreen.tsx          ← ⭐ MỚI
│   ├── SellerOrderDetailScreen.tsx     ← ⭐ MỚI
│   └── ProfileScreen.tsx              ← ⭐ MỚI: Bổ sung Bank Info
├── components/
│   ├── ListingForm.tsx                ← Big form component
│   ├── ImageUploader.tsx
│   ├── VideoUploader.tsx              ← ⭐ MỚI: Upload video riêng
│   ├── ListingStatusBadge.tsx
│   ├── SellerSidebar.tsx
│   ├── ConfirmShipButton.tsx          ← ⭐ MỚI: Nút "Sẵn sàng giao hàng"
│   ├── SellerOrderStatusBadge.tsx     ← ⭐ MỚI
│   ├── BankInfoForm.tsx               ← ⭐ MỚI: Form bank account
│   └── SellerGhnTracker.tsx           ← ⭐ MỚI: Tracking vận đơn cho Seller
└── hooks/
    ├── useSellerListings.ts
    ├── useCreateListing.ts
    ├── useSellerOrders.ts             ← ⭐ MỚI
    ├── useSellerOrderDetail.ts        ← ⭐ MỚI
    ├── useConfirmReady.ts             ← ⭐ MỚI: Mutation confirm đóng gói
    └── useBankInfo.ts                 ← ⭐ MỚI
```

### API Endpoints & Payload

```typescript
// src/lib/api/auth-api.ts — GIỐNG CŨ, KHÔNG ĐỔI
import { api } from "./http";

export const authApi = {
  signup: (data: {
    fullName: string;
    phoneNumber?: string;
    email: string;
    password: string;
    role: 1 | 2 | 3 | 4;
  }) => api.post("/api/Auth/signup", data),

  signin: (data: { email: string; password: string }) =>
    api.post("/api/Auth/signin", data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post("/api/Auth/verify-otp", data),

  resendOtp: (data: { email: string }) =>
    api.post("/api/Auth/resend-otp", data),

  googleLogin: (data: { idToken: string; role: 1 | 2 | 3 | 4 }) =>
    api.post("/api/Auth/google-login", data),

  logout: () => api.post("/api/Auth/logout"),
  renewToken: () => api.post("/api/Auth/renew-token"),
  getMe: () => api.get("/api/Auth/me"),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => api.post("/api/Auth/change-password", data),

  forgotPassword: (data: { email: string }) =>
    api.post("/api/Auth/forgot-password", data),

  resetPasswordByLink: (token: string, data: {
    newPassword: string;
    confirmPassword: string;
  }) => api.post(`/api/Auth/reset-password-by-link?token=${token}`, data),

  uploadAvatar: (file: File) =>
    api.upload("/api/Auth/upload-avatar", file),
};

// src/lib/api/seller-api.ts — CẬP NHẬT THEO NGHIỆP VỤ MỚI
import { api } from "./http";

export const sellerApi = {
  // ===== LISTINGS =====
  createListing: (data: {
    title: string; description: string; serialNumber: string;
    category: string; brand: string; frameSize: string;
    frameMaterial: string; condition: string; paint: string;
    groupset: string; operating: string; tireRim: string;
    brakeType: string; overall: string;
    price: number; // ← Đây là "Giá đề nghị" (BE sẽ tự tính giá niêm yết = price + 5%)
    city: string;
    medias: Array<{ image: string; videoUrl?: string; type: 0 | 1 }>;
  }) => api.post("/api/seller-listing", data),

  getListings: (page = 1, size = 10) =>
    api.get(`/api/seller-listing?pageNumber=${page}&pageSize=${size}`),

  getListingDetail: (id: string) =>
    api.get(`/api/seller-listing/${id}`),

  // ❌ BỎ updateListing — NGHIỆP VỤ MỚI CẤM EDIT SAU KHI PUBLISHED

  submitListing: (id: string) =>
    api.post(`/api/seller-listing/${id}/submit`),

  withdrawListing: (id: string) =>
    api.post(`/api/seller-listing/${id}/withdraw`),

  deleteListing: (id: string) =>
    api.delete(`/api/seller-listing/${id}`),

  // Upload
  uploadImage: (file: File) =>
    api.upload("/api/Upload/image", file),

  uploadVideo: (file: File) =>
    api.upload("/api/Upload/video", file),

  // ===== ⭐ ORDERS (MỚI — Quản lý đơn đặt mua xe) =====
  getOrders: (page = 1, size = 10) =>
    api.get(`/api/seller/orders?pageNumber=${page}&pageSize=${size}`),

  getOrderDetail: (orderId: string) =>
    api.get(`/api/seller/orders/${orderId}`),

  // Xác nhận đã đóng gói, sẵn sàng cho GHN lấy (SLA 12h)
  confirmReadyToShip: (orderId: string) =>
    api.post(`/api/seller/orders/${orderId}/confirm-ready`),

  // ===== ⭐ BANK INFO (MỚI — Cần thiết để giải ngân) =====
  updateBankInfo: (data: {
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  }) => api.post("/api/seller/profile/bank-info", data),
};
```

### Zod Schema cho Listing Form

```typescript
// src/modules/seller/schemas/listing-schema.ts
import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự").max(200),
  description: z.string().min(20, "Mô tả tối thiểu 20 ký tự"),
  serialNumber: z.string().min(3, "Số khung (serial) bắt buộc"),
  category: z.string().min(1, "Chọn loại xe"),
  brand: z.string().min(1, "Chọn thương hiệu"),
  frameSize: z.string().min(1, "Chọn size khung"),
  frameMaterial: z.string().optional(),
  condition: z.string().min(1, "Chọn tình trạng"),
  paint: z.string().optional(),
  groupset: z.string().min(1, "Groupset bắt buộc"),
  operating: z.string().optional(),
  tireRim: z.string().optional(),
  brakeType: z.string().optional(),
  overall: z.string().optional(),
  price: z.number().positive("Giá đề nghị phải lớn hơn 0"),
  city: z.enum(["Hà Nội", "TP.HCM", "Đà Nẵng"], {
    errorMap: () => ({ message: "Chỉ hỗ trợ HN, HCM, ĐN" }),
  }),
  medias: z.array(z.object({
    image: z.string().url(),
    videoUrl: z.string().url().optional(),
    type: z.literal(0).or(z.literal(1)),
  })).min(1, "Cần ít nhất 1 ảnh (bao gồm ảnh groupset)"),
});

// ⭐ Schema Bank Info
export const bankInfoSchema = z.object({
  bankAccountName: z.string().min(3, "Tên chủ tài khoản bắt buộc"),
  bankAccountNumber: z.string().min(6, "Số tài khoản bắt buộc"),
  bankName: z.string().min(2, "Tên ngân hàng bắt buộc"),
});
```

### Edge cases phải xử lý

| # | Edge case | Xử lý |
|---|-----------|-------|
| 1 | Password validation | Regex `^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$` — hiển thị checklist realtime |
| 2 | OTP hết hạn | Sau 60s mới cho bấm "Gửi lại". Toast "OTP không đúng hoặc đã hết hạn" |
| 3 | Email đã tồn tại | Catch error 409 → hiển thị "Email này đã được đăng ký" |
| 4 | Upload ảnh/video thất bại | Retry 1 lần, nếu fail → toast error + xóa file lỗi khỏi preview |
| 5 | **KHÔNG CÓ Edit Listing** | Khi listing status = `published` → **chỉ hiện nút Ẩn/Xóa**, không render form edit |
| 6 | Submit listing khi đang pending | Disable nút Submit, show status badge "Đang chờ duyệt" |
| 7 | **⭐ SLA 12h — Seller quên confirm** | Hiện **countdown 12h** trên Order Detail. Nếu under 2h → highlight đỏ "SẮP HẾT HẠN". BE sẽ tự hủy đơn nếu quá. |
| 8 | **⭐ Chưa có Bank Info** | Khi Seller vào Create Listing mà chưa điền Bank Info → Redirect `/seller/profile` + toast "Vui lòng cập nhật thông tin ngân hàng trước" |
| 9 | Seller có đơn đang xử lý mà muốn Ẩn tin | Backend trả 400, FE hiện toast "Không thể ẩn tin khi có đơn hàng đang xử lý" |

### Prompt sẵn cho Vũ dùng với AI

> "Tôi đang build **Auth + Seller Flow** cho SBE marketplace bằng **Next.js 15 App Router + TanStack Query + Radix UI + Tailwind 4 + React Hook Form + Zod**.
> Task hiện tại là **[task #VX]: [mô tả]**.
> API base: `https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net`
> API cần gọi: `[method] [endpoint]` — payload: `[copy từ auth-api.ts hoặc seller-api.ts]`
> Nghiệp vụ quan trọng: **CẤM edit listing đã Published**, Seller phải **confirm đóng gói trong 12h** (SLA), **BẮT BUỘC điền Bank Info** trước khi đăng bán.
> Tham chiếu: `docs/fe-plan-vu.md`, `01-order-and-payment-rules.md`, `business-spec.md`.
> File đặt tại: `src/modules/seller/screens/[ScreenName].tsx`.
> Hãy giúp tôi triển khai bước này."
