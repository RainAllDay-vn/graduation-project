# Chương 4: Khung dashboard — Phần 4: Sidebar

> **Skeleton — chưa viết nội dung đầy đủ.** Quyết định đã chốt nằm trong `docs/week04-ui-ux-design/design-decisions.md` (§5–§9, gồm tóm tắt research yêu cầu).
> Văn phong theo các chương trước. Mọi số liệu "chốt khi dựng". Trường chưa có data ghi "chờ data".

---

## Mục lục chương

- 4.1 Sidebar trái — điều hướng & cài đặt
- 4.2 Sidebar phải — Inspector
- 4.3 Header mỏng

---

## 4.1 Sidebar trái — điều hướng & cài đặt

Bốn khối, theo thứ tự sức mạnh bằng chứng (design-decisions §8):

**Tìm kiếm** (SHOULD — REQ-11):
- Tìm theo ID, IP loopback, tên site; tiền tố khớp cả nhóm (`CORE` → mọi node core).
- Chọn kết quả → canvas pan về node + focus (mục 3.5).

**Timeline báo động** (MUST — bằng chứng mạnh nhất):
- Alarm dạng cấu trúc: mã, thời điểm, thiết bị, mức (warning/error), nội dung — xếp trên trục thời gian, ưu tiên theo mức.
- Bấm alarm → canvas pan + focus thiết bị; bấm mã lỗi → mở tài liệu (NSX hoặc wiki nội bộ).
- Cần data: alarm object + incident (gói a — design-decisions §9).

**Giả thuyết AI Top 3** (MUST):
- Micro-cards; bấm → khoanh vùng + beacon trên canvas (dùng cơ chế multi-beacon 3.5).
- Nút Xác nhận/Bác bỏ nằm ở Inspector (4.2).

**Cài đặt hiển thị** (chốt điểm 1 + 3):
- Dial K: **1 / 2 / 3 / Toàn mạng** (mặc định K = 2 — mục 3.5).
- Chế độ loại bỏ: **Mờ / Ẩn** — một setting chung cho node ngoài-vùng-K và node bị-lọc.
- Bộ lọc site: chip bật/tắt — node không khớp → hidden; **filter thắng focus**; edge theo node; tooltip bỏ qua node loại; áp mọi mức LOD.
- Toàn khối lưu **localStorage** — không lưu DB (beacon + vị trí kéo không lưu).

[Illustration: demo tương tác — chốt hình thái khi dựng]

---

## 4.2 Sidebar phải — Inspector

- Định danh: ID, tier, site, IP quản lý, model + product line.
- **Alarm có cấu trúc của thiết bị** + alarm liên quan trên thiết bị khác cùng khung thời gian — xếp cạnh nhau theo mốc thời gian (pain point week02 §II.1).
- Trạng thái hiện tại: **uptime, tải, routes learned/used, oper_status + mốc collected_at** (week03 §III.3.a mục 4).
- Live telemetry: CPU · bộ nhớ · nhiệt độ (progress bar như prototype).
- **Direct neighbors kèm cổng hai đầu** (pain point "bảng cổng không thấy đầu xa") + medium, utilization, errorRatio.
- Quick CLI + copy (giữ nguyên từ prototype).
- Khi chọn edge: băng thông lắp đặt, mức sử dụng hiện tại, tỉ lệ lỗi, trạng thái vận hành; **L2** (Rx/Tx dBm, nhiệt SFP, CRC/phút) và **L3** (subnet, BGP state, OSPF cost) — **chờ data** (gói b).
- Nút **Xác nhận / Bác bỏ giả thuyết** khi inspector đang hiển thị một giả thuyết (week03 §III.3.b — bác bỏ phải ghi lý do).

[Illustration: demo tương tác — chốt hình thái khi dựng]

---

## 4.3 Header mỏng

- Brand + trạng thái sự cố đang mở: mã, trạng thái, thời điểm mở (week03 §III.3.a mục 1).
- Đã bỏ: stats đếm (router/leaf/link), badge "N CRITICAL ALARMS" (trùng alarm list), presets node nhanh, nút Fit/Reset.
- Cần data: incident (gói a).

[Illustration: chốt khi dựng]
