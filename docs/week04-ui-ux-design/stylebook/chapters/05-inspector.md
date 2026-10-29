# Chương 5: Khung dashboard — Phần 5: Sidebar phải — Inspector

> **Skeleton — chưa viết nội dung đầy đủ.** Quyết định đã chốt nằm trong `docs/week04-ui-ux-design/design-decisions.md` (§5–§9, gồm tóm tắt research yêu cầu).
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

- ID, tier, site, IP quản lý, model + product line.
- Quick CLI + copy (giữ nguyên từ prototype).

[Illustration: chốt khi dựng]

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
