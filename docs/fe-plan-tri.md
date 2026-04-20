# 👤 Trí — Admin + Inspector + Chatbot

**Mục tiêu:** Xây dựng toàn bộ Admin dashboard (duyệt tin, quản lý user, cấu hình) + toàn bộ Inspector portal (danh sách KĐ chờ, xem chi tiết, submit báo cáo, lịch sử) + Chatbot widget FAQ floating.

---

## Màn hình & Component cần build

| # | Màn hình | Route | Độ phức tạp |
|---|---------|-------|-------------|
| 1 | Admin — Pending Listings | `/admin/listings` | 🟡 |
| 2 | Admin — Listing Detail (review) | `/admin/listings/[id]` | 🟡 |
| 3 | Admin — Create Inspector Account | `/admin/users/inspectors/new` | 🟢 |
| 4 | Admin — Dashboard (stats) | `/admin/dashboard` | 🟡 |
| 5 | Inspector — Pending Assignments | `/inspector/assignments` | 🟡 |
| 6 | Inspector — Assignment Detail | `/inspector/assignments/[id]` | 🟡 |
| 7 | Inspector — Submit Report | `/inspector/assignments/[id]/report` | 🔴 |
| 8 | Inspector — History | `/inspector/history` | 🟢 |
| 9 | Inspector — History Detail | `/inspector/history/[id]` | 🟢 |
| 10 | Chatbot Widget (floating) | Component global | 🟡 |

---

## Danh sách công việc

### Sprint 1 — Admin Moderation + Inspector List (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| T1 | Setup `admin-api.ts` & `inspector-api.ts` | File service cho Admin + Inspector APIs | 2h | Đạt D1 |
| T2 | Admin — Pending Listings table | Table: ảnh thumb, title, serial, seller, city, ngày submit. Pagination. Status badge. Nút Approve/Reject | 4h | T1 |
| T3 | Admin — Listing Detail (review view) | Xem đầy đủ tin: gallery ảnh, specs, serial number, groupset photo highlight. Hiển thị lý do reject nếu đã reject trước đó | 3h | T2 |
| T4 | Admin — Approve/Reject action | Nút Approve: `POST /api/admin-listing/{id}/approve`. Nút Reject: dialog nhập lý do → `POST /api/admin-listing/{id}/reject` {reason}. Toast kết quả + refresh table | 2h | T2 |
| T5 | Inspector — Pending Assignments | Table card: listing info (title, ảnh, serial), buyer info, trạng thái, ngày assign. `GET /api/inspector/pending` | 3h | T1 |
| T6 | Inspector — Assignment Detail | Xem chi tiết listing + order + thông tin Seller (địa chỉ, SĐT) từ `GET /api/inspector/{orderId}` | 3h | T5 |

### Sprint 2 — Inspector Report + Admin expand (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| T7 | Inspector — Submit Report form | Form checklist: frame (checkbox), paintCondition (checkbox), drivetrain (checkbox), brakes (checkbox), score (number 1-10), comment (textarea). Submit `POST /api/inspector/{orderId}/submit` | 4h | T6 |
| T8 | Inspector — History list | Table: listing title, outcome, score, date completed. `GET /api/inspector/history`. Pagination | 2h | T1 |
| T9 | Inspector — History Detail | Xem lại báo cáo đã submit: checklist result, score, comment. `GET /api/inspector/history/{inspectionId}` | 2h | T8 |
| T10 | Admin — Create Inspector Account | Form: fullName, email, phoneNumber, password (default: Abc@123). Submit `POST /api/AdminAccount/admin/create-inspector`. Validation theo Swagger | 2h | T1 |
| T11 | Admin — Dashboard cơ bản | Cards thống kê: tổng listing pending, tổng published, tổng đơn, tổng user (tạm dùng data tổng hợp từ listing API hoặc placeholder) | 3h | T2 |
| T12 | Admin + Inspector layout | Sidebar navigation cho Admin (Dashboard, Listings, Users, Config) và Inspector (Assignments, History). Responsive | 3h | T2,T5 |

### Sprint 3 — Chatbot + Polish (3 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| T13 | Chatbot Widget — UI | Floating button góc phải dưới → mở panel chat. Message list + input box. Khi unmounted giữ lại history trong state | 3h | - |
| T14 | Chatbot Widget — API integration | Gửi message gọi `POST /api/Chat` {message}, hiển thị response. Typing indicator. Scroll to bottom | 2h | T13 |
| T15 | Chatbot Widget — UX polish | Welcome message, suggested questions (5 nhóm FAQ), error handling, responsive mobile | 2h | T14 |
| T16 | Integration test + Bug fix | Chạy flow: Admin duyệt tin → Inspector nhận → submit báo cáo → xem history. Chatbot hoạt động trên các trang | 3h | All |

