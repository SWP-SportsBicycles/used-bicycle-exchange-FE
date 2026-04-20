# FE Implementation Plan — SBE (SportsBicyclesExchange)

> **Tech stack:** Next.js 15 + React 19 + TanStack Query 5 + Radix UI + Tailwind 4 + React Hook Form 7 + Zod 4
> **API Base:** `https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net`
> **Auth:** JWT Bearer (cookie-based refresh token)
> **Ngày tạo:** 2026-04-19

---

## Team & Phân công

| Thành viên | Scope | Folders sở hữu | % |
|-----------|-------|----------------|---|
| **Đạt** (Lead) | Public + Buyer + Foundation | `(public)/`, `(buyer)/`, `modules/buyer/`, `lib/` | ~37% |
| **Vũ** | Auth + Seller | `auth/`, `(seller)/`, `modules/seller/` | ~33% |
| **Trí** | Admin + Inspector + Chatbot | `(admin)/`, `(inspector)/`, `modules/admin/`, `modules/inspector/` | ~30% |

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
    // Try renew token
    const renewRes = await fetch(`${API_BASE}/api/Auth/renew-token`, {
      method: "POST",
      credentials: "include",
    });
    if (renewRes.ok) {
      const data = await renewRes.json();
      localStorage.setItem("accessToken", data.accessToken);
      // Retry original request
      return fetchWithAuth(url, options);
    }
    // Redirect to login
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

### `src/lib/auth/auth-context.tsx` — Auth Provider

```typescript
// Đạt sẽ cung cấp: useAuth() hook trả về:
// { user, isAuthenticated, isLoading, login(), logout(), refetch() }
// Vũ, Trí chỉ cần gọi const { user } = useAuth() — không sửa file này
```

### Quy tắc file service riêng

```
src/lib/api/
├── http.ts            ← Đạt (KHÔNG AI SỬA)
├── buyer-api.ts       ← Đạt sở hữu
├── seller-api.ts      ← Vũ sở hữu
├── auth-api.ts        ← Vũ sở hữu
├── admin-api.ts       ← Trí sở hữu
└── inspector-api.ts   ← Trí sở hữu
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

### TanStack Query pattern

```typescript
// Trong hook file (vd: useOrders.ts)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buyerApi } from "@/lib/api/buyer-api";

export function useOrders(page = 1) {
  return useQuery({
    queryKey: ["buyer-orders", page],
    queryFn: () => buyerApi.getOrders(page),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: buyerApi.createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buyer-orders"] }),
  });
}
```

### React Hook Form + Zod pattern

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(5, "Tiêu đề phải từ 5 ký tự"),
  price: z.number().positive("Giá phải lớn hơn 0"),
});
type FormData = z.infer<typeof schema>;

const form = useForm<FormData>({ resolver: zodResolver(schema) });
```

---

## Timeline gợi ý (3 sprints)

| Sprint | Thời gian | Đạt | Vũ | Trí |
|--------|----------|-----|-----|-----|
| **1** (4 ngày) | Foundation | API client + Auth context + Homepage + Marketplace | Login + Register + OTP + Seller Create Listing | Admin Pending Listings + Inspector Pending |
| **2** (4 ngày) | Core flows | PDP + Order Create + Order Detail + Wishlist | Seller Listings List + Edit + Submit + Seller Orders | Admin Approve/Reject + Inspector Submit Report + History |
| **3** (3 ngày) | Polish | Shipment tracking + Review + Bug fix | Forgot/Reset Password + Profile + Withdraw + Bug fix | Dashboard + User Mgmt + Config + Chatbot + Bug fix |

---

## Chi tiết từng thành viên

- [fe-plan-dat.md](./fe-plan-dat.md) — Đạt (Lead): Public + Buyer + Foundation
- [fe-plan-vu.md](./fe-plan-vu.md) — Vũ: Auth + Seller
- [fe-plan-tri.md](./fe-plan-tri.md) — Trí: Admin + Inspector + Chatbot
