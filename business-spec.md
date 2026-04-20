# Phân tích BA & Tech Lead — VeloTrust (Used Bicycle Exchange)

> **Dự án:** Online Exchange System for Used Sports Bicycles  
> **Phiên bản:** 2.1 (đã chốt 2026-04-19)  
> **Phạm vi MVP:** HN, TP.HCM, Đà Nẵng  
> **Tham chiếu:** [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md) | [02-mvp-scope.md](./02-mvp-scope.md) | [03-platform-policy.md](./03-platform-policy.md)

---

## 1. Business Logic quan trọng

### A. Listing (Đăng tin)

| # | Business Rule | Mức độ |
|---|--------------|--------|
| BL-L01 | Bắt buộc **số khung (serial)** trước khi submit | 🔴 Critical |
| BL-L02 | Bắt buộc **≥1 ảnh cận cảnh groupset** (truyền động) | 🔴 Critical |
| BL-L03 | Địa chỉ listing phải thuộc **HN / HCM / ĐN** | 🔴 Critical |
| BL-L04 | Sửa giá **>10%** hoặc spec nhạy cảm → tin về `pending_review` | 🟡 High |
| BL-L05 | **Khóa sửa** giá/spec khi có Order active trên listing | 🔴 Critical |
| BL-L06 | Một listing **chỉ 1 giao dịch active** tại một thời điểm | 🔴 Critical |

### B. PII & Bảo mật thông tin

| # | Business Rule | Mức độ |
|---|--------------|--------|
| BL-P01 | SĐT + địa chỉ Seller chỉ hiển thị sau **Soft Reserve được Admin xác nhận** | 🔴 Critical |
| BL-P02 | Guest/Buyer chưa SR chỉ xem mô tả, ảnh, thông số, quận/huyện mức thô | 🟡 High |
| BL-P03 | Không bán PII cho bên thứ ba ngoài mục đích giao dịch/logistics | 🔴 Critical |

### C. Cọc 2 lớp & Escrow

| # | Business Rule | Mức độ |
|---|--------------|--------|
| BL-D01 | **Soft Reserve (Lớp 1):** 200k–500k (Admin config). **Khấu trừ vào giá cuối.** | 🔴 Critical |
| BL-D02 | **Inspection Deposit (Lớp 2):** `min(rate × giá, 2.000.000đ)`, rate 5%-10% | 🔴 Critical |
| BL-D03 | Lớp 2 chỉ thu khi Buyer bấm "Yêu cầu kiểm định" | 🟡 High |
| BL-D04 | Toàn bộ tiền vào **tài khoản ký quỹ của sàn**; **Admin xác nhận** từng khoản | 🔴 Critical |
| BL-D05 | SR confirmed → Listing → `reserved` + mở PII Seller | 🔴 Critical |

### D. Hủy kèo & Phân bổ cọc (4 kịch bản)

| # | Kịch bản | Phân bổ |
|---|----------|---------|
| C1 | **Buyer tự hủy** (không lỗi Seller, không sai lệch xe — kể cả no-show/quá hạn) | Mất SR → 70% Seller / 30% Sàn |
| C2 | **Buyer hủy vì xe sai lệch nghiêm trọng** (Inspector xác nhận `severe_mismatch`) | Hoàn 100% SR+ID Buyer. Phí KĐ → Seller chịu |
| C3 | **Seller hủy** / không hợp tác giao hàng | Hoàn 100% Buyer + ghi vi phạm profile Seller |
| C4 | **Admin quyết định** sau dispute | Theo bằng chứng — Admin toàn quyền |

### E. Kiểm định (Inspector — 2 chiều)

| # | Business Rule | Mức độ |
|---|--------------|--------|
| BL-I01 | **Buyer-initiated:** On-demand sau SR, Buyer yêu cầu + nộp ID | 🔴 Critical |
| BL-I02 | **Seller-initiated:** Pre-listing, Seller xin badge VeloSafe trước khi đăng | 🟡 High |
| BL-I03 | Inspector đến **nhà Seller** kiểm tra. Upload báo cáo + **suggested_price** | 🟡 High |
| BL-I04 | Phí KĐ: xe đúng mô tả → **Buyer trả**; sai lệch → **Seller trả** (Buyer-initiated) | 🔴 Critical |
| BL-I05 | Seller-initiated: **Seller luôn trả** phí KĐ | 🟡 High |
| BL-I06 | SLA: Assign Inspector trong **24h** làm việc; báo cáo trong **48h** sau buổi kiểm | 🟡 High |
| BL-I07 | Checklist: khung (nứt, dent, alignment), phanh (pad, rotor), truyền động (chain, cassette, shifting) | 🟡 High |