---

## Hướng dẫn triển khai

### Cấu trúc folder

```
src/app/(admin)/admin/
├── layout.tsx                     ← Admin sidebar layout (check role=admin)
├── dashboard/
│   └── page.tsx                   ← Dashboard stats
├── listings/
│   ├── page.tsx                   ← Pending listings table
│   └── [id]/
│       └── page.tsx               ← Listing detail for review
└── users/
    └── inspectors/
        └── new/
            └── page.tsx           ← Create Inspector account

src/app/(inspector)/inspector/
├── layout.tsx                     ← Inspector sidebar layout (check role=inspector)
├── assignments/
│   ├── page.tsx                   ← Pending assignments
│   └── [id]/
│       ├── page.tsx               ← Assignment detail
│       └── report/
│           └── page.tsx           ← Submit report form
└── history/
    ├── page.tsx                   ← History list
    └── [id]/
        └── page.tsx               ← History detail

src/modules/admin/
├── screens/
│   ├── AdminDashboardScreen.tsx
│   ├── PendingListingsScreen.tsx
│   ├── AdminListingDetailScreen.tsx
│   └── CreateInspectorScreen.tsx
├── components/
│   ├── AdminSidebar.tsx
│   ├── StatsCard.tsx
│   └── ModerationActions.tsx      ← Approve/Reject buttons + Reject dialog
└── hooks/
    ├── usePendingListings.ts
    └── useModerateAction.ts

src/modules/inspector/
├── screens/
│   ├── PendingAssignmentsScreen.tsx
│   ├── AssignmentDetailScreen.tsx
│   ├── SubmitReportScreen.tsx
│   ├── InspectionHistoryScreen.tsx
│   └── InspectionHistoryDetailScreen.tsx
├── components/
│   ├── InspectorSidebar.tsx
│   ├── InspectionChecklist.tsx    ← Checklist form component
│   └── ReportSummary.tsx
└── hooks/
    ├── usePendingAssignments.ts
    ├── useAssignmentDetail.ts
    ├── useSubmitReport.ts
    └── useInspectionHistory.ts

src/components/shared/
└── ChatWidget.tsx                 ← Floating chatbot (Trí sở hữu)
```

### API Endpoints & Payload

```typescript
// src/lib/api/admin-api.ts
import { api } from "./http";

export const adminApi = {
  // Listing moderation
  // Note: Swagger không có GET pending list, nhưng nút Approve/Reject cần listingId
  // Nếu BE chưa có → dùng GET /api/buyer-listing rồi filter status pending phía FE
  // Hoặc yêu cầu BE bổ sung endpoint

  approveListing: (listingId: string) =>
    api.post(`/api/admin-listing/${listingId}/approve`),

  rejectListing: (listingId: string, reason: string) =>
    api.post(`/api/admin-listing/${listingId}/reject`, { reason }),

  // User management
  createInspector: (data: {
    fullName: string;     // minLength: 3
    phoneNumber?: string; // regex: ^0\d{9}$
    email: string;        // format: email
    password: string;     // regex: ^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$, default "Abc@123"
  }) => api.post("/api/AdminAccount/admin/create-inspector", data),
};

// src/lib/api/inspector-api.ts
import { api } from "./http";

export const inspectorApi = {
  // Pending assignments
  getPending: (page = 1, size = 10) =>
    api.get(`/api/inspector/pending?pageNumber=${page}&pageSize=${size}`),

  getAssignmentDetail: (orderId: string) =>
    api.get(`/api/inspector/${orderId}`),

  // Submit report
  submitReport: (orderId: string, data: {
    frame: boolean;          // Khung: pass/fail
    paintCondition: boolean; // Sơn: pass/fail
    drivetrain: boolean;     // Bộ truyền động: pass/fail
    brakes: boolean;         // Phanh: pass/fail
    score: number;           // Điểm tổng thể 1-10
    comment: string;         // Nhận xét chi tiết
  }) => api.post(`/api/inspector/${orderId}/submit`, data),

  // History
  getHistory: (page = 1, size = 10) =>
    api.get(`/api/inspector/history?pageNumber=${page}&pageSize=${size}`),

  getHistoryDetail: (inspectionId: string) =>
    api.get(`/api/inspector/history/${inspectionId}`),
};

// Chat API (dùng trong ChatWidget)
export const chatApi = {
  sendMessage: (message: string) =>
    api.post("/api/Chat", { message }),
};
```

