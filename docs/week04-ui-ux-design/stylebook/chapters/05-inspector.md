# Chương 5: Khung dashboard — Phần 5: Sidebar phải — Inspector

> **5.1 đã viết nội dung đầy đủ; 5.2–5.6 còn skeleton.** Quyết định đã chốt nằm trong `docs/week04-ui-ux-design/design-decisions.md` (§5–§9, gồm tóm tắt research yêu cầu).
> Văn phong theo các chương trước. Mọi số liệu "chốt khi dựng". Trường chưa có data ghi "chờ data".

---

## Mục lục chương

- 5.1 Định danh thiết bị
- 5.2 Alarm có cấu trúc
- 5.3 Trạng thái hiện tại & Live telemetry
- 5.4 Direct neighbors
- 5.5 Edge inspector
- 5.6 Chi tiết giả thuyết & kiểm chứng

---

## 5.1 Định danh thiết bị

Bấm chọn một node trên canvas để đưa Inspector về ngữ cảnh thiết bị đó:

- Bấm một node là chọn: Inspector chuyển ngữ cảnh thiết bị đó.
- Khi chưa có lựa chọn nào, Inspector mở sẵn danh sách thiết bị sắp xếp theo thứ tự bảng chữ cái của ID.
- Bấm một dòng trong danh sách → chọn thiết bị đó, canvas pan đưa node về giữa — như tìm kiếm (mục 4.1).
- Khi đang hiển thị thông tin thiết bị được chọn, đầu khung có nút quay lại để bỏ chọn — Inspector trở về danh sách thiết bị.
- Khi Inspector đang đóng, nếu bấm chọn một node sẽ tự mở lại khung.
- Khối định danh gồm: chấm trạng thái sức khỏe, ID và tầng thiết bị ở đầu khung; bên dưới là hãng sản xuất, model, dòng sản phẩm, vị trí lắp đặt và IP quản lý.
- Ngay dưới khối định danh là khung Quick CLI: câu lệnh truy vấn trạng thái đã điền sẵn ngữ cảnh thiết bị đang chọn, kèm một dòng mô tả ngắn câu lệnh làm gì và nút copy một lần bấm — trạng thái thiết bị vốn được đọc bằng câu lệnh truy vấn vì vậy khung này giúp cho kỹ sư không cần gõ lại lệnh mỗi lần điều tra.

[Illustration 5.1A: ảnh tĩnh — chưa chọn gì; Inspector mở danh sách thiết bị xếp theo thứ tự bảng chữ cái của ID]

[Illustration 5.1B: ảnh tĩnh — đã chọn một node; Inspector hiện khối định danh đầy đủ và khung Quick CLI kèm dòng mô tả lệnh làm gì và nút copy; đầu khung có nút quay lại để bỏ chọn]

---

## 5.2 Alarm có cấu trúc

- Alarm của thiết bị + **alarm liên quan trên thiết bị khác cùng khung thời gian** — xếp cạnh nhau theo mốc thời gian (pain point week02 §II.1).
- Cần data: alarm object (gói a — design-decisions §9).

[Illustration: chốt khi dựng]

---

## 5.3 Trạng thái hiện tại & Live telemetry

- **Uptime, tải, routes learned/used, oper_status + mốc collected_at** (week03 §III.3.a mục 4).
- Live telemetry: CPU · bộ nhớ · nhiệt độ (progress bar như prototype).

[Illustration: chốt khi dựng]

---

## 5.4 Direct neighbors

- Danh sách hàng xóm trực tiếp **kèm cổng hai đầu** (pain point "bảng cổng không thấy đầu xa") + medium, utilization, errorRatio.

[Illustration: chốt khi dựng]

---

## 5.5 Edge inspector

- Khi chọn edge: băng thông lắp đặt, mức sử dụng hiện tại, tỉ lệ lỗi, trạng thái vận hành.
- **L2** (Rx/Tx dBm, nhiệt SFP, CRC/phút) và **L3** (subnet, BGP state, OSPF cost) — **chờ data** (gói b).

[Illustration: chốt khi dựng]

---

## 5.6 Chi tiết giả thuyết & kiểm chứng

- Bấm một giả thuyết ở sidebar trái (mục 4.3) → mục này hiện **nội dung đầy đủ** của giả thuyết đang chọn: cơ sở xếp hạng, nguyên nhân chi tiết, bằng chứng ủng hộ, bằng chứng không phù hợp, hướng dẫn kiểm tra, cách xử lý gợi ý (week03 §III.3.b — chi tiết giả thuyết đang chọn; week01 — AI trả về cả bước đề xuất).
- **Nút Xác nhận / Bác bỏ nằm ở cuối phần này** — sau luồng đọc nguyên nhân → kiểm tra → xử lý; bác bỏ phải ghi lý do ngay tại đây.
- Giả thuyết là một loại lựa chọn của Inspector như node / edge — bấm node khác thì Inspector chuyển ngữ cảnh.

[Illustration: chốt khi dựng]