### F. Hoàn tất giao dịch

| # | Business Rule | Mức độ |
|---|--------------|--------|
| BL-F01 | Order → `completed` khi Buyer bấm "Đã nhận hàng" **HOẶC** 48h sau `delivered` không có dispute | 🔴 Critical |
| BL-F02 | Nhắc Buyer ở mốc 24h và 47h trong `pending_confirmation` | 🟡 High |
| BL-F03 | Nếu có dispute mở → **chặn auto-complete** | 🔴 Critical |
| BL-F04 | Phí thành công **2-3%** áp khi `completed`; sàn giải ngân cho Seller | 🔴 Critical |
| BL-F05 | Cửa sổ đánh giá **14 ngày** sau `completed` | 🟡 High |

### G. Admin

| # | Business Rule | Mức độ |
|---|--------------|--------|
| BL-A01 | Duyệt tin: đối chiếu serial + ảnh groupset; approve/reject kèm lý do | 🔴 Critical |
| BL-A02 | **Xác nhận thanh toán escrow:** confirm SR, ID, phần còn lại vào TK sàn | 🔴 Critical |
| BL-A03 | Assign Inspector cho KĐ Buyer-initiated (SLA: 24h) | 🔴 Critical |
| BL-A04 | CRUD Category, Brand, FeeRule | 🟡 High |
| BL-A05 | Quản lý user: khóa/mở, ghi chú nội bộ | 🟡 High |
| BL-A06 | Dashboard: listing/order theo trạng thái, tỉ lệ hủy, doanh thu sàn | 🟡 High |

---

## 2. Core Flow — Step-by-step

### Flow 1: Đăng tin (Listing Lifecycle)

`
Seller                  System                     Admin
  │                       │                          │
  ├─ 1. Tạo draft ────────►                          │
  │    (title, price,     │                          │
  │     serial, ảnh       │                          │
  │     groupset, city)   │                          │
  │                       │                          │
  │    [Tùy chọn]         │                          │
  ├─ 1b. Book Inspector ─►│ Seller-initiated KĐ      │
  │    (lấy badge VS)     ├── Admin assign ──────────►│
  │                       │   Inspector              │
  │                       │   ←── Báo cáo + badge    │
  │                       │                          │
  ├─ 2. Submit duyệt ─────►  status: pending_review   │
  │                       ├── Thông báo Admin ──────►│
  │                       │   ◄── Admin duyệt ───────┤
  │                       │       approve/reject      │
  │  ◄── Kết quả ─────────┤       + lý do            │
  │    published / rejected                          │
`

**State machine Listing:**
`
draft → pending_review → published → reserved → sold
              ↑              │
              │ (>10% edit)  ▼
              └──────── withdrawn
                   (chỉ khi không có order active)
`

### Flow 2: Giao dịch chính (Order — 2 luồng)

