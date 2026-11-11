# Chương 5: Khung dashboard — Phần 5: Sidebar phải — Inspector

> **5.0–5.4 đã viết nội dung đầy đủ.** Chi tiết giả thuyết đã dời về sidebar trái (mục 4.3).
> Văn phong theo các chương trước. Mọi số liệu "chốt khi dựng". Trường chưa có data ghi "chờ data".

---

## Mục lục chương

- 5.0 Nguyên tắc chung
- 5.1 Định danh thiết bị
- 5.2 Cảnh báo
- 5.3 Trạng thái hiện tại & Live telemetry
- 5.4 Edge inspector

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

Tab trạng thái là nơi theo dõi tình trạng vận hành hiện tại của thiết bị mà kỹ sư đang chọn:

- Phần trạng thái hiển thị tất cả các trạng thái của thiết bị (oper_status, uptime, mức tải, routes learned/used, CPU, bộ nhớ, nhiệt độ, …), kèm mốc collected_at — thời điểm dữ liệu được thu thập; trạng thái chỉ đáng tin đến mốc đó.
- Một số trạng thái có dạng timeseries — bấm vào trạng thái đó, trạng thái được highlight, phần live telemetry bên dưới có một line cho trạng thái được highlight.
- Phần live telemetry là một line chart, có các quick button để chỉnh thời gian (gồm mốc thời gian và khoảng thời gian).
- Mặc định ban đầu là không có timeseries telemetry nào được highlight, phần đồ thị bên dưới không hiện line nào.

[Illustration 5.3A: ảnh tĩnh — đang chọn CORE-02; thanh tab với tab Trạng thái đang mở; tab hiện tất cả các trạng thái (oper_status, uptime, mức tải, routes learned/used, CPU, bộ nhớ, nhiệt độ) kèm mốc collected_at; chưa có timeseries nào được highlight, phần đồ thị bên dưới không hiện line nào; canvas giữ nguyên]

[Illustration 5.3B: ảnh tĩnh — bấm một trạng thái dạng timeseries (ví dụ nhiệt độ); trạng thái đó được highlight, phần đồ thị bên dưới hiện line cho trạng thái đó; canvas giữ nguyên]

---

## 5.4 Edge inspector

Edge inspector là nơi xem chi tiết của liên kết mà kỹ sư đang chọn:

- Bấm một edge trên canvas → chọn edge, Inspector hiện edge inspector.
- Chọn edge thay ngữ cảnh node: thanh tab nhường chỗ cho hàng hai đầu kèm cổng — như tooltip (mục 3.4), ví dụ `CORE-01:0/0/0 → AGG-01:0/0/0`; nút quay lại bỏ chọn, về danh sách thiết bị.
- Phần thuộc tính gồm: băng thông lắp đặt, mức sử dụng hiện tại, tỉ lệ lỗi và trạng thái vận hành.

[Illustration 5.4: ảnh tĩnh — bấm edge CORE-02 ↔ AGG-02 trên canvas; Inspector hiện edge inspector với hai đầu kèm cổng, băng thông lắp đặt, mức sử dụng hiện tại, tỉ lệ lỗi, trạng thái vận hành; canvas giữ nguyên]
