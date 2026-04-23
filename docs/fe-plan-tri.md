# 👤 Trí — Admin + Inspector + Chatbot

**Mục tiêu:** Xây dựng toàn bộ **Admin dashboard** (duyệt tin, **CRUD danh mục/thương hiệu**, quản lý user, **dashboard giải ngân Payout**, **xử lý tranh chấp Dispute**, thống kê hệ thống) + toàn bộ **Inspector portal** (xem bài cần duyệt, submit báo cáo checklist + **tham mưu giá**, lịch sử) + **Chatbot widget FAQ**.

> **Nghiệp vụ tham chiếu:** [01-order-and-payment-rules.md](../01-order-and-payment-rules.md) | [business-spec.md](../business-spec.md) | [03-platform-policy.md](../03-platform-policy.md)

---
Đã xong
## Màn hình & Component cần build

| # | Màn hình | Route | Độ phức tạp |
|---|---------|-------|-------------|
| 1 | Admin — Pending Listings | `/admin/listings` | 🟡 |
| 2 | Admin — Listing Detail (review + kết quả Inspector) | `/admin/listings/[id]` | 🟡 |
| 3 | Admin — Create Inspector Account | `/admin/users/inspectors/new` | 🟢 |
| 4 | **⭐ Admin — CRUD Categories** | `/admin/categories` | 🟡 |
| 5 | **⭐ Admin — CRUD Brands** | `/admin/brands` | 🟡 |
| 6 | **⭐ Admin — Payout Dashboard (Đơn chờ giải ngân)** | `/admin/payouts` | 🔴 |
| 7 | **⭐ Admin — Dispute Resolution (Giải quyết tranh chấp)** | `/admin/disputes` | 🔴 |
| 8 | **⭐ Admin — Dashboard (Thống kê hệ thống)** | `/admin/dashboard` | 🟡 |
| 9 | Inspector — Pending Assignments (Auto-Assign) | `/inspector/assignments` | 🟡 |
| 10 | Inspector — Assignment Detail | `/inspector/assignments/[id]` | 🟡 |
| 11 | Inspector — Submit Report **(có Suggested Price)** | `/inspector/assignments/[id]/report` | 🔴 |
| 12 | Inspector — History | `/inspector/history` | 🟢 |
| 13 | Inspector — History Detail | `/inspector/history/[id]` | 🟢 |
| 14 | Chatbot Widget (floating) | Component global | 🟡 |

---

## Danh sách công việc

### Sprint 1 — Admin Moderation + Inspector List (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| T1 | Setup `admin-api.ts` & `inspector-api.ts` | File service cho Admin + Inspector APIs (bao gồm cả API mới cho Payout, Dispute, Category, Brand) | 3h | Đạt D1 |
| T2 | Admin — Pending Listings table | Table: ảnh thumb, title, serial, seller, city, ngày submit. Pagination. Status badge. Nút Approve/Reject. **Hiện kèm Báo cáo Inspector** (nếu đã có). | 4h | T1 |
| T3 | Admin — Listing Detail (review view) | Xem đầy đủ tin: gallery ảnh/video, specs, serial. **Hiện kết quả kiểm định Online của Inspector** (checklist, score, **suggested price**). Hiển thị lý do reject nếu đã reject. | 3h | T2 |
| T4 | Admin — Approve/Reject action | Nút Approve: `POST /api/admin-listing/{id}/approve`. Nút Reject: dialog nhập lý do → `POST /api/admin-listing/{id}/reject` {reason}. Toast + refresh | 2h | T2 |
| T5 | Inspector — Pending Assignments | Card list: listing info (title, ảnh thumb, serial), ngày assign. `GET /api/inspector/pending`. **Lưu ý: Inspector KHÔNG THẤY PII seller ở bước này.** | 3h | T1 |
| T6 | Inspector — Assignment Detail | Xem chi tiết ảnh + video xe. **Zoom ảnh kiểm tra chi tiết** serial, groupset. `GET /api/inspector/{orderId}` | 3h | T5 |

