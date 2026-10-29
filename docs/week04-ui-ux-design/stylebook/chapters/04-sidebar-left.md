# Chương 4: Khung dashboard — Phần 4: Sidebar trái

> **4.1 + 4.2 đã viết nội dung; 4.3 + 4.4 là skeleton.** Quyết định đã chốt nằm trong `docs/week04-ui-ux-design/design-decisions.md` (§5–§9, gồm tóm tắt research yêu cầu).
> Văn phong theo các chương trước. Mọi số liệu "chốt khi dựng". Trường chưa có data ghi "chờ data".

---

## Mục lục chương

- 4.1 Tìm kiếm
- 4.2 Timeline báo động
- 4.3 Giả thuyết AI Top 3
- 4.4 Cài đặt hiển thị

---

## 4.1 Tìm kiếm

Tìm kiếm là lối vào nhanh nhất khi đã biết mình cần nhìn cái gì:

- Tìm theo ID thiết bị, IP quản lý hoặc tên site. Tiền tố khớp cả nhóm: gõ `CORE` là gợi ý mọi node core, gõ tên site là gợi ý toàn bộ node có tên site khớp với từ khóa.
- Mỗi dòng kết quả kèm chấm màu trạng thái và tên site.
- Chọn một thiết bị → canvas pan đưa node về giữa và focus.

[Illustration 4.1A: ảnh tĩnh — đang gõ "CORE", dropdown gợi ý theo nhóm; canvas giữ nguyên, chưa chọn gì]

[Illustration 4.1B: ảnh tĩnh — đã chọn CORE-02; canvas pan về node, beacon bao quanh, ngoài vùng K mờ đi]

---

## 4.2 Timeline báo động

Mọi phiên điều tra bắt đầu từ một báo động — timeline là điểm khởi đầu đó:

- Alarm hiện dạng cấu trúc trên trục thời gian: thời điểm, mã lỗi, thiết bị, nội dung; mức warning/error mã hoá bằng màu chấm. Mới nhất ở trên.
- Bấm một alarm → canvas pan + focus thiết bị (mục 3.5).
- Bấm mã lỗi → panel tài liệu trượt ra sát mép trái canvas, đè lên một phần topology. Bấm nút × hoặc Esc để đóng; canvas trở về đúng trạng thái trước đó.
- Tài liệu là lớp đọc tạm thời trên layer riêng — canvas không bao giờ bị thay thế. Wiki đầy đủ mở ở tab mới (hệ thống ngoài), không nhúng vào dashboard.

[Illustration 4.2A: ảnh tĩnh — timeline báo động trong sidebar trái; canvas giữ nguyên]

[Illustration 4.2B: ảnh tĩnh — bấm alarm của CORE-02; canvas pan + focus thiết bị đó]

[Illustration 4.2C: ảnh tĩnh — bấm mã lỗi; panel tài liệu mở trên phần trái canvas, topology vẫn thấy bên phải]

---

## 4.3 Giả thuyết AI Top 3

(MUST)

- Micro-cards; bấm → khoanh vùng + beacon trên canvas (dùng cơ chế multi-beacon 3.5).
- Nút Xác nhận/Bác bỏ nằm ở Inspector (mục 5.6).

[Illustration: micro-cards → khoanh vùng + beacon — chốt hình thái khi dựng]

---

## 4.4 Cài đặt hiển thị

(chốt điểm 1 + 3 — design-decisions §7)

- Dial K: **1 / 2 / 3 / Toàn mạng** (mặc định K = 2 — mục 3.5).
- Chế độ loại bỏ: **Mờ / Ẩn** — một setting chung cho node ngoài-vùng-K và node bị-lọc.
- Bộ lọc site: chip bật/tắt — node không khớp → hidden; **filter thắng focus**; edge theo node; tooltip bỏ qua node loại; áp mọi mức LOD.
- Toàn khối lưu **localStorage** — không lưu DB (beacon + vị trí kéo không lưu).

[Illustration: demo tương tác — canvas phản ứng với dial K + Mờ/Ẩn + lọc site]
