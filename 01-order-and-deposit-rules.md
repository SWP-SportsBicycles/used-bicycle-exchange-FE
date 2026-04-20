# Quy tắc nghiệp vụ: Đặt cọc, kiểm định, hoàn tất đơn

Tài liệu cố định luồng **tiền + trạng thái** — đồng bộ với [03-platform-policy.md](./03-platform-policy.md).

---

## 1. Định nghĩa

| Khái niệm | Định nghĩa |
|-----------|------------|
| **Soft Reserve (SR)** | Cọc lớp 1: **200.000đ - 500.000đ** (config Admin, fixed theo gói). Mục đích: khóa listing, mở PII Seller. **SR được khấu trừ vào giá cuối** — không phải phí riêng. |
| **Inspection Deposit (ID)** | Cọc lớp 2: `min(rate_inspection × giá niêm yết, 2.000.000 VND)` với `rate_inspection` trong khoảng **5%-10%** (Admin config). Chỉ thu khi Buyer bấm **Yêu cầu kiểm định**. |
| **Giữ chỗ** | Sau khi Admin confirm SR → Listing → `reserved`; không nhận Buyer khác cho cùng listing. |
| **Escrow sàn** | Toàn bộ tiền Buyer nộp (SR, ID, phần còn lại) đều vào **tài khoản ký quỹ của sàn**. Admin xác nhận từng khoản. Seller nhận tiền khi order `completed` (sàn giải ngân, trừ phí thành công). |
| **Phần còn lại** | Giá xe − SR đã nộp (nếu không KĐ) **hoặc** giá xe − SR − ID đã nộp (nếu có KĐ và xe đúng mô tả — Buyer trả phí KĐ). |

---

## 2. Trạng thái Listing liên quan giao dịch

| Status | Ý nghĩa |
|--------|---------|
| `published` | Đang rao bán, mở cho mọi Buyer |
| `reserved` | SR đã Admin confirm — đang trong luồng KĐ/mua |
| `sold` | Giao dịch hoàn tất |
| `withdrawn` | Seller ẩn/gỡ (bị chặn khi có order active) |

**Quy tắc:**
- Một listing chỉ **1 order active** tại một thời điểm.
- Khi có order active → hệ thống **chặn** Seller sửa giá/spec.
- Sửa giá >10% hoặc spec nhạy cảm (khi không có order active) → `pending_review`.

---

## 3. Mô hình thanh toán — 2 luồng

### Luồng A: Có kiểm định

`SR → Admin confirm → Buyer yêu cầu KĐ + nộp ID → Admin confirm ID → Admin assign Inspector → Inspector báo cáo → Buyer tiếp tục/hủy → Thanh toán phần còn lại → Admin confirm → delivered → completed`

**Phần còn lại (nếu xe ok, Buyer tiếp tục):**
`= Giá xe − SR − phí KĐ`
*(Phí KĐ = ID nếu xe đúng mô tả — Buyer trả. Nếu xe sai lệch nặng → Seller trả, hoàn SR + ID cho Buyer)*

### Luồng B: Không kiểm định

`SR → Admin confirm → Buyer thanh toán 1 lần phần còn lại → Admin confirm → delivered → completed`

**Phần còn lại:**
`= Giá xe − SR`

| Tham số | Giá trị |
|---------|---------|
| Soft Reserve (Lớp 1) | **200.000đ - 500.000đ** (config gói, fixed khi tạo order) |
| Inspection Deposit (Lớp 2) | `min(rate_inspection × giá xe, 2.000.000đ)`, rate **5%-10%** |
| Điều kiện thu lớp 2 | Buyer bấm **Yêu cầu kiểm định** (không thu trước) |
| SLA thanh toán phần còn lại | **72h** kể từ khi Buyer bấm "Tiếp tục mua" sau báo cáo KĐ |
| Gia hạn thanh toán | Tối đa **1 lần**, **24h**, cần Admin approve |

---

## 4. Kiểm định (2 chiều)

### 4A. Buyer-initiated (On-demand sau SR) — Luồng chính trong Order

`
Buyer SR confirmed
    → Buyer bấm "Yêu cầu kiểm định"
    → Nộp Inspection Deposit vào escrow sàn
    → Admin confirm ID + Assign Inspector (SLA: 24h)
    → Inspector đến nhà Seller kiểm tra
    → Inspector upload báo cáo (checklist + ảnh + suggested_price)
    → Buyer đọc báo cáo → Tiếp tục / Hủy
`

### 4B. Seller-initiated (Pre-listing Certification) — Ngoài Order flow

