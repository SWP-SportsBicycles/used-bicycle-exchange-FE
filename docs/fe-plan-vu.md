# 👤 Vũ — Auth + Seller

**Mục tiêu:** Xây dựng toàn bộ hệ thống xác thực (đăng ký, đăng nhập, OTP, quên mật khẩu, Google login) và toàn bộ trải nghiệm Seller — từ đăng tin bán xe, upload ảnh, quản lý tin, đến xem đơn hàng và profile cá nhân.

---

## Màn hình & Component cần build

| # | Màn hình | Route | Độ phức tạp |
|---|---------|-------|-------------|
| 1 | Login | `/auth/login` | 🟢 |
| 2 | Register (chọn role Buyer/Seller) | `/auth/register` | 🟡 |
| 3 | OTP Verification | `/auth/verify-otp` | 🟢 |
| 4 | Forgot Password | `/auth/forgot-password` | 🟢 |
| 5 | Reset Password | `/auth/reset-password` | 🟢 |
| 6 | Create Listing (form + upload ảnh) | `/seller/listings/new` | 🔴 |
| 7 | Edit Listing | `/seller/listings/[id]/edit` | 🟡 |
| 8 | My Listings (list + status) | `/seller/listings` | 🟡 |
| 9 | Seller Orders | `/seller/orders` | 🟡 |
| 10 | Profile + Change Password | `/profile` | 🟡 |

---

## Danh sách công việc

### Sprint 1 — Auth (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| V1 | Login page | Form email + password, submit gọi `POST /api/Auth/signin`, lưu accessToken vào localStorage, redirect `/` | 3h | Đạt D1 (http.ts) |
| V2 | Register page | Form fullName + email + phone + password + role (Buyer=1/Seller=2), gọi `POST /api/Auth/signup`, redirect `/auth/verify-otp` | 3h | V1 |
| V3 | OTP Verification page | Form 6 chữ số, gọi `POST /api/Auth/verify-otp` {email, otp}. Nút "Gửi lại" gọi `POST /api/Auth/resend-otp`. Timer 60s | 3h | V2 |
| V4 | Google Login button | Trên Login + Register: nút "Đăng nhập bằng Google", gọi `POST /api/Auth/google-login` {idToken, role}. Cần setup Google OAuth client | 3h | V1 |
| V5 | Seller Create Listing — Form cơ bản | Form với tất cả fields: title, description, serialNumber, category, brand, frameSize, frameMaterial, condition, paint, groupset, operating, tireRim, brakeType, overall, price, city. Validation Zod | 4h | V1 |
| V6 | Seller Create Listing — Image Upload | Component `ImageUploader.tsx`: multi-image upload gọi `POST /api/Upload/image` lấy URL, quản lý medias array `[{image, videoUrl, type}]`. Submit toàn bộ gọi `POST /api/seller-listing` | 4h | V5 |

### Sprint 2 — Seller Management (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| V7 | My Listings page | Table/card list với status badge (draft/pending/published/reserved/sold/rejected/withdrawn), pagination. `GET /api/seller-listing` | 3h | V5 |
| V8 | Edit Listing | Load data `GET /api/seller-listing/{id}`, pre-fill form, submit `PUT /api/seller-listing/{id}`. Cùng form component như Create (reuse) | 3h | V5,V7 |
| V9 | Submit for review | Trên My Listings: nút "Gửi duyệt" cho tin status=draft. `POST /api/seller-listing/{id}/submit`. Confirm dialog trước khi submit | 1h | V7 |
| V10 | Withdraw listing | Nút "Rút tin" cho tin published. `POST /api/seller-listing/{id}/withdraw`. Dialog confirm + warning nếu có order active | 1h | V7 |
| V11 | Delete listing | Nút "Xóa" cho tin draft/rejected. `DELETE /api/seller-listing/{id}`. Alert dialog | 1h | V7 |
| V12 | Seller Orders page | Danh sách order đặt trên listing của mình (GET từ listing detail hoặc API riêng nếu BE có). Hiển thị buyer info, status, amount | 3h | V7 |
| V13 | Listing Detail — Seller view | `GET /api/seller-listing/{id}`: xem chi tiết tin đã đăng, preview giống Buyer thấy, hiện action buttons theo status | 2h | V7 |

### Sprint 3 — Auth bổ sung + Profile (3 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| V14 | Forgot Password page | Form email, gọi `POST /api/Auth/forgot-password`, hiện thông báo "Đã gửi link reset qua email" | 2h | V1 |
| V15 | Reset Password page | Form newPassword + confirmPassword, lấy `token` từ query string, gọi `POST /api/Auth/reset-password-by-link?token=xxx` | 2h | V14 |
| V16 | Profile page | `GET /api/Auth/me` hiển thị thông tin user, avatar upload `POST /api/Auth/upload-avatar`, đổi mật khẩu `POST /api/Auth/change-password` | 3h | V1 |
| V17 | Auth guard middleware | File `src/middleware.ts`: redirect `/auth/login` nếu chưa login mà vào route `/buyer/*`, `/seller/*`. Check role phù hợp | 2h | Đạt D2 |
| V18 | Polish + Bug fix | Responsive auth forms, loading states, error toast, session persistence | 3h | All |

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
│       ├── page.tsx               ← Listing Detail (seller view)
│       └── edit/
│           └── page.tsx           ← Edit Listing
├── orders/
│   └── page.tsx                   ← Seller Orders
└── profile/
    └── page.tsx                   ← Profile

