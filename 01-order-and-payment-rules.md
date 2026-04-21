# Quy tắc nghiệp vụ: Mua hàng, Thanh toán và Hoàn tất

Tài liệu cố định luồng **tiền + trạng thái** — đồng bộ với [03-platform-policy.md](./03-platform-policy.md). Phiên bản này áp dụng Mô hình Mua Trực Tiếp (bỏ hoàn toàn đặt cọc).

---

## 1. Định nghĩa

| Khái niệm | Định nghĩa |
|-----------|------------|
| **Cart Lock 5 phút** | Ngay khi Buyer bấm Mua, Listing bị khóa trong 5 phút. Trong 5 phút này, Buyer điền địa chỉ, hệ thống gọi GHN lấy phí ship, sinh QR PayOS. Quá 5 phút không thanh toán: Hủy đơn, nhả Listing. |
| **Giá đề nghị** | Giá mà Seller **muốn nhận** khi bán xe (chưa trừ hoa hồng). |
| **Giá niêm yết** | Giá mà Buyer **nhìn thấy** và phải thanh toán = `Giá đề nghị + 5% (phân bổ thành phí đảm bảo an tâm cho người mua)`. |
| **Escrow (Ký quỹ Sàn)** | Sàn sẽ giữ 100% tiền thanh toán (Giá niêm yết + Phí Ship) cho đến sau khi hàng được giao thành công 48h (hoặc có khiếu nại). |
| **Duyệt trước khi đăng** | Toàn bộ xe **bắt buộc** phải qua Inspector duyệt (Online qua ảnh/video). Phí duyệt thu cố định 100.000đ khi giao dịch thành công. |
| **PayOS & GHN** | 2 API cốt lõi tự động hóa lấy vận đơn và lấy tiền. Không duyệt Bill thủ công. |

---

## 2. Trạng thái Listing liên quan giao dịch

| Status | Ý nghĩa |
|--------|---------|
| `pending_review` | Đang được Inspector kiểm định Online và Admin duyệt. |
| `published` | Đang rao bán trên sàn. **Không thể sửa** nội dung (chỉ được ẩn/xóa). |
| `locked` | Bị khóa 5 phút do có Buyer đang làm thủ tục thanh toán. |
| `sold` | Giao dịch hoàn tất. |
| `hidden` / `deleted` | Người bán chủ động ẩn hoặc gỡ bài. |

---

## 3. Mô hình mua hàng (Flow 100% Trực tiếp)

`Buyer bấm Mua → Cart Lock (Listing → locked) → Chọn địa chỉ → Hệ thống gọi GHN lấy mã vận đơn + phí Ship → Render QR PayOS → Buyer thanh toán (Giá niêm yết + Ship) → GHN xác nhận đơn vị lấy hàng → delivered → completed`

### Xử lý Ngoại Lệ Thanh Toán (PayOS)
- Nếu Webhook PayOS báo về **Số tiền khách chuyển chuyển < Số tiền niêm yết** (do khách cố tình tự sửa xóa số trên App Bank): 
  👉 Đơn hàng bị đánh dấu **Giao dịch Thất bại (Failed)**. Giỏ hàng lập tức nhả khóa. Số tiền chuyển sai này sẽ bị treo chờ Admin hoàn trả thủ công sau khi xử lý ticket. Tuyệt đối không giao hàng.

---

## 4. Kiểm định (Pre-Listing Online)

Không còn Inspector đến tận nhà. Bước này chỉ áp dụng 1 chiều **Trước khi Đăng Bài**.

`Seller Upload Ảnh/Video chi tiết
    → Auto Assign Inspector nhận task (Online, yêu cầu xử lý trong 24h)
    → Báo cáo / Đánh giá xe / Tham mưu Giá (Suggested Price)
    → Admin duyệt cuối cùng
    → Published / Rejected kèm lý do yêu cầu sửa.
`

Sẽ bị cấn trừ phí **100.000đ** cố định vào tiền giải ngân cho Seller khi xe **bán thành công**.

---

## 5. Dòng tiền & Giải ngân (Disbursement)

Khi Đơn hàng đạt `completed`, Sàn sẽ trừ phí và giải ngân cho Seller. 

**Công thức dòng tiền Sàn thu:**
- Phí kiểm định: `100.000 VNĐ` cố định.
- Phí dịch vụ: `5% x Giá đề nghị của Seller`
- Phí hoa hồng sàn: `5% x Giá đề nghị của Seller`

**Công thức Giải ngân cho Seller:**
`Tiền nhận = Giá niêm yết - 100.000đ - Phí dịch vụ - Phí hoa hồng`
*(Hay có thể hiểu nhẩm: Tiền nhận = Giá đề nghị - 100.000đ - 5% Hoa hồng)*

---

## 6. Hủy kèo, SLA & Phạt (Penalty Matrix)

| # | Tình huống (Hủy) | Hình thức Xử lý & Penalty | Phân bổ Tiền Phạt |
|---|-------------------|---------------------------|-------------------|
| **C1** | **Seller Không Chuẩn Bị Hàng** | Seller có **12h** để bấm Xác Nhận Đơn Hàng từ lúc khách cọc xong. Quá 12h: Hủy đơn, Hoàn 100% tiền cho khách. | Phạt rớt uy tín Seller / Band nick. |
| **C2** | **Buyer hủy TRƯỚC khi Seller giao cho GHN** | Phạt **5%** Giá niêm yết. Hoàn 100% phí ship cho Buyer. Phàn tiền còn lại bank ngược về Buyer. | 3% Seller <br> 2% Sàn |
| **C3** | **Buyer Bom Hàng (Không nhận / GHN hoàn trả)** | Phạt cao hơn: **10% Giá niêm yết HOẶC số tiền phí ship 2 chiều (tùy mức nào lớn hơn sẽ áp mức đó)**. Mục đích để chắc chắn đủ đền phí ship cồng kềnh cho xe đạp bị quay đầu. | Đền đủ Ship 2 mặt cho Seller. Phần thừa (nếu có) Sàn hưởng 3. |
| **C4** | **Xe sai mô tả nặng / Gãy nứt** (Dispute - Sàn phán Buyer đúng) | Hoàn **100%** Tiền Xe và Phí Ship cho Buyer. <br> **Seller phải đền** tiền Ship cho hệ thống. | 0 |

---

## 7. Hoàn tất giao dịch & Khiếu Nại (Dispute SLA)

Trạng thái:
`payos_confirmed → picking_up → in_transit → delivered → pending_confirmation → completed`

1. Việc cập nhật trạng thái từ `payos_confirmed` đến `delivered` thông qua Webhook của GHN.
2. Đơn ở `pending_confirmation` sau 48h không có khiếu nại -> Chuyển `completed`.
3. **Khi Khiếu Nại (Dispute):** Buyer mở khiếu nại **bắt buộc phải Upload Video Unbox trong vòng 24 tiếng**. Nếu quá 24h không có video tải lên -> Sàn tự động Đóng Khiếu Nại (Xử Buyer thua lôm côm) và giải ngân cho Seller ngay lập tức.
4. Có dispute mở (đủ video 24h) -> Chặn auto-complete chờ Admin phán xử.