`
Seller tạo draft listing
    → Seller bấm "Xin kiểm định VeloSafe trước khi đăng"
    → Nộp phí KĐ vào escrow sàn (Seller trả, Admin config)
    → Admin assign Inspector (SLA: 24h)
    → Inspector đến nhà Seller kiểm tra
    → Inspector upload báo cáo + suggested_price:
        • pass / minor_issues  → Listing gắn badge ✅ VeloSafe Certified
        • severe_mismatch      → Seller biết, chỉnh sửa rồi request lại
    → Seller submit listing → Admin duyệt (ưu tiên listing đã có báo cáo KĐ)
`

---

## 5. Phí kiểm định — ai trả

| Kết quả KĐ | Người trả phí KĐ |
|------------|-----------------|
| Xe **đúng mô tả** (pass / minor_issues) | **Buyer** |
| Xe **sai lệch nghiêm trọng** (severe_mismatch) | **Seller** — trừ từ escrow |
| Seller-initiated (pre-listing) | **Seller** luôn luôn |

---

## 6. Hoàn tất giao dịch (Order → `completed`)

State machine giao nhận/hoàn tất:

`delivered → pending_confirmation → completed` (bởi Buyer xác nhận hoặc auto-confirm)

Đơn chuyển `completed` khi **một trong hai** điều kiện xảy ra ở `pending_confirmation`:
1. Buyer nhấn **"Đã nhận hàng"**; hoặc
2. **48 giờ** kể từ khi Seller/Admin đánh dấu `delivered` **mà không có khiếu nại** đang mở.

**Nhắc việc:**
- Nhắc Buyer ở mốc 24h và 47h khi ở `pending_confirmation`.
- Nếu có khiếu nại mở → không auto-complete; giữ trạng thái theo luồng tranh chấp.

Sau `completed`: áp dụng **phí thành công 2–3%** (Admin config), sàn giải ngân cho Seller, mở cửa sổ **đánh giá 14 ngày**, listing → `sold`.

---

## 7. Hủy kèo & phân bổ cọc (4 kịch bản)

**Nguyên tắc:** Ai có lỗi, người đó chịu thiệt thòi. Mọi quyết định phân bổ gắn audit trail.

| # | Kịch bản | Phân bổ |
|---|----------|---------|
| **C1** | **Buyer tự hủy** (không do Seller lỗi, không do xe sai — kể cả no-show / quá hạn thanh toán còn lại) | Mất SR → **70% Seller / 30% Sàn** |
| **C2** | **Buyer hủy vì xe sai lệch nghiêm trọng** (báo cáo Inspector xác nhận `severe_mismatch`) | Hoàn **100%** SR + ID cho Buyer. **Phí KĐ → Seller chịu**. |
| **C3** | **Seller hủy** hoặc không giao hàng / không hợp tác | Hoàn **100%** toàn bộ khoản đã nộp cho Buyer. **Ghi vi phạm** vào profile Seller. |
| **C4** | **Admin quyết định** sau dispute | Theo bằng chứng — Admin toàn quyền phân bổ theo ma trận 03-F.3. |

---

## 8. Order State Machine (chính thức)

`
pending_payment
    │ [Admin confirm SR]
    ▼
soft_reserved  ←─ Listing → reserved. PII Seller mở.
    │
    ├── [Có KĐ → Buyer nộp ID] ──► inspection_deposit_pending
    │                                      │ [Admin confirm ID + Assign Inspector]
    │                                      ▼
    │                                 inspection
    │                                      │ [Inspector submit báo cáo]
    │                           [xe ok] ──┤── [severe_mismatch]
    │                              │            │
    │                              │       cancelled (hoàn 100%)
    │                              │
    └── [Không KĐ] ───────────────►▼
                            pending_fulfillment
                                   │ [Admin confirm thanh toán còn lại]
                                   ▼
                               delivered  ← [Seller/Admin đánh dấu]
                                   │
                                   ▼
                          pending_confirmation
                          [Nhắc 24h, 47h]
                                   │
              [Buyer confirm] hoặc [48h auto] hoặc [Dispute]
                    │                                  │
                    ▼                                  ▼
                completed                          disputed
           [Giải ngân Seller]                 [Admin xử lý → C4]
           [Listing → sold]                        │
           [Review 14 ngày]               cancelled hoặc completed
`

---

## 9. SLA kiểm định

| Mốc | SLA |
|-----|-----|
| Admin assign Inspector sau confirm ID/phí | Trong **24h làm việc** |
| Inspector submit báo cáo sau buổi kiểm tại nhà | Trong **48h** |

---

## 10. Audit

Mọi thay đổi `Order`, `Listing`, phân bổ cọc, quyết định hoàn: **actor**, **timestamp**, **lý do**, **attachment** (nếu có).

---

*Đầu vào cho SRS (Order, Payment, Inspection) và cấu hình Admin (FeeRule).*
