# Chương 2: Topology — Phần 2: Edges

---

## Mục lục chương

- 2.1 Sơ đồ của một edge
- 2.2 Màu = trạng thái sức khỏe
- 2.3 Độ dày = băng thông
- 2.4 Nét liền/nét đứt = hiệu suất sử dụng băng thông

---

## 2.1 Sơ đồ của một edge

Một edge nối đúng hai node, qua đúng hai cổng vật lý:

- Hai đầu neo vào cổng của từng node — ví dụ `CORE-01:0/0/0 → AGG-01:0/0/0`: node nguồn, cổng nguồn → node đích, cổng đích.
- Mỗi edge truy nguồn được về một dây cáp/optical thật.

[Illustration thể hiện một edge nối CORE-01 vào AGG-01, hai đầu được phóng to cho thấy edge neo vào đúng cổng của từng node]

---

## 2.2 Màu = trạng thái sức khỏe

Màu edge là kênh mã hoá **trạng thái sức khỏe** của liên kết — độc lập với trạng thái hai đầu node, gồm hai mức:

- Healthy: xanh lá `#10b981` — cùng xanh emerald với lá Access (mục 1.5).
- Critical: đỏ sáng `#ef4444` — khác nền đỏ đậm của node vì nét mảnh cần nổi rõ trên canvas tối.

[Illustration thể hiện các edge giữa những node healthy: edge healthy xanh lá, edge critical đỏ sáng — trạng thái edge đọc được ngay dù hai đầu node đều healthy]

---

## 2.3 Độ dày = băng thông

Độ dày edge là kênh mã hoá **băng thông lắp đặt**, gồm ba bậc cố định:

- Bậc mảnh: băng thông dưới 10G.
- Bậc trung: từ 10G đến dưới 100G.
- Bậc dày: từ 100G trở lên.

[Illustration thể hiện ba edge song song cùng màu, ba mức độ dày tăng dần: bậc mảnh, bậc trung, bậc dày]

---

## 2.4 Nét liền/nét đứt = hiệu suất sử dụng băng thông

Nét edge là kênh mã hoá **hiệu suất sử dụng** băng thông:

- Ở mức **không sử dụng**, edge vẽ **nét đứt**; mức sử dụng càng cao nét càng liền, và **liền trọn vẹn** ở mức sử dụng đầy đủ (100%).

[Illustration thể hiện ba edge cùng loại: nét đứt khi ít sử dụng, nét đứt khít dần ở mức sử dụng trung bình, nét liền ở mức sử dụng đầy]
