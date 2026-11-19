# Chương 1: Topology — Phần 1: Node

---

## Mục lục chương

- 1.1 Sơ đồ của một node
- 1.2 Viền = Site
- 1.3 Nền = trạng thái sức khoẻ
- 1.4 Layer = tầng trong Topology
- 1.5 Nhãn & badge

---

## 1.1 Sơ đồ của một node

Một node gồm bốn bộ phận:

- Nền (thân hình chữ nhật)
- Viền
- Nhãn
- Badge.

[Illustration thể hiện từng cấu tạo của node]

---

## 1.2 Viền = Site

Viền node là kênh mã hoá **site**, gồm các ràng buộc:

- Viền được tô theo **màu site** của thiết bị → các thiết bị cùng site sẽ có màu viền giống nhau.
- Palette site: SITE-1 `#38bdf8` (sky) · SITE-2 `#a78bfa` (violet) · SITE-3 `#f472b6` (pink) · SITE-4 `#facc15` (yellow)
- Nếu có nhiều hơn bốn site: màu cho site mới được sinh thêm theo quy tắc cố định — chọn hue cách xa nhất so với các màu site hiện có, tránh dải đỏ/hổ phách dành cho trạng thái.

[Illustration thể hiện hai dải node thuộc ba site. Ở dải dưới thì giữa các site là một nét đứt mờ cùng legend thể hiện site trong khi dải trên không có. Caption của hình giải thích rằng bằng màu của viền thì dễ dàng nhóm node của các site.]

---

## 1.3 Nền = trạng thái sức khoẻ

Nền node là kênh mã hoá sức khoẻ, gồm ba mức chuẩn giám sát NOC:

- healthy: nền tối `#0f172a` (dark mode) / trắng `#ffffff` (light mode) — đây là trạng thái mặc định của node, hoà vào canvas, viền thể hiện màu Site.
- warning: nền hổ phách tươi `#f59e0b` (Amber 500) đi kèm chữ ID đen đậm `#0f172a` (tỉ lệ tương phản 9.4:1) — node vẫn hoạt động nhưng gặp suy hao/sự cố cần xử lý.
- critical: nền đỏ tươi `#ef4444` (Red 500) đi kèm chữ ID trắng tinh `#ffffff` (tương phản 5.1:1 trên nền tối) — node bị mất kết nối hoặc hỏng hóc nghiêm trọng.

[Illustration thể hiện ba node cùng site, chỉ khác status: healthy hoà vào nền, warning nền vàng hổ phách tươi chữ đen, critical nền đỏ tươi chữ trắng]

---

## 1.4 Layer = tầng trong Topology

Layer là tầng của node trong cấu trúc mạng — và được thể hiện bằng vị trí của nó:

- Topology chia thành các **tầng ngang cố định**, xếp dọc đúng thứ tự luồng dữ liệu: Peering & Transit → National Border Gateway → Core Backbone → Edge Aggregation → Metro Exchange → Access (tầng lá, chỉ mở qua badge — mục 1.5). Node cùng layer đứng thẳng hàng ngang trong tầng của nó.
- Mỗi tầng có **tiêu đề riêng** đặt tại mép trái dải tầng (`PEERING & TRANSIT`, `CORE BACKBONE`…). Dải nền mờ viền nét đứt sau tầng cũng để nhóm các node thành layer.
- Tiền tố ID cũng khai báo vai trò (`CORE-02`, `EXCH-07`) — do đó layer vẫn có thể đọc được nếu người dùng di chuyển các node.

[Illustration thể hiện ba tầng node xếp dọc với tiêu đề tầng; một node được khoanh cho thấy tiền tố ID khớp với layer của tầng đang đứng]

---

## 1.5 Nhãn & badge

Node mang hai trường chữ gồm:

- **Nhãn ID** — Router ID, mono, trắng, đậm, giữa thân node.
- **Badge leaf** — `▼ +N` / `▲ −N`, dưới thân node, chỉ trên node exchange. N là số access switch của trạm — ví dụ EXCH-07 có N = 14: đang gập hiện `▼ +N`, bấm để bung ra N lá Access (mục 1.4); đang bung hiện `▲ −N`, bấm để gập lại.

[Illustration gồm hai phần. Phần bên trái thể hiện node EXCH-07 với đủ hai trường chữ: ID giữa thân, badge ▼ +14 dưới thân. Phần bên phải giống bên trái nhưng badge đã được bấm, lật thành ▲ −14, và 14 lá access nở ra trong một khung mờ thành hai hàng chấm nhỏ nối vào node bằng nét đứt]