src/modules/seller/
├── screens/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── OtpScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── ResetPasswordScreen.tsx
│   ├── SellerListingsScreen.tsx
│   ├── SellerListingDetailScreen.tsx
│   ├── SellerListingFormScreen.tsx     ← Dùng chung Create + Edit
│   ├── SellerOrdersScreen.tsx
│   └── ProfileScreen.tsx
├── components/
│   ├── ListingForm.tsx                ← Big form component
│   ├── ImageUploader.tsx
│   ├── ListingStatusBadge.tsx
│   └── SellerSidebar.tsx
└── hooks/
    ├── useSellerListings.ts
    ├── useCreateListing.ts
    └── useSellerOrders.ts
```

### API Endpoints & Payload

```typescript
// src/lib/api/auth-api.ts
import { api } from "./http";

export const authApi = {
  signup: (data: {
    fullName: string;
    phoneNumber?: string; // regex: ^0\d{9}$
    email: string;
    password: string;     // regex: ^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$
    role: 1 | 2 | 3 | 4; // 1=Buyer, 2=Seller, 3=Inspector, 4=Admin
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

// src/lib/api/seller-api.ts
import { api } from "./http";

export const sellerApi = {
  createListing: (data: {
    title: string; description: string; serialNumber: string;
    category: string; brand: string; frameSize: string;
    frameMaterial: string; condition: string; paint: string;
    groupset: string; operating: string; tireRim: string;
    brakeType: string; overall: string; price: number; city: string;
    medias: Array<{ image: string; videoUrl?: string; type: 0 | 1 }>;
  }) => api.post("/api/seller-listing", data),

  getListings: (page = 1, size = 10) =>
    api.get(`/api/seller-listing?pageNumber=${page}&pageSize=${size}`),

  getListingDetail: (id: string) =>
    api.get(`/api/seller-listing/${id}`),

  updateListing: (id: string, data: {
    title: string; description: string; serialNumber: string;
    category: string; brand: string; frameSize: string;
    frameMaterial: string; condition: string; paint: string;
    groupset: string; operating: string; tireRim: string;
    brakeType: string; overall: string; price: number; city: string;
  }) => api.put(`/api/seller-listing/${id}`, data),

  submitListing: (id: string) =>
    api.post(`/api/seller-listing/${id}/submit`),

  withdrawListing: (id: string) =>
    api.post(`/api/seller-listing/${id}/withdraw`),

  deleteListing: (id: string) =>
    api.delete(`/api/seller-listing/${id}`),

  uploadImage: (file: File) =>
    api.upload("/api/Upload/image", file),

  uploadVideo: (file: File) =>
    api.upload("/api/Upload/video", file),
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
  price: z.number().positive("Giá phải lớn hơn 0"),
  city: z.enum(["Hà Nội", "TP.HCM", "Đà Nẵng"], {
    errorMap: () => ({ message: "Chỉ hỗ trợ HN, HCM, ĐN" }),
  }),
  medias: z.array(z.object({
    image: z.string().url(),
    videoUrl: z.string().url().optional(),
    type: z.literal(0).or(z.literal(1)),
  })).min(1, "Cần ít nhất 1 ảnh (bao gồm ảnh groupset)"),
});
```

### Edge cases phải xử lý

| # | Edge case | Xử lý |
|---|-----------|-------|
| 1 | Password validation | Regex `^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$` — hiển thị checklist realtime (chữ hoa, số, ký tự đặc biệt, 6+ ký tự) |
| 2 | OTP hết hạn | Sau 60s mới cho bấm "Gửi lại". Toast "OTP không đúng hoặc đã hết hạn" |
| 3 | Email đã tồn tại | Catch error 409 → hiển thị "Email này đã được đăng ký" |
| 4 | Upload ảnh thất bại | Retry 1 lần, nếu fail → toast error + xóa ảnh lỗi khỏi preview |
| 5 | Listing — thieu serial/groupset | Validation Zod block submit, highlight field thiếu |
| 6 | Edit listing khi đã published & sửa giá >10% | Hiện warning "Tin sẽ phải duyệt lại vì giá thay đổi >10%" |
| 7 | Submit listing khi đang pending | Disable nút Submit, show status badge "Đang chờ duyệt" |
| 8 | Withdraw listing có order active | Backend sẽ trả 400, FE hiện toast "Không thể rút tin khi có đơn hàng đang xử lý" |

### Prompt sẵn cho Vũ dùng với AI

> "Tôi đang build **Auth + Seller Flow** cho SBE marketplace bằng **Next.js 15 App Router + TanStack Query + Radix UI + Tailwind 4 + React Hook Form + Zod**.
> Task hiện tại là **[task #VX]: [mô tả]**.
> API base: `https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net`
> API cần gọi: `[method] [endpoint]` — payload: `[copy từ auth-api.ts hoặc seller-api.ts]`
> Pattern: custom `api` client (xem http.ts), TanStack Query cho state management.
> Validation: Zod schema (xem listing-schema.ts).
> File đặt tại: `src/modules/seller/screens/[ScreenName].tsx`.
> Hãy giúp tôi triển khai bước này."
