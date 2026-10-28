# Chương 0: Khung dashboard

## 0.1 Sơ đồ khung

Dashboard gồm bốn vùng. Trong đó thì canvas hiển thị topology chiếm chủ đạo diện tích hiển thị:

- **Header mỏng** — brand + trạng thái sự cố đang mở.
- **Sidebar trái** — điều hướng + cài đặt (chi tiết chương 4).
- **Canvas** — topology canvas (chi tiết chương 1–3).
- **Sidebar phải** — Inspector (chi tiết chương 5).

Mỗi vùng kèm ghi chú "thuộc chương nào" — bản mục lục không gian của tài liệu.

Header mỏng chỉ gồm brand + trạng thái sự cố đang mở (mã, trạng thái, thời điểm mở — week03 §III.3.a mục 1). Đã bỏ khỏi header: stats đếm (router/leaf/link), badge "N CRITICAL ALARMS" (trùng danh sách báo động), presets node nhanh, nút Fit/Reset zoom. Cần data: incident (gói a).

Còn sống trên canvas: legend màu site góc dưới-trái — một hàng bốn swatch SITE-1…SITE-4, không có tier (tier đọc qua nhãn dải nền) — và cụm nút Fit / + / − nổi. Legend cũng là chỗ gắn chip quick-focus site (mục 4.4). Breadcrumb đã bỏ: canvas không có drill-down, beacon đã giữ vết các node đã tới, Inspector đã mô tả node đang chọn.

[Illustration: wireframe tĩnh đánh dấu bốn vùng, tỉ lệ tương đối, nhãn vùng → chương]
