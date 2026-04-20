# Phạm vi MVP — Used Sports Bicycle Exchange

Tài liệu chốt phạm vi **phiên bản 1 (MVP)** — đồng bộ với [03-platform-policy.md](./03-platform-policy.md) và [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md).

## 0. Chốt kinh doanh V1

| Hạng mục | Quyết định |
|----------|------------|
| **Địa lý** | Chỉ vận hành tại **Hà Nội**, **TP. Hồ Chí Minh**, **Đà Nẵng**. |
| **Seller** | Chỉ **cá nhân**. |
| **Vai trò sàn** | Cầu nối + trung gian thanh toán (thu/chi theo quy tắc cọc, phí KĐ, phí thành công). |
| **Phí** | Niêm yết: miễn phí V1; Kiểm định: theo bảng giá; Thành công: **2–3%** (khi `completed`). |
| **Mô hình cọc** | **2 lớp**: SR (200k-500k, **khấu trừ vào giá cuối**) và Inspection Deposit (5%-10%, trần 2 triệu, chỉ thu khi Buyer yêu cầu KĐ). |
| **PII Seller** | SĐT + địa chỉ cụ thể chỉ sau **Soft Reserve được Admin xác nhận**. |
| **Escrow** | **Tài khoản ký quỹ của sàn** — Buyer chuyển khoản, upload chứng từ, **Admin xác nhận**. Seller không xác nhận thanh toán. |

## 1. Vai trò trong v1

| Vai trò | MVP? | Ghi chú |
|---------|------|---------|
| **Guest** | ✅ | Xem listing + chi tiết; không thấy SĐT/địa chỉ đầy đủ Seller. |
| **Buyer** | ✅ | Đăng ký/đăng nhập, tìm kiếm, wishlist, Soft Reserve, yêu cầu KĐ, xác nhận nhận hàng, khiếu nại, đánh giá. |
| **Seller** | ✅ | Đăng tin (serial + ảnh groupset bắt buộc), **tùy chọn book Inspector trước khi đăng** (badge VeloSafe), quản lý tin, xem đơn, nhập tracking code. |
| **Admin** | ✅ | Duyệt tin, **xác nhận thanh toán escrow**, assign Inspector, quản lý user, xử lý tranh chấp, dashboard. |
| **Inspector** | ✅ | Nhận phân công → đến nhà Seller → upload báo cáo + checklist + **suggested_price** (giá tham mưu). Phục vụ cả **Seller-initiated** (pre-listing badge) và **Buyer-initiated** (on-demand sau SR). |

## 2. Thanh toán trong MVP

| Phương thức | Quyết định |
|-------------|------------|
| **Escrow tài khoản sàn** | **Mặc định V1** — Buyer chuyển khoản thủ công vào TK ký quỹ sàn, upload chứng từ, Admin xác nhận. |
| **Cổng thanh toán online** | Ngoài phạm vi MVP (MoMo, VNPAY, ZaloPay) — bật theo SRS mục 6. |

## 3. Logistics trong MVP

**Semi-integrated:** Seller chọn phương thức giao (tự giao / bên thứ ba), nhập **tracking code** từ GHN / GHTK / Viettel Post. Buyer thấy link theo dõi. Admin/Seller đánh dấu `DELIVERED` thủ công. Không cần tích hợp API hãng vận chuyển trong MVP.

## 4. Chatbot CSKH trong MVP

**Floating chat widget** góc phải màn hình — không cần đăng nhập. Rule-based FAQ về quy trình mua/bán, kiểm định, escrow, khiếu nại. Câu không giải quyết được → hướng đến email hỗ trợ / Admin.

## 5. Chức năng theo sprint (gợi ý)

**Sprint 1 — Niêm yết & Auth**
- Auth (Login, Register, Forgot password). Listing với serial + ảnh groupset. Geo gate HN/HCM/ĐN.
- `draft` → `pending_review` → `published`; Admin duyệt.

**Sprint 2 — Cọc & Escrow & PII**
- SR → Buyer chuyển khoản + upload chứng từ → Admin confirm → lộ PII.
- Luồng B (không KĐ): Buyer thanh toán 1 lần phần còn lại ngay sau SR.
- Khóa sửa tin khi có order active; sửa >10% → `pending_review`.

**Sprint 3 — Kiểm định (2 chiều)**
- **Buyer-initiated:** SR → Yêu cầu KĐ → Inspection Deposit → Admin assign → Inspector báo cáo → Buyer quyết định.
- **Seller-initiated:** Seller book Inspector trước khi submit listing → badge VeloSafe Certified.
- Inspector upload báo cáo + `suggested_price`.

**Sprint 4 — Giao nhận, Khiếu nại & Mở rộng**
- Logistics semi-integrated (tracking code).
- `delivered` → `pending_confirmation` + auto-confirm 48h + nhắc 24h/47h.
- Nút Khiếu nại + SLA 8h/48h. Dashboard Admin. Phí 2-3%. Review 14 ngày.
- Chatbot FAQ.

## 6. Tiêu chí "Done" MVP

1. Seller đăng tin → Admin duyệt → Buyer xem (chưa thấy PII).
2. Buyer SR → Admin confirm → thấy PII → 2 luồng: có KĐ / không KĐ.
3. Luồng KĐ: Inspector đến nhà Seller → báo cáo → Buyer quyết định.
4. Một đơn đến `completed` + phí thành công + đánh giá.
5. Một khiếu nại tạo từ đơn kèm SLA xác nhận.
6. Chatbot trả lời ≥5 câu hỏi thường gặp.
7. Seller nhập tracking code → Buyer thấy link theo dõi.

## 7. Phi chức năng tối thiểu

- HTTPS, hash mật khẩu, rate limit đăng nhập.
- RBAC (Guest / Buyer / Seller / Inspector / Admin).
- Audit log mọi thay đổi trạng thái Order và Listing.

---

*Phạm vi đồng bộ [SRS.md](./SRS.md), [ERD-and-API.md](./ERD-and-API.md).*
