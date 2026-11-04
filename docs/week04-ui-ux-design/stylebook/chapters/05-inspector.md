# Chương 5: Khung dashboard — Phần 5: Sidebar phải — Inspector

> **5.0–5.2 đã viết nội dung đầy đủ; 5.3–5.6 còn skeleton.** Quyết định đã chốt nằm trong `docs/week04-ui-ux-design/design-decisions.md` (§5–§9, gồm tóm tắt research yêu cầu).
> Văn phong theo các chương trước. Mọi số liệu "chốt khi dựng". Trường chưa có data ghi "chờ data".

---

## Mục lục chương

- 5.0 Nguyên tắc chung
- 5.1 Định danh thiết bị
- 5.2 Cảnh báo
- 5.3 Trạng thái hiện tại & Live telemetry
- 5.4 Direct neighbors
- 5.5 Edge inspector
- 5.6 Chi tiết giả thuyết & kiểm chứng

---

## 5.0 Nguyên tắc chung

Các Tab thuộc Inspector hiển thị thông tin xoay quanh thiết bị mà kỹ sư đang chọn:

- Khi kỹ sư không chọn thiết bị nào, Inspector sẽ thể hiện danh sách thiết bị.
- Khi kỹ sư chọn một thiết bị thì các tab Inspector sẽ đều thể hiện thông tin của thiết bị đó. Ví dụ Tab định danh thiết bị (mục 5.1) sẽ thể hiện thông tin của thiết bị và Tab cảnh báo (mục 5.2) sẽ thể hiện cảnh báo của chính thiết bị đó.
- Đang chọn thiết bị, đầu Inspector luôn hiện dải định danh: nút quay lại, chấm trạng thái sức khỏe, ID và tầng thiết bị — chrome chung nằm trên thanh tab, mọi tab đều thấy.
- Đang chọn thiết bị, dưới dải định danh là thanh tab để chuyển giữa các tab; tab đang mở được đánh dấu bằng gạch chân. Bấm một tab khác → nội dung tab đó hiện ngay, thiết bị đang chọn giữ nguyên.
- Bấm một dòng trong danh sách → chọn thiết bị đó, canvas pan đưa node về giữa — như tìm kiếm (mục 4.1).
- Nút quay lại ở dải định danh bỏ chọn — Inspector trở về danh sách thiết bị.
- Khi Inspector đang đóng, nếu bấm chọn một node sẽ tự mở lại khung.

---

## 5.1 Định danh thiết bị

Tab định danh thiết bị là nơi lưu thông tin cụ thể của thiết bị mà kỹ sư đang chọn:

- Tab định danh gồm: hãng sản xuất, model, dòng sản phẩm, vị trí lắp đặt và IP quản lý.
- Ngay dưới khối thông tin là khung Quick CLI: câu lệnh truy vấn trạng thái đã điền sẵn ngữ cảnh thiết bị đang chọn, kèm một dòng mô tả ngắn câu lệnh làm gì và nút copy một lần bấm — trạng thái thiết bị vốn được đọc bằng câu lệnh truy vấn vì vậy khung này giúp cho kỹ sư không cần gõ lại lệnh mỗi lần điều tra.

[Illustration 5.1A: ảnh tĩnh — chưa chọn gì; Inspector mở danh sách thiết bị xếp theo thứ tự bảng chữ cái của ID]

[Illustration 5.1B: ảnh tĩnh — đã chọn một node; đầu Inspector là dải định danh chung và thanh tab với tab Định danh đang mở; tab hiện thông tin hãng, model, dòng sản phẩm, vị trí lắp đặt, IP quản lý và khung Quick CLI kèm dòng mô tả lệnh làm gì và nút copy]

---

## 5.2 Cảnh báo

Tab cảnh báo là nơi lưu thông tin tất cả cảnh báo (gồm cả cảnh báo thuộc sự cố hiện tại và cảnh báo không thuộc sự cố hiện tại) của thiết bị mà kỹ sư đang chọn:

- Mỗi cảnh báo một dòng gồm thời điểm, mã lỗi, mức độ warning/error mã hoá bằng màu chấm như timeline (mục 4.2).
- Các cảnh báo sẽ có màu đỏ cho error, màu vàng cho warning. Đối với cảnh báo không thuộc sự cố hiện tại thì cảnh báo đó sẽ có màu xám.
- Bấm một cảnh báo → Inspector hiển thị thông tin chi tiết về cảnh báo đó.
- Bấm mã lỗi → panel tài liệu trượt ra sát mép trái canvas như mục 4.2; wiki đầy đủ mở tab mới.

[Illustration 5.2A: ảnh tĩnh — đang chọn CORE-02; thanh tab với tab Cảnh báo đang mở; tab liệt kê các cảnh báo của CORE-02; canvas giữ nguyên]

[Illustration 5.2B: ảnh tĩnh — bấm một dòng ở tab Cảnh báo; tab chuyển sang chi tiết của cảnh báo đó, nút ← DANH SÁCH quay lại danh sách; canvas giữ nguyên]

[Illustration 5.2C: ảnh tĩnh — bấm mã lỗi; panel tài liệu trượt ra sát mép trái canvas như mục 4.2; wiki đầy đủ mở tab mới]

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
