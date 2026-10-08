# Bộ dữ liệu giả cho mock-UI (không phải dữ liệu vận hành thực)

Tất cả tên thiết bị, mã, thời điểm và số liệu dưới đây do nhóm tự tạo để minh họa
các bước trong báo cáo. Không sử dụng ảnh hay dữ liệu từ hệ thống thực tế.

## 1. Tình huống

Router biên tỉnh có packet-error tăng đột biến trên một cổng WAN. Kỹ sư nhận cảnh báo
và cần tìm: cổng nào lỗi, đầu xa của liên kết là thiết bị nào, các thành phần
liên quan có dấu hiệu bất thường cùng thời điểm hay không. Các cảnh báo phát sinh
trong tình huống này được xếp vào cùng một sự cố.

## 2. Thiết bị và quan hệ giả định

| Mã | Loại | Vị trí lắp đặt | Vai trò trong ví dụ |
| --- | --- | --- | --- |
| R-HN-01 | Router biên tỉnh | Khu vực Hà Nội | Cảnh báo packet-error; cổng WAN-01 lỗi |
| SW-HN-02 | Switch khu vực | Khu vực Hà Nội | Cảnh báo sớm nhất của sự cố; đầu xa của liên kết, cổng UPLINK-03 nối với WAN-01 của R-HN-01 |
| R-HN-07 | Router biên tỉnh | Khu vực Hà Nội | Cảnh báo packet-error cùng khung giờ, gợi ý cần kiểm tra diện rộng |

Quan hệ giả định dùng trong ví dụ:
`R-HN-01:WAN-01 <---> SW-HN-02:UPLINK-03`.

## 3. Mốc thời gian giả định (ngày 15/09/2026)

- `13:58:44`: thời điểm mở sự cố, cũng là thời điểm cảnh báo `ALM-2035` trên SW-HN-02.
- `14:32:00–14:37:00`: cửa sổ packet-error tăng trên WAN-01.
- `14:00–15:00`: cửa sổ biểu đồ chỉ số ở trang giám sát.
- Các thao tác tra cứu của kỹ sư diễn ra sau `14:32`.

## 4. Cảnh báo giả định trong sự cố

| Mã cảnh báo | Thiết bị | Nội dung thông báo | Thời điểm | Mức |
| --- | --- | --- | --- | --- |
| ALM-2035 | SW-HN-02 | Nhiệt độ vượt ngưỡng | 13:58:44 | warning |
| ALM-2041 | R-HN-01 | packet-error tại cổng WAN-01 đạt 1.250 | 14:32:00 | error |
| ALM-2038 | R-HN-07 | packet-error tại cổng WAN-02 tăng cùng cửa sổ | 14:33:10 | error |

Cảnh báo chỉ gắn với thiết bị, không gắn với cổng hay liên kết; cổng và chỉ số được
nêu trong nội dung thông báo. Sự cố không có mã và không có phân cấp mức độ riêng.

## 5. Thông tin thiết bị giả định

- `R-HN-01`: router biên tỉnh, định danh quản lý `R-HN-01`, vị trí lắp đặt *Khu vực
  Hà Nội*, hãng `Cisco`, dòng `ASR 9000`, model `ASR-9006`; trạng thái đang hoạt
  động trong 11 ngày 4 giờ, mức tải 62%, đã học 48 mạng con và đang dùng 41 mạng con.
- `SW-HN-02`: switch khu vực, định danh quản lý `SW-HN-02`, vị trí lắp đặt *Khu vực
  Hà Nội*, hãng `Cisco`, dòng `Catalyst 9300`, model `C9300-48UXM`; trạng thái đang
  hoạt động trong 27 ngày 2 giờ, mức tải 41%, đã học 22 mạng con và đang dùng 19 mạng con.
- Trang cảnh báo chỉ hiển thị mã cảnh báo, thiết bị, nội dung, thời điểm và mức độ;
  không hiển thị đầu xa liên kết, trạng thái cổng hay thiết bị liên quan.

## 6. Chỉ số giả định

- Cổng `R-HN-01:WAN-01`, chỉ số `packet-error / 5 phút`:
  - Trước `14:30`: dưới `10`.
  - `14:32–14:37`: đỉnh `1.250`.
  - Sau `14:40`: trở về dưới `15`.
- Cổng đối tác `SW-HN-02:UPLINK-03` có đỉnh cùng cửa sổ trong kịch bản, nhưng kỹ sư
  phải chọn thủ công thiết bị + cổng + khoảng thời gian mới thấy được.
- Trang giám sát yêu cầu nhập mã thiết bị, chọn cổng và khoảng thời gian;
  không tự gắn biểu đồ với cảnh báo `ALM-2041`.