`
BUYER              PLATFORM ESCROW          SELLER       INSPECTOR
  │                      │                    │               │
──┼── PHASE 1: SOFT RESERVE ───────────────────────────────────
  │                      │                    │               │
  ├─ Tạo Order ─────────►│                    │               │
  ├─ Chuyển SR vào ─────►│                    │               │
  │  escrow + chứng từ   │                    │               │
  │                      │ [Admin xác nhận SR]│               │
  │◄─ SR confirmed ──────┤ Listing → reserved │               │
  │   PII Seller mở      │                    │               │
  │                      │                    │               │
──┼── PHASE 2A (Có KĐ): KIỂM ĐỊNH ──────────────────────────────
  │                      │                    │               │
  ├─ Yêu cầu KĐ ────────►│                    │               │
  ├─ Chuyển ID ──────────►│                    │               │
  │                      │ [Admin confirm ID] │               │
  │                      ├── Assign Inspector ────────────────►│
  │                      │                    │   Đến nhà     │
  │                      │                    │   Seller KT   │
  │                      │◄── Báo cáo + ─────────────────────┤
  │◄── Xem báo cáo ──────┤    suggested_price │               │
  │                      │                    │               │
  │   [Tiếp tục / Hủy]   │                    │               │
  │                      │                    │               │
──┼── PHASE 2B (Không KĐ): THANH TOÁN NGAY ──────────────────────
  │  (skip Phase 2A)      │                    │               │
  │                      │                    │               │
──┼── PHASE 3: THANH TOÁN PHẦN CÒN LẠI ──────────────────────────
  │                      │                    │               │
  ├─ Chuyển phần còn ────►│                    │               │
  │  lại + chứng từ      │ [Admin confirm]    │               │
  │                      │ Listing → fulfilled│               │
  │                      │                    │               │
──┼── PHASE 4: GIAO NHẬN & HOÀN TẤT ──────────────────────────────
  │                      │                    │               │
  │                      │  status: delivered  │               │
  │                      │  (Seller/Admin mark)│               │
  │                      │  status: pending_confirmation       │
  │                      │  ┌─ Nhắc 24h ──►Buyer             │
  │                      │  └─ Nhắc 47h ──►Buyer             │
  │                      │  [Auto-complete 48h nếu không       │
  │                      │   có dispute]                       │
  │                      │                    │               │
  ├─ "Đã nhận hàng" ─────►│ status: completed  │               │
  │                       │ • Phí 2-3%        │               │
  │                       │ • Giải ngân Seller│               │
  │                       │ • Listing → sold  │               │
  │                       │ • Review 14 ngày  │               │
`

**State machine Order:**
`
pending_payment → soft_reserved → inspection_deposit_pending → inspection
                      │                                            │
                      │ (skip KĐ)                                  │
                      └──────────────► pending_fulfillment ◄───────┘
                                              │
                                         delivered → pending_confirmation → completed
                                                             │
                                                         disputed → cancelled (Admin)
`

### Flow 3: Khiếu nại (Dispute)

`
Bước 1: Buyer/Seller bấm "Khiếu nại" trên đơn
        → System tạo Dispute, auto đính kèm order_id + context
        → Đóng băng chi trả escrow
        → Thông báo Admin (SLA: xác nhận trong 8h làm việc)

Bước 2: Thu thập bằng chứng
        → Ảnh, clip, chat log, báo cáo Inspector
        → Buyer/Seller gửi qua DisputeMessage

Bước 3: Admin quyết định (SLA: 48h kể từ đủ bằng chứng)
        → Áp dụng ma trận fault (03-F.3)
        → Gắn fault_code + bằng chứng + audit trail

Bước 4: Thực thi quyết định
        → Giải ngân / hoàn tiền / phạt Seller
        → Cập nhật Order status → Thông báo các bên
`

---

## 3. Chức năng theo Role

### Guest
- Browse listing (danh sách + chi tiết)
- Tìm kiếm & lọc (loại xe, thương hiệu, giá, size, tình trạng, thành phố)
- Xem ảnh, mô tả, thông số (không thấy SĐT/địa chỉ đầy đủ)
- Chatbot CSKH

### Buyer
- Đăng ký / Đăng nhập
- Tất cả chức năng Guest
- Wishlist (lưu tin yêu thích)
- Đặt Soft Reserve (chọn gói → chuyển khoản → upload chứng từ)
- Xem PII Seller (sau SR confirmed)
- Yêu cầu kiểm định + nộp Inspection Deposit
- Xem báo cáo kiểm định (checklist + suggested_price)
- Quyết định tiếp tục / hủy sau KĐ
- Thanh toán phần còn lại (1 lần nếu không KĐ)
- Xác nhận nhận hàng
- Mở khiếu nại (trong `pending_confirmation`)
- Đánh giá (14 ngày sau `completed`)

### Seller
- Đăng ký / Đăng nhập
- Đăng tin mới (draft – serial + ảnh groupset bắt buộc)
- **Book Inspector trước khi đăng** (Seller-initiated, lấy badge VeloSafe)
- Submit tin → chờ Admin duyệt
- Sửa / Rút tin (có ràng buộc)
- Xem đơn hàng đặt trên listing của mình
- Nhập tracking code vận chuyển
- Đánh dấu đã giao

