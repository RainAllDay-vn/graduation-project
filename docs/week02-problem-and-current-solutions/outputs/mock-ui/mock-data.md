# Bộ dữ liệu giả cho mock-UI (không phải dữ liệu vận hành thực)

Tất cả tên thiết bị, mã, thời điểm và số liệu dưới đây do nhóm tự tạo để minh họa
bước 1–2 trong báo cáo. Không sử dụng ảnh hay dữ liệu từ hệ thống thực tế.

## 1. Tình huống

Router biên có packet-error tăng đột biến trên một cổng WAN. Kỹ sư nhận cảnh báo
và cần tìm: cổng nào lỗi, đầu xa của liên kết là thiết bị nào, các thành phần
liên quan có dấu hiệu bất thường cùng thời điểm hay không.

## 2. Thiết bị và quan hệ giả định

| Mã | Loại | Vị trí trên cây phân cấp giả định | Vai trò trong ví dụ |
| --- | --- | --- | --- |
| R-HN-01 | Router biên | Khu vực Hà Nội / Nhóm Router / R-HN-01 | Thiết bị phát cảnh báo; cổng WAN-01 lỗi |
| SW-HN-02 | Switch lõi | Khu vực Hà Nội / Nhóm Switch / SW-HN-02 | Đầu xa của liên kết; cổng UPLINK-03 nối với WAN-01 của R-HN-01 |
| R-HN-07 | Router biên | Khu vực Hà Nội / Nhóm Router / R-HN-07 | Có cảnh báo packet-error cùng khung giờ, gợi ý cần kiểm tra diện rộng |

Quan hệ giả định duy nhất dùng trong ví dụ:
`R-HN-01:WAN-01 <---> SW-HN-02:UPLINK-03`.

## 3. Mốc thời gian giả định (ngày 15/09/2026)

- `14:32:00`: cảnh báo chính `ALM-2041` trên R-HN-01.
- `14:32:00–14:37:00`: cửa sổ packet-error tăng trên WAN-01.
- `14:00–15:00`: cửa sổ biểu đồ chỉ số ở trang giám sát.
- Các thao tác tra cứu của kỹ sư diễn ra sau `14:32`.

## 4. Danh sách cảnh báo giả định (trang 1)

| Mã cảnh báo | Thiết bị | Nội dung | Thời điểm | Mức |
| --- | --- | --- | --- | --- |
| ALM-2041 | R-HN-01 | Packet-error cao trên WAN-01 | 14:32:00 | Major |
| ALM-2038 | R-HN-07 | Packet-error cao trên WAN-02 | 14:33:10 | Major |
| ALM-2035 | SW-HN-02 | Nhiệt độ cao | 13:58:44 | Minor |
| ALM-2031 | R-HN-01 | CPU cao | 11:20:05 | Minor |
| ALM-2029 | SW-HN-09 | Mất kết nối quản trị | 09:41:33 | Critical |

Trang cảnh báo chỉ hiển thị các cột trên; không hiển thị đầu xa liên kết,
trạng thái cổng hay thiết bị liên quan.

## 5. Thông tin thiết bị giả định (trang 2)

- `R-HN-01`: Router biên, địa chỉ quản lý `10.10.1.1`, firmware `VRP-8.2-giả-định`,
  trạng thái `Đang hoạt động`, cổng quan tâm `WAN-01`.
- Cây phân cấp giả định:
  - `Khu vực Hà Nội / Nhóm Router / R-HN-01`
  - `Khu vực Hà Nội / Nhóm Router / R-HN-07`
  - `Khu vực Hà Nội / Nhóm Switch / SW-HN-02`
- R-HN-01 và SW-HN-02 nằm ở hai nhánh khác nhau dù có liên kết trực tiếp.

## 6. Chỉ số giả định (trang 3)

- Cổng `R-HN-01:WAN-01`, chỉ số `packet-error / 5 phút`:
  - Trước `14:30`: dưới `10`.
  - `14:32–14:37`: đỉnh `1.250`.
  - Sau `14:40`: trở về dưới `15`.
- Cổng đối tác `SW-HN-02:UPLINK-03` có đỉnh cùng cửa sổ trong kịch bản, nhưng kỹ sư
  phải chọn thủ công thiết bị + cổng + khoảng thời gian mới thấy được.
- Trang giám sát yêu cầu nhập mã thiết bị, chọn cổng và khoảng thời gian;
  không tự gắn biểu đồ với cảnh báo `ALM-2041`.
