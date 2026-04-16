# Chính sách nền tảng (đã chốt)

Tài liệu tổng hợp các quyết định nghiệp vụ **A, B, C, F, G** — làm **source of truth** cùng [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md). Cập nhật SRS/ERD khi có thay đổi chính sách.

---

## A. Vai trò sàn, phí, phạm vi địa lý (V1)

### A.1 Định vị pháp lý & vận hành

- Sàn đóng **hai vai trò đồng thời:**
  1. **Cầu nối thông tin:** kết nối Buyer–Seller, công cụ đăng tin, tìm kiếm, kiểm định, hỗ trợ tranh chấp.
  2. **Trung gian thanh toán:** thu/chi phân bổ theo quy tắc (cọc, phí kiểm định, phí thành công, hoàn tiền) — triển khai dần qua ví/escrow theo [SRS.md](./SRS.md) mục 6.

*(Điều khoản dịch vụ & hóa đơn thuế cần tư vấn pháp riêng; tài liệu kỹ thuật chỉ neo quy tắc vận hành.)*

### A.2 Mô hình phí

| Loại phí | V1 | Ghi chú |
|-----------|-----|---------|
| **Phí niêm yết** | **Miễn phí** | Có thể bật sau khi thị trường ổn định. |
| **Soft Reserve** | **200.000đ - 500.000đ** (config Admin) | Giữ chỗ + mở quyền tương tác theo policy; phân bổ theo ma trận fault. |
| **Phí kiểm định** | Thu theo bảng giá `FeeRule` | Phân bổ người trả theo [01](./01-order-and-deposit-rules.md) mục kiểm định. |
| **Inspection Deposit** | **5%-10%** giá xe, trần **2.000.000đ** | Thu khi Buyer bấm yêu cầu kiểm định; cấu hình rate bởi Admin. |
| **Phí thành công** | **2%–3%** giá trị giao dịch (config Admin, áp khi `completed`) | Trừ vào tiền về Seller hoặc ghi nhận công nợ theo cấu hình thanh toán. |

### A.3 Phạm vi địa lý V1

- Hoạt động **tập trung ba thành phố lớn:** **Hà Nội**, **TP. Hồ Chí Minh**, **Đà Nẵng**.
- Listing / địa chỉ giao–nhận–kiểm định phải nằm trong phạm vi vận hành (validate theo tỉnh/thành hoặc polygon — chi tiết kỹ thuật triển khai sau).

---

## B. Người bán & hiển thị PII

### B.1 Loại Seller (V1)

- Chỉ **cá nhân** (không mở cửa hàng đa chi nhánh trong V1; có thể mở rộng sau).

### B.2 Quy tắc hiển thị SĐT & địa chỉ cụ thể

- **Số điện thoại** và **địa chỉ cụ thể** của Seller **chỉ hiển thị** sau khi Buyer đã thực hiện **Soft Reserve (lớp 1)** và khoản này ở trạng thái **đã xác nhận**.
- Mục đích: giảm **“nhảy deal”** ra ngoài sàn để trốn phí; đồng thời vẫn cho Guest/Buyer chưa cọc xem mô tả, ảnh, thông số.

*(Có thể vẫn hiển thị quận/huyện mức thô trước cọc — tùy sản phẩm UI; chốt tối thiểu: không lộ SĐT + địa chỉ đầy đủ trước cọc.)*

---

## C. Kiểm duyệt tin & chỉnh sửa sau khi đăng

### C.1 Tiêu chí duyệt tin (bắt buộc để `published`)

| Yêu cầu | Mô tả |
|---------|--------|
| **Số khung (Serial / frame number)** | Bắt buộc khai báo; Admin đối chiếu **danh sách xe nghi mất cắp** (cập nhật thủ công hoặc nguồn ngoài — tích hợp API sau). Không duyệt nếu trùng hoặc nghi ngờ cao (quy trình Admin). |
| **Ảnh groupset cận cảnh** | Tối thiểu **01 ảnh** cận cảnh bộ truyền động (groupset) để xác minh mức độ tin rao. |

Các tiêu chí khác (ảnh tổng thể, giá, danh mục…) giữ theo SRS.

### C.2 Chỉnh sửa tin đã `published`

- Nếu Seller sửa **Giá** so với bản đã duyệt **> 10%** (theo % thay đổi tương đối), **hoặc** sửa **Cấu hình xe** với mức thay đổi **> 10%** theo **metric nội bộ** (trọng số các trường spec do Admin cấu hình; ví dụ đổi groupset lên một tier lớn tính là vượt ngưỡng):
  - Tin chuyển về **`pending_review` (Chờ duyệt)**.
  - Không hiển thị bản chỉnh sửa ra công chúng cho đến khi Admin duyệt lại.