### Inspector
- Xem danh sách phân công (Admin assign)
- Đến nhà Seller kiểm tra tại địa điểm
- Upload báo cáo: checklist (khung, phanh, truyền động) + ảnh/PDF + **suggested_price**
- Đánh dấu kết quả: pass / minor_issues / severe_mismatch

### Admin
- Duyệt tin (approve/reject + lý do)
- **Xác nhận thanh toán escrow** (SR, ID, phần còn lại)
- Assign Inspector cho KĐ Buyer-initiated
- Quản lý user (khóa/mở TK, ghi chú)
- Xử lý tranh chấp (quyết định phân bổ tiền)
- CRUD Category, Brand, FeeRule
- Dashboard & báo cáo (tổng đơn, doanh thu, tỉ lệ hủy)
- Cấu hình phí (SR packages, rate KĐ, phí thành công)

---

## 4. Cấu trúc API (MVP)

### Public / Guest

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/listings` | Danh sách + filter |
| GET | `/api/v1/listings/{id}` | Chi tiết (PII ẩn theo policy) |
| GET | `/api/v1/meta/categories` | Danh mục |
| GET | `/api/v1/meta/brands` | Thương hiệu |

### Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/auth/register` | Đăng ký |
| POST | `/api/v1/auth/login` | Đăng nhập → JWT |
| POST | `/api/v1/auth/logout` | Thu hồi refresh token |

### Seller — Listing

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/seller/listings` | Tạo draft |
| PATCH | `/api/v1/seller/listings/{id}` | Sửa draft |
| POST | `/api/v1/seller/listings/{id}/submit` | Submit duyệt |
| POST | `/api/v1/seller/listings/{id}/media` | Upload ảnh |
| POST | `/api/v1/seller/listings/{id}/withdraw` | Rút tin |
| POST | `/api/v1/seller/listings/{id}/request-certification` | Xin KĐ pre-listing (Seller-initiated) |
| GET | `/api/v1/seller/orders` | Xem đơn hàng trên listing của mình |
| PATCH | `/api/v1/seller/orders/{id}/shipping` | Nhập tracking code |
| POST | `/api/v1/seller/orders/{id}/mark-delivered` | Đánh dấu đã giao |

### Buyer — Order & Wishlist

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/orders` | Tạo order (SR) |
| POST | `/api/v1/orders/{id}/payments` | Upload chứng từ thanh toán |
| POST | `/api/v1/orders/{id}/request-inspection` | Yêu cầu KĐ (Buyer-initiated) |
| POST | `/api/v1/orders/{id}/continue-purchase` | Tiếp tục sau KĐ |
| POST | `/api/v1/orders/{id}/cancel` | Hủy đơn |
| POST | `/api/v1/orders/{id}/confirm-receipt` | Xác nhận đã nhận hàng |
| GET | `/api/v1/orders/{id}` | Chi tiết đơn |
| GET | `/api/v1/orders` | Danh sách đơn của tôi |
| POST | `/api/v1/wishlist/{listingId}` | Thêm wishlist |
| DELETE | `/api/v1/wishlist/{listingId}` | Xóa wishlist |
| GET | `/api/v1/wishlist` | Danh sách wishlist |

### Inspector

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/inspector/assignments` | Phân công của tôi |
| PATCH | `/api/v1/inspector/inspections/{id}` | Cập nhật trạng thái |
| POST | `/api/v1/inspector/inspections/{id}/report` | Upload báo cáo + suggested_price |

### Review & Report

| Method | Endpoint |
|--------|----------|
| POST | `/api/v1/orders/{id}/reviews` |
| GET | `/api/v1/users/{id}/reviews` |
| POST | `/api/v1/reports/listings` |

### Dispute

| Method | Endpoint |
|--------|----------|
| POST | `/api/v1/orders/{id}/disputes` |
| POST | `/api/v1/orders/{id}/disputes/{did}/messages` |
| GET | `/api/v1/orders/{id}/disputes/{did}` |

### Admin

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/admin/listings?status=pending_review` | Danh sách chờ duyệt |
| POST | `/api/v1/admin/listings/{id}/moderate` | Duyệt/Từ chối |
| POST | `/api/v1/admin/payments/{id}/confirm` | Xác nhận thanh toán escrow |
| POST | `/api/v1/admin/inspections/{id}/assign` | Assign Inspector |
| GET/PATCH | `/api/v1/admin/users` | Quản lý user |
| PATCH | `/api/v1/admin/disputes/{id}` | Xử lý tranh chấp |
| GET | `/api/v1/admin/stats/overview` | Dashboard |
| CRUD | `/api/v1/admin/categories` | Danh mục |
| CRUD | `/api/v1/admin/brands` | Thương hiệu |
| CRUD | `/api/v1/admin/fee-rules` | Cấu hình phí |