### Sprint 2 — Inspector Report + Admin Expand (4 ngày) ⭐ LUỒNG MỚI

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| T7 | Inspector — Submit Report **(có Suggested Price)** | Form checklist: frame, paintCondition, drivetrain, brakes, score (1-10), comment, **⭐ suggestedPrice (number — tham mưu giá hợp lý)**. Submit `POST /api/inspector/{orderId}/submit`. | 4h | T6 |
| T8 | Inspector — History list + Detail | Table: listing title, outcome, score, date. `GET /api/inspector/history`. Detail: `GET /api/inspector/history/{inspectionId}`. | 3h | T1 |
| T9 | Admin — Create Inspector Account | Form: fullName, email, phoneNumber, password. Submit `POST /api/AdminAccount/admin/create-inspector` | 2h | T1 |
| T10 | **⭐ Admin — CRUD Categories** | Route `/admin/categories`. Table + Add/Edit/Delete dialog. Gọi API CRUD Categories (Xem `be-migration-tasks.md` — BE cần bổ sung). | 3h | T1 |
| T11 | **⭐ Admin — CRUD Brands** | Route `/admin/brands`. Table + Add/Edit/Delete dialog. Gọi API CRUD Brands (BE cần bổ sung). | 2h | T10 |
| T12 | Admin + Inspector layout | Sidebar navigation cho **Admin** (Dashboard, Listings, Users, Categories, Brands, Payouts, Disputes) và **Inspector** (Assignments, History). Responsive. | 3h | T2,T5 |

### Sprint 3 — Payout + Dispute + Dashboard + Chatbot (3 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| T13 | **⭐ Admin — Payout Dashboard** | Route `/admin/payouts`. Table: Seller tên, số TK, ngân hàng, số tiền giải ngân, trạng thái (pending/paid). **Nút "Đánh dấu đã chuyển"** → `POST /api/admin/payouts/{id}/mark-paid`. Có filter pending/paid. | 4h | T1 |
| T14 | **⭐ Admin — Dispute Resolution** | Route `/admin/disputes`. Table: Order ID, Buyer, Seller, lý do, **video unbox** (xem được inline), trạng thái. Nút "**Buyer đúng** (hoàn tiền)" / "**Seller đúng** (giải ngân)". → `POST /api/admin/disputes/{id}/resolve` | 4h | T1 |
| T15 | **⭐ Admin — Dashboard Thống Kê** | Cards: tổng listing, tổng đơn hàng, tổng doanh thu, tổng tiền chờ giải ngân, tổng dispute mở. Biểu đồ cơ bản (nếu BE có stats API). | 3h | T2 |
| T16 | Chatbot Widget — UI + API | Floating button góc phải → panel chat. Gửi message `POST /api/Chat`. FAQ: "Quy trình mua xe?", "Cart Lock 5 phút là gì?", "Chính sách phạt hủy đơn?", "Cách khiếu nại?", "Liên hệ hỗ trợ?". | 3h | - |
| T17 | Integration test + Bug fix | Flow E2E: Inspector nhận task → submit report → Admin xem report → Approve/Reject. Payout flow. Dispute resolution. | 3h | All |

---

## Hướng dẫn triển khai

### Cấu trúc folder

