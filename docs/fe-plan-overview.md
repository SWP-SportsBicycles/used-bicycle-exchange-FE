# FE Implementation Plan — SBE (SportsBicyclesExchange)

> **Tech stack:** Next.js 15 + React 19 + TanStack Query 5 + Radix UI + Tailwind 4 + React Hook Form 7 + Zod 4
> **API Base:** `https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net`
> **Auth:** JWT Bearer (cookie-based refresh token)
> **Nghiệp vụ:** Mua Trực Tiếp (Cart Lock 5 phút) — PayOS — GHN — Desk Review Inspector — Escrow 48h
> **Ngày cập nhật:** 2026-04-21

---

## Team & Phân công (v3.2 — Direct Buy)

| Thành viên | Scope | Folders sở hữu | % |
|-----------|-------|----------------|---|
| **Đạt** (Lead) | Public + **Buyer Checkout (Cart Lock + PayOS + GHN)** + Foundation | `(public)/`, `(buyer)/`, `modules/buyer/`, `lib/` | ~37% |
| **Vũ** | Auth + **Seller (Orders + Bank Info + Confirm Ship)** | `auth/`, `(seller)/`, `modules/seller/` | ~33% |
| **Trí** | **Admin (Payout + Dispute + CRUD Category/Brand)** + Inspector (**suggestedPrice**) + Chatbot | `(admin)/`, `(inspector)/`, `modules/admin/`, `modules/inspector/` | ~30% |

---

## Shared Foundation (Đạt setup ngày 1, cả team dùng)

### `src/lib/api/http.ts` — API Client

```typescript
import { QueryClient } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ?? "https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: "include", // for refresh token cookie
  });

  if (res.status === 401) {
    const renewRes = await fetch(`${API_BASE}/api/Auth/renew-token`, {
      method: "POST",
      credentials: "include",
    });
    if (renewRes.ok) {
      const data = await renewRes.json();
      localStorage.setItem("accessToken", data.accessToken);
      return fetchWithAuth(url, options);
    }
    window.location.href = "/auth/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "API Error");
  }

  return res.json();
}

export const api = {
  get: (url: string) => fetchWithAuth(url),
  post: (url: string, body?: unknown) =>
    fetchWithAuth(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (url: string, body: unknown) =>
    fetchWithAuth(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: (url: string) => fetchWithAuth(url, { method: "DELETE" }),
  upload: async (url: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});
```

### Quy tắc file service riêng

```
src/lib/api/
├── http.ts            ← Đạt (KHÔNG AI SỬA)
├── buyer-api.ts       ← Đạt sở hữu (Checkout, GHN, Dispute, Wishlist)
├── seller-api.ts      ← Vũ sở hữu (Listings, Orders, Bank Info)
├── auth-api.ts        ← Vũ sở hữu
├── admin-api.ts       ← Trí sở hữu (Payout, Dispute, CRUD Cat/Brand)
└── inspector-api.ts   ← Trí sở hữu (Report + suggestedPrice)
```

---

## Quy tắc chung cho cả team

### Team working agreement (bắt buộc đọc)
- Xem: [fe-team-working-agreement.md](./fe-team-working-agreement.md)

### Naming convention
- Folder: `kebab-case` (vd: `order-detail`)
- Component: `PascalCase` (vd: `OrderDetailScreen.tsx`)
- Hook: `camelCase` bắt đầu bằng `use` (vd: `useOrders.ts`)
- API service: `kebab-case` (vd: `buyer-api.ts`)

### Pattern chuẩn cho mỗi màn hình

```
src/app/(buyer)/buyer/orders/page.tsx          ← Route page (thin, chỉ import)
src/modules/buyer/screens/OrderListScreen.tsx  ← Actual UI component
src/modules/buyer/hooks/useOrders.ts           ← TanStack Query hook
src/lib/api/buyer-api.ts                       ← API calls
```

---

## Timeline gợi ý (3 sprints)

| Sprint | Thời gian | Đạt | Vũ | Trí |
|--------|----------|-----|-----|-----|
| **1** (4 ngày) | Foundation + Core | API client + Auth context + Homepage + Marketplace | Login + Register + OTP + Seller Create Listing (form + media) | Admin Pending Listings + Inspector Pending + Setup API files |
| **2** (4 ngày) | ⭐ Luồng mới | **PDP + Checkout Cart Lock 5 phút + GHN Address + PayOS QR** + Wishlist | **My Listings (CẤM Edit) + Seller Orders + Confirm Đóng Gói (SLA 12h) + Tracking GHN** | **Inspector Report (suggestedPrice) + CRUD Category/Brand + Admin Layout** |
| **3** (3 ngày) | Polish + Escrow | My Orders + Order Detail + **Hủy đơn (penalty)** + **Dispute (video unbox)** | Forgot/Reset Password + **Profile + Bank Info** + Auth guard + Bug fix | **Payout Dashboard + Dispute Resolution** + Dashboard Stats + Chatbot + Bug fix |

---

## Thay đổi lớn so với phiên bản cũ

| # | Trước (Cọc 2 lớp) | Sau (Direct Buy v3.2) |
|---|-------------------|----------------------|
| 1 | Buyer chọn gói cọc Soft Reserve | **Cart Lock 5 phút** + thanh toán 100% PayOS |
| 2 | Buyer upload bill chuyển khoản | **QR PayOS tự động** + Webhook xác nhận |
| 3 | Admin duyệt bill cọc thủ công | **Admin chỉ xử lý Payout + Dispute** |
| 4 | Seller Edit listing thoải mái | **CẤM Edit sau Published** |
| 5 | Không có SLA cho Seller | **SLA 12 tiếng** xác nhận đóng gói |
| 6 | Inspector tùy chọn | **Inspector BẮT BUỘC 100% cho mọi bài** + tham mưu giá |
| 7 | PII Seller hiện luôn | **PII ẨN đến khi thanh toán xong** |
| 8 | Không có Payout Dashboard | **Admin Payout** (xem + đánh dấu đã chuyển khoản) |
| 9 | Không có Dispute rõ ràng | **Dispute 24h upload video unbox** |
| 10 | Không quản lý Category/Brand | **Admin CRUD Category/Brand** |

---

## Chi tiết từng thành viên

- [fe-plan-dat.md](./fe-plan-dat.md) — Đạt (Lead): Public + Buyer + Checkout Flow + Foundation
- [fe-plan-vu.md](./fe-plan-vu.md) — Vũ: Auth + Seller (Orders + Bank Info)
- [fe-plan-tri.md](./fe-plan-tri.md) — Trí: Admin (Payout + Dispute + CRUD) + Inspector (suggestedPrice) + Chatbot