---

## 5. Database Schema (tóm tắt key tables)

### User & Roles
- `user` (id, email, password_hash, display_name, is_active)
- `role` (id, code: guest/buyer/seller/inspector/admin)
- `user_role` (user_id, role_id)
- `seller_profile` (user_id, phone, address, city_code, reputation_score, cancel_rate)
- `buyer_profile` (user_id, phone, address, city_code)

### Listing
- `category` (id, name, parent_id)
- `brand` (id, name)
- `listing` (id, seller_id, category_id, brand_id, title, description, price, frame_serial, frame_size, condition, city_code, groupset_photo_ok, is_velosafe_certified, status)
- `listing_media` (id, listing_id, url, kind, is_groupset, sort_order)
- `listing_price_history` (id, listing_id, old_price, new_price, actor_id, reason, changed_at)

### Order & Payment
- `order` (id, listing_id, buyer_id, status, amount_total, soft_reserve_amount, inspection_deposit_amount, delivered_at)
- `payment` (id, order_id, purpose: soft_reserve/inspection_deposit/remaining_balance, method, status, amount, proof_url, confirmed_by, confirmed_at)
- `order_status_history` (id, order_id, actor_id, from_status, to_status, reason, created_at)

### Inspection
- `inspection` (id, listing_id, order_id [nullable cho pre-listing], inspector_id, mode: on_demand/pre_listing, status, outcome: pass/minor_issues/severe_mismatch, suggested_price, fee_payer, scheduled_at, completed_at)
- `inspection_report` (id, inspection_id, report_url, checklist [JSONB], summary, created_at)

### Others
- `review` (id, order_id, author_id, rating, comment)
- `wishlist_item` (user_id, listing_id)
- `report` (id, listing_id, reporter_id, reason, status)
- `dispute` (id, order_id, opened_by, status, fault_code, resolution, resolved_by)
- `dispute_message` (id, dispute_id, sender_id, body, attachment_url)
- `fee_rule` (id, code, config [JSONB], updated_by)
- `admin_action` (id, admin_id, entity_type, entity_id, action_code, payload, created_at)

### Logistics
- `shipment` (id, order_id, carrier: GHN/GHTK/VTP/self, tracking_code, tracking_url, status, created_at, delivered_at)

---

## 6. Background Jobs (cần thiết — Backend lo)

| Job | Trigger | Hành động |
|-----|---------|-----------|
| Auto-complete Order | `pending_confirmation` + 48h + không có dispute mở | Order → `completed` |
| Reminder 24h | `pending_confirmation` + 24h | Notification Buyer |
| Reminder 47h | `pending_confirmation` + 47h | Notification Buyer cuối |
| Remaining Payment Timeout | `pending_fulfillment` + 72h không thanh toán | Coi là Buyer hủy → C1 |
| Inspection SLA Alert | `inspection_deposit_pending` + 24h chưa assign | Alert Admin |

---

## 7. Checklist nghiệp vụ đã chốt

- [x] Mô hình duyệt tin: Admin approve trước khi publish
- [x] Inspector 2 chiều: Seller-initiated (pre-listing badge) + Buyer-initiated (post-SR)
- [x] Inspector có tham mưu giá (`suggested_price` trong báo cáo)
- [x] Escrow: Tài khoản ký quỹ của sàn. Admin xác nhận (không phải Seller)
- [x] SR bắt buộc, khấu trừ vào giá cuối
- [x] 2 luồng thanh toán: Có KĐ / Không KĐ
- [x] Cancel matrix: 4 kịch bản (C1-C4)
- [x] PII Seller mở sau Admin confirm SR
- [x] Phí thành công 2-3% khi completed
- [x] Review window 14 ngày
- [x] Chatbot CSKH: trong scope (rule-based FAQ)
- [x] Logistics: trong scope (semi-integrated, tracking code)
- [x] Thanh toán online (MoMo/VNPAY): ngoài scope MVP

---

*Phiên bản 2.1 — 2026-04-19*