```
src/app/(admin)/admin/
├── layout.tsx                     ← Admin sidebar layout (check role=admin)
├── dashboard/
│   └── page.tsx                   ← ⭐ Dashboard thống kê
├── listings/
│   ├── page.tsx                   ← Pending listings table
│   └── [id]/
│       └── page.tsx               ← Listing detail + Inspector report
├── users/
│   └── inspectors/
│       └── new/
│           └── page.tsx           ← Create Inspector account
├── categories/                    ← ⭐ MỚI
│   └── page.tsx                   ← CRUD Categories
├── brands/                        ← ⭐ MỚI
│   └── page.tsx                   ← CRUD Brands
├── payouts/                       ← ⭐ MỚI
│   └── page.tsx                   ← Payout Dashboard
└── disputes/                      ← ⭐ MỚI
    └── page.tsx                   ← Dispute Resolution

src/app/(inspector)/inspector/
├── layout.tsx                     ← Inspector sidebar (check role=inspector)
├── assignments/
│   ├── page.tsx                   ← Pending assignments
│   └── [id]/
│       ├── page.tsx               ← Assignment detail
│       └── report/
│           └── page.tsx           ← Submit report form (có suggestedPrice)
└── history/
    ├── page.tsx                   ← History list
    └── [id]/
        └── page.tsx               ← History detail

src/modules/admin/
├── screens/
│   ├── AdminDashboardScreen.tsx    ← ⭐ MỚI: Thống kê toàn sàn
│   ├── PendingListingsScreen.tsx
│   ├── AdminListingDetailScreen.tsx
│   ├── CreateInspectorScreen.tsx
│   ├── CategoriesScreen.tsx        ← ⭐ MỚI
│   ├── BrandsScreen.tsx            ← ⭐ MỚI
│   ├── PayoutDashboardScreen.tsx   ← ⭐ MỚI
│   └── DisputeResolutionScreen.tsx ← ⭐ MỚI
├── components/
│   ├── AdminSidebar.tsx
│   ├── StatsCard.tsx
│   ├── ModerationActions.tsx
│   ├── CategoryCrudDialog.tsx     ← ⭐ MỚI
│   ├── BrandCrudDialog.tsx        ← ⭐ MỚI
│   ├── PayoutTable.tsx            ← ⭐ MỚI
│   ├── DisputeCard.tsx            ← ⭐ MỚI: Hiển thị video + nút phán xử
│   └── InspectionReportView.tsx   ← ⭐ MỚI: Hiện kết quả checklist inline
└── hooks/
    ├── usePendingListings.ts
    ├── useModerateAction.ts
    ├── useCategories.ts           ← ⭐ MỚI
    ├── useBrands.ts               ← ⭐ MỚI
    ├── usePendingPayouts.ts       ← ⭐ MỚI
    ├── useMarkPaid.ts             ← ⭐ MỚI
    ├── useDisputes.ts             ← ⭐ MỚI
    └── useResolveDispute.ts       ← ⭐ MỚI

src/modules/inspector/
├── screens/
│   ├── PendingAssignmentsScreen.tsx
│   ├── AssignmentDetailScreen.tsx
│   ├── SubmitReportScreen.tsx      ← CẬP NHẬT: Thêm suggestedPrice
│   ├── InspectionHistoryScreen.tsx
│   └── InspectionHistoryDetailScreen.tsx
├── components/
│   ├── InspectorSidebar.tsx
│   ├── InspectionChecklist.tsx
│   ├── SuggestedPriceInput.tsx     ← ⭐ MỚI
│   └── ReportSummary.tsx
└── hooks/
    ├── usePendingAssignments.ts
    ├── useAssignmentDetail.ts
    ├── useSubmitReport.ts
    └── useInspectionHistory.ts

src/components/shared/
└── ChatWidget.tsx                 ← Chatbot (Trí sở hữu)
```

### API Endpoints & Payload

```typescript
// src/lib/api/admin-api.ts — CẬP NHẬT TOÀN DIỆN
import { api } from "./http";

export const adminApi = {
  // Listing moderation
  approveListing: (listingId: string) =>
    api.post(`/api/admin-listing/${listingId}/approve`),

  rejectListing: (listingId: string, reason: string) =>
    api.post(`/api/admin-listing/${listingId}/reject`, { reason }),

  // User management
  createInspector: (data: {
    fullName: string;
    phoneNumber?: string;
    email: string;
    password: string;
  }) => api.post("/api/AdminAccount/admin/create-inspector", data),

  // ⭐ Categories CRUD (BE cần bổ sung)
  getCategories: () => api.get("/api/admin/categories"),
  createCategory: (data: { name: string; parentId?: number }) =>
    api.post("/api/admin/categories", data),
  updateCategory: (id: number, data: { name: string }) =>
    api.put(`/api/admin/categories/${id}`, data),
  deleteCategory: (id: number) =>
    api.delete(`/api/admin/categories/${id}`),

  // ⭐ Brands CRUD (BE cần bổ sung)
  getBrands: () => api.get("/api/admin/brands"),
  createBrand: (data: { name: string }) =>
    api.post("/api/admin/brands", data),
  updateBrand: (id: number, data: { name: string }) =>
    api.put(`/api/admin/brands/${id}`, data),
  deleteBrand: (id: number) =>
    api.delete(`/api/admin/brands/${id}`),

  // ⭐ Payout Dashboard (đơn chờ giải ngân)
  getPendingPayouts: (page = 1, size = 20) =>
    api.get(`/api/admin/payouts/pending?pageNumber=${page}&pageSize=${size}`),
  markPayoutPaid: (payoutId: string) =>
    api.post(`/api/admin/payouts/${payoutId}/mark-paid`),

  // ⭐ Dispute Management
  getDisputes: (page = 1, size = 20) =>
    api.get(`/api/admin/disputes?pageNumber=${page}&pageSize=${size}`),
  resolveDispute: (disputeId: string, data: {
    resolution: "buyer_wins" | "seller_wins";
    note?: string;
  }) => api.post(`/api/admin/disputes/${disputeId}/resolve`, data),

  // ⭐ Dashboard Stats
  getStats: () => api.get("/api/admin/stats/overview"),
};

// src/lib/api/inspector-api.ts — CẬP NHẬT THÊM SUGGESTED PRICE
import { api } from "./http";

export const inspectorApi = {
  getPending: (page = 1, size = 10) =>
    api.get(`/api/inspector/pending?pageNumber=${page}&pageSize=${size}`),

  getAssignmentDetail: (orderId: string) =>
    api.get(`/api/inspector/${orderId}`),

  // ⭐ Submit report CÓ SUGGESTED PRICE
  submitReport: (orderId: string, data: {
    frame: boolean;
    paintCondition: boolean;
    drivetrain: boolean;
    brakes: boolean;
    score: number;
    comment: string;
    suggestedPrice: number; // ⭐ MỚI: Tham mưu giá hợp lý
  }) => api.post(`/api/inspector/${orderId}/submit`, data),

  getHistory: (page = 1, size = 10) =>
    api.get(`/api/inspector/history?pageNumber=${page}&pageSize=${size}`),

  getHistoryDetail: (inspectionId: string) =>
    api.get(`/api/inspector/history/${inspectionId}`),
};

// Chat API (giữ nguyên)
export const chatApi = {
  sendMessage: (message: string) =>
    api.post("/api/Chat", { message }),
};
```

