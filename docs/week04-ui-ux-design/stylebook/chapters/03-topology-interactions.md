# Chương 3: Topology — Phần 3: Interactions

---

## Mục lục chương

- 3.1 Di chuyển góc nhìn
- 3.2 Zoom & mức chi tiết
- 3.3 Di chuyển node
- 3.4 Hover — tooltip
- 3.5 Node focus

---

## 3.1 Di chuyển góc nhìn

Kéo ở nền canvas để dịch góc nhìn.

[Illustration là demo tương tác: một khung nhìn chứa topology lớn hơn — kéo chuột bên trong khung để dịch góc nhìn, topology và quan hệ node–edge giữ nguyên]

---

## 3.2 Zoom & mức chi tiết

Canvas có hai mức chi tiết (LOD): mức **gần** — mặc định — và mức **xa** khi zoom-out qua ngưỡng:

- Mức gần hiện mọi chi tiết của node và edge.
- Mức xa chỉ giữ khung sườn: dải tầng và tiêu đề tầng, node rút thành khối màu trạng thái không chữ — nền healthy sáng lên một bậc để tách khỏi canvas, edge về một nét mảnh thống nhất.
- Tooltip vẫn hoạt động ở cả hai mức.
- Hai mức chuyển nhau qua một lần fade khi node co quá nhỏ để đọc chữ; ngưỡng đo theo kích thước node trên màn hình, không theo phần trăm zoom — giá trị chốt khi dựng.
- Zoom bằng lăn chuột quanh con trỏ, kèm nút +/− và "vừa khung".

[Illustration là demo tương tác: khung topology của mục 3.1 zoom được bằng lăn chuột quanh con trỏ — zoom ra qua ngưỡng, bản đồ fade về mức xa: node còn khối màu không chữ, edge còn một nét mảnh]

---

## 3.3 Di chuyển node

Kéo một node để đổi vị trí của nó:

- Edge hai đầu bám theo node khi kéo — liên kết không đứt rời.
- Node kéo tự do, không khóa vào tầng của nó.
- Vị trí sau khi kéo là trạng thái của phiên làm việc — tải lại trang quay về layout chuẩn.

[Illustration là demo tương tác: kéo một node — node đi theo con trỏ, edge hai đầu bám theo, node có thể vắt qua dải tầng khác]

---

## 3.4 Hover — tooltip

Hover là kênh thông tin thể hiện đầy đủ các thông tin của một node hoặc edge:

- Tooltip hiện theo con trỏ, mất khi rời — hover không làm canvas thay đổi.
- Tooltip node gồm: ID, trạng thái sức khỏe, site, IP quản lý, model, CPU · bộ nhớ · nhiệt độ, số báo động đang mở.
- Tooltip edge gồm: hai đầu kèm cổng, băng thông lắp đặt, mức sử dụng hiện tại, tỉ lệ lỗi.

[Illustration là demo tương tác: di chuột lên node hoặc edge — tooltip đi theo con trỏ với đầy đủ trường thông tin, mất khi rời]

---

## 3.5 Node focus

Focus là thuộc tính tạm thời của phiên làm việc, không phải thuộc tính của thiết bị:

- Bấm đúp một node → một vòng **beacon** bao ngoài node. Bấm đúp lại vào node đó → vòng **beacon** sẽ biến mất.
- Bấm đơn một node là chọn — chuyển ngữ cảnh Inspector (chương 5) — không đụng beacon.
- Toàn canvas có thể có nhiều beacon.
- Beacon vẽ trên **layer riêng** — thân node không thêm nét, không đổi màu.
- Các node trong bán kính K (mặc định K = 2) từ bất kỳ beacon nào sẽ giữ nguyên hiển thị, trong khi những node nằm ngoài sẽ bị làm mờ. Các edge nối với node bị làm mờ cũng sẽ mờ theo.

[Illustration là demo tương tác: bấm đúp node → beacon trắng bao ngoài, vùng K = 2 quanh beacon giữ nguyên hiển thị, phần còn lại mờ đi; bấm đúp lại node để gỡ beacon — có thể focus nhiều node cùng lúc]
