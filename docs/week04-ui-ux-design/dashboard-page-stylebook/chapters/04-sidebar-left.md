# Chương 4: Khung dashboard — Phần 4: Sidebar trái

> Chương này đã viết đủ nội dung 4.1–4.4. Chi tiết giả thuyết (4.3) dời về đây từ Inspector ngày 10-11.
> Văn phong theo các chương trước. Mọi số liệu "chốt khi dựng". Trường chưa có data ghi "chờ data".

---

## Mục lục chương

- 4.1 Tìm kiếm
- 4.2 Timeline cảnh báo
- 4.3 Giả thuyết AI Top 3
- 4.4 Cài đặt hiển thị

---

## 4.1 Tìm kiếm

Tab Tìm kiếm giúp kỹ sư xác định node trên topology dựa trên từ khóa:

- Tìm theo ID thiết bị, IP quản lý hoặc tên site. Tiền tố khớp cả nhóm: gõ `CORE` là gợi ý mọi node core, gõ tên site là gợi ý toàn bộ node có tên site khớp với từ khóa.
- Mỗi dòng kết quả kèm chấm màu trạng thái và tên site.
- Chọn một thiết bị → canvas pan đưa node về giữa và focus.

[Illustration 4.1A: ảnh tĩnh — đang gõ "CORE", dropdown gợi ý theo nhóm; canvas giữ nguyên, chưa chọn gì]

[Illustration 4.1B: ảnh tĩnh — đã chọn CORE-02; canvas pan về node, beacon bao quanh, ngoài vùng K mờ đi]

---

## 4.2 Timeline cảnh báo

Tab Timeline cảnh báo thể hiện các cảnh báo theo dòng thời gian:

- Cảnh báo hiện dạng cấu trúc trên trục thời gian: thời điểm, mã lỗi, thiết bị, nội dung; mức warning/error mã hoá bằng màu chấm. Mới nhất ở trên.
- Bấm một cảnh báo → canvas pan + focus thiết bị (mục 3.5).
- Bấm mã lỗi → panel tài liệu trượt ra sát mép trái canvas, đè lên một phần topology. Bấm nút × hoặc Esc để đóng; canvas trở về đúng trạng thái trước đó.
- Tài liệu là lớp đọc tạm thời trên layer riêng — canvas không bao giờ bị thay thế. Wiki đầy đủ mở ở tab mới (hệ thống ngoài), không nhúng vào dashboard.

[Illustration 4.2A: ảnh tĩnh — timeline cảnh báo trong sidebar trái; canvas giữ nguyên]

[Illustration 4.2B: ảnh tĩnh — bấm cảnh báo của CORE-02; canvas pan + focus thiết bị đó]

[Illustration 4.2C: ảnh tĩnh — bấm mã lỗi; panel tài liệu mở trên phần trái canvas, topology vẫn thấy bên phải]

---

## 4.3 Giả thuyết AI

Tab Giả thuyết AI thể hiện các giả thuyết được ai đưa ra:

- Mỗi giả thuyết là một micro-card: thứ hạng, tóm tắt nguyên nhân, điểm khớp và một dòng căn cứ — xếp từ khớp cao xuống thấp. Giả thuyết có thể trỏ vào một liên kết hoặc một thiết bị.
- Bấm một card → canvas khoanh vùng khu vực nghi vấn, beacon các thiết bị liên quan (trỏ vào liên kết thì beacon cả hai đầu — dùng cơ chế multi-beacon 3.5) và pan đưa vùng đó về giữa; đồng thời chi tiết đầy đủ của giả thuyết mở ngay tại chỗ trong sidebar trái. Chọn giả thuyết khác → vùng khoanh, beacon và chi tiết đổi theo.
- Chi tiết giả thuyết là nơi đọc trọn vẹn nội dung để đi đến kết luận — card chỉ là bản tóm tắt để chọn; nội dung dài (nguyên nhân, hướng dẫn kiểm tra, cách xử lý) không nhét vào card. Chi tiết mở dạng accordion: một lần chỉ mở một card, các card còn lại vẫn nằm trong danh sách để đổi ý nhanh.
- Inspector bên phải giữ nguyên ngữ cảnh đang có — kỹ sư vừa đọc giả thuyết, vừa bấm node hay edge trên canvas để xem thông số ở Inspector.
- Nội dung đầy đủ xếp theo luồng đọc: cơ sở xếp hạng, nguyên nhân chi tiết, bằng chứng ủng hộ, bằng chứng không phù hợp, hướng dẫn kiểm tra và cách xử lý gợi ý.
- **Nút Xác nhận / Bác bỏ nằm ở cuối chi tiết** — sau luồng đọc nguyên nhân → kiểm tra → xử lý; bác bỏ phải ghi lý do ngay tại đây.
- Bấm Xác nhận → giả thuyết trở thành **nguyên nhân chính thức** của sự cố: sự cố ở header (mục 0.1) chuyển trạng thái, chi tiết thu lại về danh sách card.
- Giả thuyết bị bác bỏ không biến mất: rơi xuống phần ĐÃ BÁC BỎ dưới danh sách, gạch ngang kèm lý do đã nhập, ghi lại hướng đã thử.
- Giả thuyết chỉ là gợi ý của hệ thống — kết luận thuộc về kỹ sư.

[Illustration 4.3A: ảnh tĩnh — danh sách xếp theo độ tin cậy, một giả thuyết đã bác bỏ nằm dưới; canvas giữ nguyên]

[Illustration 4.3B: ảnh tĩnh — chọn giả thuyết một; canvas khoanh vùng liên kết nghi vấn, beacon hai đầu, ngoài vùng mờ]

[Illustration 4.3C: ảnh tĩnh — chi tiết đầy đủ của giả thuyết một mở tại chỗ trong sidebar trái, xếp theo luồng đọc kèm nút Xác nhận / Bác bỏ ở cuối; canvas khoanh vùng + beacon hai đầu; Inspector bên phải giữ nguyên ngữ cảnh — đang xem tab Trạng thái của AGG-02]

[Illustration 4.3D: ảnh tĩnh — bấm Bác bỏ; khung nhập lý do đè đáy chi tiết trong sidebar trái, gửi đi thì giả thuyết rơi xuống phần ĐÃ BÁC BỎ; canvas và Inspector giữ nguyên]

---

## 4.4 Cài đặt hiển thị

Tab Cài đặt hiển thị thể hiện những tùy chỉnh của kỹ sư tác động trực tiếp lên canvas:

- Dial phạm vi tường minh: **1 / 2 / 3** (mặc định K = 2 — mục 3.5).
- Chế độ loại bỏ: **Mờ / Ẩn** — một setting chung cho node ngoài-vùng-K và node bị-lọc; edge nối tới node loại bỏ cũng theo node.
- Bộ lọc site: bốn chip bật/tắt theo màu site. Node không khớp bị loại bỏ dù đang giữ beacon — **filter thắng focus**; tooltip bỏ qua node loại bỏ; áp mọi mức zoom.
- Toàn khối lưu **localStorage** để giữ lại giữa các phiên; beacon và vị trí kéo node là trạng thái của phiên — không lưu.

[Illustration 4.4: demo tương tác — dial K, chế độ Mờ/Ẩn và bộ lọc site tác động lên canvas theo thời gian thực; bấm đúp node để thêm hoặc gỡ beacon]