- **MVP đơn giản hóa (triển khai tối thiểu):** kích hoạt `pending_review` khi **(i)** thay đổi giá >10% **hoặc** **(ii)** thay đổi bất kỳ trường thuộc danh sách **spec nhạy cảm** (groupset, size khung, loại phanh, …) — song song vẫn nên hoàn thiện metric % để đồng nhất với chính sách “>10% cấu hình”.
- Mục đích: tránh **đánh tráo** sau khi khách đã quan tâm.

**Khi có Order đang active:** áp dụng **khóa sửa** giá/spec theo [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md) mục 2.

---

## F. Khiếu nại, SLA & ma trận xử lý (Admin)

### F.1 Kênh tiếp nhận

| Ưu tiên | Kênh | Ghi chú |
|---------|------|---------|
| **1** | Nút **“Khiếu nại”** trong **đơn hàng** | Tự động đính kèm `order_id`, lịch sử chat (nếu có), thông tin các bên. |
| **2** | **Email hỗ trợ** | Lỗi kỹ thuật tài khoản, vấn đề pháp lý nặng. |

### F.2 SLA

| Sự kiện | SLA |
|---------|-----|
| **Xác nhận đã nhận khiếu nại** | Trong **8 giờ làm việc** |
| **Quyết định xử lý cuối cùng** | Trong **48 giờ làm việc** kể từ khi **đủ bằng chứng** (bổ sung bằng chứng reset thời điểm “đủ” — ghi log). |

### F.3 Ma trận quyết định (tóm tắt)

| Tình huống | Bằng chứng cần có | Quyết định hướng xử lý (Admin) |
|-------------|-------------------|--------------------------------|
| Buyer báo **hàng không đúng mô tả** (sau nhận) | Ảnh thực tế + clip đồng kiểm (nếu có) + **báo cáo Inspector** | Nếu đúng sai lệch: **hoàn tiền** theo đơn; **Seller chịu phí ship hai chiều** (ghi nhận công nợ / trừ thanh toán). |
| **Hư hỏng do vận chuyển** | Clip khui hàng + biên bản với **đơn vị logistics** | Sàn **giữ tiền** (escrow) để làm việc logistics **bồi thường**; cập nhật Buyer khi có kết quả. |
| Buyer **đổi ý**, không nhận hàng (không lỗi Seller) | Lịch sử chat, log hẹn, bằng chứng không có lỗi xe/Seller | Áp dụng **fault-based matrix**: `buyer_no_fault_cancel` = **70% Seller / 30% Sàn** (khoản cọc đã thu tương ứng case). |
| Buyer **no-show / quá hạn cam kết** | Log hẹn, log nhắc việc, timeline SLA | Áp dụng `buyer_no_show` = **80% Seller / 20% Sàn** (khoản cọc đã thu tương ứng case). |
| **Seller không giao** | Quá hạn vận chuyển + Seller không phản hồi chat | **Hoàn 100% cọc** cho Buyer + **phạt / cảnh báo** tài khoản Seller. |
| **Lỗi hệ thống** ảnh hưởng giao dịch | Audit kỹ thuật, incident report, log payment/state | Áp dụng `system_fault` = **hoàn 100%** khoản đã thu cho Buyer. |

*(Chi tiết số tiền hoàn từng bước neo theo trạng thái `Payment` / escrow.)*

---

## G. Lưu trữ dữ liệu & quyền nội dung

### G.1 Thời hạn lưu trữ

| Loại dữ liệu | Thời hạn |
|--------------|----------|
| **Tin đăng** (đã đóng / đã bán) | Tối thiểu **12 tháng** (đối soát thuế, tranh chấp muộn). |
| **Dữ liệu định danh (KYC)** | Trong suốt thời gian tài khoản hoạt động + **24 tháng** sau khi xóa tài khoản (neo quy định phòng chống tội phạm mạng — cần rà soát pháp lý địa phương). |
| **Ảnh / video sản phẩm** | Sau **6 tháng** kể từ khi tin **đóng**, được phép **nén hoặc chuyển tầng lưu trữ giá rẻ** (cold storage) để tối ưu chi phí. |

### G.2 Content license (Seller → Sàn)

- Khi Seller tải ảnh/video lên nền tảng, Seller **cấp quyền** cho Sàn: **sử dụng, sao chép, hiển thị** để vận hành dịch vụ và **quảng bá nền tảng** (ví dụ Fanpage, chiến dịch marketing), không chuyển nhượng độc quyền ngoài mục đích đó trừ khi có thỏa thuận khác.

### G.3 Bảo vệ dữ liệu cá nhân

- Sàn **cam kết không bán** SĐT, địa chỉ cụ thể cho bên thứ ba **ngoài** mục đích thực hiện giao dịch / **logistics** (chỉ tiết lộ tối thiểu cần thiết cho đối tác vận chuyển khi có shipment).

---

*Phiên bản tài liệu: 1.0 — đồng bộ với quyết định chủ sở hữu sản phẩm.*