### Zod Schemas

```typescript
// src/modules/inspector/schemas/report-schema.ts
import { z } from "zod";

export const reportSchema = z.object({
  frame: z.boolean(),
  paintCondition: z.boolean(),
  drivetrain: z.boolean(),
  brakes: z.boolean(),
  score: z.number().int().min(1, "Điểm tối thiểu 1").max(10, "Điểm tối đa 10"),
  comment: z.string().min(10, "Nhận xét tối thiểu 10 ký tự"),
});

// src/modules/admin/schemas/create-inspector-schema.ts
import { z } from "zod";

export const createInspectorSchema = z.object({
  fullName: z.string().min(3, "Họ tên tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().regex(/^0\d{9}$/, "SĐT phải có 10 chữ số, bắt đầu bằng 0").optional(),
  password: z
    .string()
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, "Cần chữ hoa, số, ký tự đặc biệt, 6+ ký tự")
    .default("Abc@123"),
});

// src/modules/admin/schemas/reject-schema.ts
import { z } from "zod";

export const rejectSchema = z.object({
  reason: z.string().min(5, "Lý do từ chối tối thiểu 5 ký tự"),
});
```

### Component chi tiết — Chatbot Widget

```typescript
// src/components/shared/ChatWidget.tsx — Structure outline
// 1. FloatingButton: icon chat, badge unread, onClick toggle panel
// 2. ChatPanel: header + message list + input
// 3. MessageBubble: avatar + text + timestamp
// 4. SuggestedQuestions: 5 nút FAQ nhanh
//    - "Quy trình mua xe như thế nào?"
//    - "Làm sao để đặt cọc?"
//    - "Kiểm định xe hoạt động ra sao?"
//    - "Chính sách hoàn tiền khi hủy đơn?"
//    - "Cách liên hệ hỗ trợ?"
// 5. State: messages[], isOpen, isTyping
// 6. API: POST /api/Chat { message } → response text

// Lưu ý: ChatWidget dùng state local (useState), KHÔNG cần TanStack Query
// vì chat là stateful conversation, không phải server state caching
```

### Edge cases phải xử lý

| # | Edge case | Xử lý |
|---|-----------|-------|
| 1 | Admin truy cập khi không phải role admin | Middleware check role → redirect `/`. Nếu role không match → trang 403 |
| 2 | Approve/Reject listing bị race condition | Disable nút sau khi click, show loading, API trả 400 nếu listing đã xử lý → toast "Tin này đã được xử lý" |
| 3 | Reject không nhập lý do | Zod validation trên dialog: reason min 5 ký tự |
| 4 | Inspector submit report thiếu field | Checklist booleans mặc định false; score bắt buộc, comment bắt buộc. Zod block submit |
| 5 | Inspector submit report 2 lần | `isPending` disable nút, API trả 400 nếu đã submit → toast |
| 6 | Chatbot — API timeout | Sau 10s không response → hiển thị "Xin lỗi, bot đang gặp sự cố. Vui lòng thử lại hoặc liên hệ email hỗ trợ." |
| 7 | Chatbot — message rỗng | Disable nút gửi khi input trống |
| 8 | Admin listing pending list rỗng | Empty state "Không có tin nào chờ duyệt 🎉" |
| 9 | Inspector chưa có assignment nào | Empty state + text "Khi có lịch kiểm định mới, bạn sẽ thấy ở đây" |

### Prompt sẵn cho Trí dùng với AI

> "Tôi đang build **Admin + Inspector Portal + Chatbot** cho SBE marketplace bằng **Next.js 15 App Router + TanStack Query + Radix UI + Tailwind 4 + React Hook Form + Zod**.
> Task hiện tại là **[task #TX]: [mô tả]**.
> API base: `https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net`
> API cần gọi: `[method] [endpoint]` — payload: `[copy từ admin-api.ts hoặc inspector-api.ts]`
> Pattern: custom `api` client (see http.ts), TanStack Query hooks.
> File đặt tại: `src/modules/[admin|inspector]/screens/[ScreenName].tsx`.
> Hãy giúp tôi triển khai bước này."