### Zod Schemas

```typescript
// inspector report schema — CẬP NHẬT
import { z } from "zod";

export const reportSchema = z.object({
  frame: z.boolean(),
  paintCondition: z.boolean(),
  drivetrain: z.boolean(),
  brakes: z.boolean(),
  score: z.number().int().min(1, "Điểm tối thiểu 1").max(10, "Điểm tối đa 10"),
  comment: z.string().min(10, "Nhận xét tối thiểu 10 ký tự"),
  suggestedPrice: z.number().positive("Giá tham mưu phải > 0"), // ⭐ MỚI
});

// Category schema
export const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục tối thiểu 2 ký tự"),
  parentId: z.number().optional(),
});

// Brand schema
export const brandSchema = z.object({
  name: z.string().min(2, "Tên thương hiệu tối thiểu 2 ký tự"),
});

// Dispute resolution schema
export const resolveDisputeSchema = z.object({
  resolution: z.enum(["buyer_wins", "seller_wins"]),
  note: z.string().optional(),
});
```

### Edge cases phải xử lý

| # | Edge case | Xử lý |
|---|-----------|-------|
| 1 | Admin truy cập khi không phải role admin | Middleware check role → redirect `/`. Trang 403 |
| 2 | Approve/Reject listing bị race condition | Disable nút sau click, `isPending`. API 400 → toast "Tin đã được xử lý" |
| 3 | Reject không nhập lý do | Zod: reason min 5 ký tự |
| 4 | Inspector submit thiếu **suggestedPrice** | Zod block submit. Highlight field. |
| 5 | **⭐ Xóa Category đang có listing** | BE trả 400. FE hiện toast "Không thể xóa danh mục đang sử dụng" |
| 6 | **⭐ Payout — mark paid nhầm** | Confirm dialog: "Bạn xác nhận đã chuyển khoản XXXđ cho YYY?" |
| 7 | **⭐ Dispute — video unbox hết hạn 24h** | Nếu `has_media_proof = false` → hiện badge "Không có bằng chứng". Auto-close. |
| 8 | **⭐ Dispute — phán xử Buyer đúng** | Dialog: "Hoàn tiền cho Buyer. Seller sẽ bị trừ phí ship". Hiện rõ số tiền. |
| 9 | Chatbot — API timeout | 10s timeout → "Xin lỗi, bot đang sự cố. Liên hệ admin@sportsbicycles.com" |
| 10 | Admin listing pending list rỗng | Empty state "Không có tin nào chờ duyệt 🎉" |

### Prompt sẵn cho Trí dùng với AI

> "Tôi đang build **Admin Dashboard + Inspector Portal + Chatbot** cho SBE marketplace bằng **Next.js 15 App Router + TanStack Query + Radix UI + Tailwind 4 + React Hook Form + Zod**.
> Task hiện tại là **[task #TX]: [mô tả]**.
> API base: `https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net`
> Nghiệp vụ mới: Inspector tham mưu giá (suggestedPrice). Admin CRUD Category/Brand. Admin duyệt Payout (giải ngân thủ công qua Bank). Admin xử lý Dispute (xem video unbox + phán xử).
> Tham chiếu: `docs/fe-plan-tri.md`, `01-order-and-payment-rules.md`, `business-spec.md`.
> File đặt tại: `src/modules/[admin|inspector]/screens/[ScreenName].tsx`.
> Hãy giúp tôi triển khai bước này."
