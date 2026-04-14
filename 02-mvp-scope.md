# Phạm vi MVP — Used Sports Bicycle Exchange

Tài liệu chốt phạm vi **phiên bản 1 (MVP)** để triển khai nhanh, đo lường được, đồng bộ với [03-platform-policy.md](./03-platform-policy.md) và [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md).

## 0. Chốt kinh doanh V1 (tóm tắt)

| Hạng mục | Quyết định |
|----------|------------|
| **Địa lý** | Chỉ vận hành tại **Hà Nội**, **TP. Hồ Chí Minh**, **Đà Nẵng**. |
| **Seller** | Chỉ **cá nhân**. |
| **Vai trò sàn** | **Cầu nối + trung gian thanh toán** (thu/chi theo quy tắc cọc, phí kiểm định, phí thành công). |
| **Phí** | Niêm yết: **miễn phí V1**; Kiểm định: theo bảng giá; Thành công: **2–3%** (khi `completed`). |
| **Mô hình cọc** | **2 lớp**: Soft Reserve (200k-500k) và Inspection Deposit (5%-10%, trần 2 triệu, thu khi yêu cầu kiểm định). |
| **PII Seller** | SĐT + địa chỉ cụ thể chỉ sau **Soft Reserve đã xác nhận** (không chỉ sau đăng nhập). |

## 1. Vai trò trong v1

| Vai trò | Trong MVP? | Ghi chú |
|---------|-------------|---------|
| **Guest** | Có | Xem danh sách + chi tiết; **không** thấy SĐT & địa chỉ đầy đủ của Seller cho đến khi (Buyer đã đăng nhập và) có **Soft Reserve xác nhận** trên đơn liên quan — xem 03-B.2. |
| **Buyer** | Có | Đăng ký/đăng nhập, lọc/tìm trong 3 TP, wishlist, Soft Reserve, yêu cầu kiểm định + Inspection Deposit, đánh giá sau `completed`. |
| **Seller** | Có | Cá nhân: đăng tin (bắt buộc serial + ảnh groupset để duyệt), quản lý tin, ví/phạt (khi có module ví). |
| **Admin** | Có | Duyệt tin (kể cả duyệt lại sau chỉnh sửa >10%), đối chiếu serial, user, phí, tranh chấp theo ma trận 03-F. |
| **Inspector** | Có | **Kịch bản chuẩn:** đến nhà Seller sau khi Buyer đã cọc → upload báo cáo → Buyer quyết định tiếp tục / hủy (theo 01). |

**Ngoài phạm vi MVP:** Chatbot, logistics API đầy đủ, cổng thanh toán + escrow nâng cao — [SRS.md](./SRS.md) mục 6, [ERD-and-API.md](./ERD-and-API.md) mục 5. *V1 vẫn có thể dùng offline + trạng thái vận chuyển thủ công cho đến khi tích hợp.*

## 2. Thanh toán trong MVP

| Lựa chọn | Quyết định MVP |
|----------|-----------------|
| **Offline (chuyển khoản + xác nhận)** | **Có — mặc định v1** nếu chưa có PSP; áp dụng cho Inspection Deposit và phần thanh toán còn lại, có đối soát proof + Admin override. |
| **Escrow / cổng thanh toán** | Bật dần theo [SRS.md](./SRS.md) mục 6; v1 vẫn chuẩn hóa trạng thái giao nhận theo `delivered` → `pending_confirmation` → `completed`. |

## 3. Chức năng ưu tiên theo sprint (gợi ý)

**Sprint 1 — Niêm yết & 3 TP**

- Auth; listing với **serial khung** + **ảnh groupset**; geo gate HN/HCM/ĐN.
- `draft` → `pending_review` → `published`; Admin + checklist trộm cắp (thủ công v1).

**Sprint 2 — Cọc & PII**

- Bật **Soft Reserve** (200k-500k) để giữ chỗ; sau Soft Reserve xác nhận mới lộ SĐT/địa chỉ đầy đủ.
- Bật bước **Yêu cầu kiểm định + Inspection Deposit** (5%-10%, trần 2 triệu).
- Khóa sửa tin khi có order active; chỉnh sửa >10% → `pending_review`.

**Sprint 3 — Kiểm định & đơn**

- Luồng Inspector tại nhà Seller → báo cáo → Buyer tiếp tục / hủy (hoàn cọc nếu lỗi nặng).
- Phí kiểm định: Buyer trả nếu đúng mô tả; Seller trả nếu sai lệch nghiêm trọng.
- **Giữ an toàn MVP:** chỉ hỗ trợ mode kiểm định on-demand; mô hình pre-inspection để v1.1 (ERD mở sẵn trường mode).

**Sprint 4 — Vận hành & khiếu nại**

- Nút **Khiếu nại** trên đơn + SLA 8h/48h (03-F).
- Dashboard; phí thành công 2–3% khi `completed`.
- Chuẩn hóa trạng thái sau giao hàng: `pending_confirmation` + auto-confirm 48h nếu không có khiếu nại mở.

## 4. Tiêu chí “Done” MVP (đo được)

1. Seller tại 1 trong 3 TP đăng tin đủ serial + groupset → Admin duyệt → Buyer xem (chưa thấy PII đầy đủ).
2. Buyer Soft Reserve xác nhận → thấy PII → Buyer yêu cầu kiểm định + đóng Inspection Deposit → một vòng **kiểm định tại nhà** → báo cáo trên app.
3. Một đơn đến `completed` (theo 01 mục 4) + **phí thành công** ghi nhận + đánh giá.
4. Một khiếu nại tạo từ đơn kèm SLA xác nhận.

## 5. Phi chức năng tối thiểu

- HTTPS, hash mật khẩu, rate limit đăng nhập.
- RBAC.
- Audit log; **retention** theo [03-platform-policy.md](./03-platform-policy.md) mục G.

---

*Phạm vi đồng bộ [SRS.md](./SRS.md), [ERD-and-API.md](./ERD-and-API.md).*
