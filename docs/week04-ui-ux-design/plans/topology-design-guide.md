## 1. HIỆN TRẠNG 

Trang `01-overview.html` đã được xây dựng theo triết lý Single-Page Dashboard với giao diện NOC tối giản hiện đại (Dark Slate theme `#0B0F17`). Tuy nhiên, phần lõi Topology hiện tại vẫn tồn tại các hạn chế kỹ thuật:

| Thành phần | Hiện trạng trong mã nguồn | Hạn chế thực tế |
| :--- | :--- | :--- |
| **Cấu trúc Dựng hình** | Các thẻ SVG `<circle>`, `<line>`, `<text>` được viết cứng (hardcoded) trực tiếp trong HTML với 6 node tĩnh (`R-HN-01`, `SW-HN-02`, `R-HN-07`, `Dist-03`, `Srv-A`, `Srv-B`). | Không có khả năng nạp dữ liệu động từ API hoặc tệp dữ liệu lớn. Nếu nạp 78 router sẽ gây vỡ layout và chồng chéo hoàn toàn. |
| **Bảo toàn Phân cấp** | Tọa độ x, y được chấm điểm thủ công, không có khái niệm tầng (Tier Band). | Kỹ sư không phân biệt được đâu là tầng Core, đâu là tầng Aggregation hay Exchange. |
| **Điều hướng & Lọc phạm vi** | Bộ nút Scope (`sub`, `1hop`, `ring`) chỉ đổi độ mờ của đúng 1 thiết bị (`Dist-03`) trong hàm `setScope()`. Kéo thả node bị gắn cứng theo tên (`if (nodeId === 'SW-HN-02')`). | Không có thuật toán duyệt đồ thị (Graph Traversal). Khi chọn 1 node, hệ thống không thể tự động lọc láng giềng hoặc ẩn node xa. |
| **Phạm vi hiển thị tầng** | Hiển thị lẫn lộn cả Router, Switch và Server máy chủ (`Srv-A`, `Srv-B`). | Không phản ánh đúng phạm vi quản lý tầng định tuyến IP/MPLS. 480 switch Access chưa có cơ chế tóm lược. |
| **Tương tác sự cố** | Highlight giả thuyết AI chỉ đổi màu cứng 2 đường link `edge-fault` và `edge-impact`. | Chưa có khả năng tự động zoom tiêu cự (Auto-fit/Auto-focus) vào tâm chấn sự cố. |

---

## 2. DANH SÁCH YÊU CẦU THIẾT KẾ CHI TIẾT (REQUIREMENTS SPECIFICATION)

### 2.1. Nhóm A: Bảo toàn Phân cấp & Trọng tâm Tầng Router

- **REQ-01 [MUST] Phân tầng phân cấp Router theo làn (Stratified Tier Bands):**
  - Bản đồ phải hiển thị rõ ràng 5 làn phân cấp viễn thông từ trên xuống dưới (hoặc từ trái sang phải):
    1. **Tầng 1 (Biên ngoài):** `PEER` (6 Peering Routers) & `IGW` (8 National Border Gateways).
    2. **Tầng 2 (Xương sống lõi):** `CORE` (4 Provincial Core Routers).
    3. **Tầng 3 (Tổng hợp biên):** `AGG` (24 Edge Aggregation Routers).
    4. **Tầng 4 (Phân phối tổng đài):** `EXCH` (36 Metro Exchange Hubs).
    5. **Tầng 5 (Truy cập đầu cuối):** `ACC` (Các cụm switch Access trạm).
  - *Giá trị mang lại:* Kỹ sư luôn nhận biết tức thì hướng dòng chảy lưu lượng (Upstream vs Downstream) và ranh giới trách nhiệm vận hành.

- **REQ-02 [MUST] Ưu tiên Router Layer & Gom cụm Access Layer:**
  - Ở chế độ mặc định, toàn bộ **78 router hạ tầng** được hiển thị rõ nét.
  - 480 switch Access không được rải tràn lan ra màn hình. Thay vào đó, chúng được tóm lược thành **Access Leaf Badges** đính kèm dưới mỗi Exchange router (ví dụ: `[+14 ACC]`).
  - Nếu có switch con bị lỗi, huy hiệu đổi sang viền đỏ kèm số lỗi (ví dụ: `[+14 ACC | 1 Lỗi]`).
  - Nhấp vào huy hiệu sẽ "bung" (expand) các switch con của riêng trạm đó ra dạng quạt tròn hoặc lưới nhánh nhỏ (On-demand Bloom).

- **REQ-03 [MUST] Thể hiện trực quan liên kết dự phòng kép (Dual-Homing & ECMP):**
  - Cấu trúc mạng viễn thông luôn có dự phòng n+1: mỗi AGG nối 2 Core, mỗi EXCH nối 2 AGG.
  - Các đường liên kết phải được vẽ bằng đường cong bezier mềm để tránh cắt nhau vuông góc, giúp phân biệt ngay đường tải chính (active) và đường bảo vệ (standby/reroute).

---

### 2.2. Nhóm B: Điều hướng Focus + Context & Triệt tiêu Nhiễu

- **REQ-04 [MUST] Điều hướng Ego-Network theo bán kính bước nhảy (k-Hop Focus):**
  - Khi kỹ sư nhấp vào một node bất kỳ, node đó lập tức trở thành **Focus Node** (tâm điểm điều tra).
  - Cung cấp thanh chọn bán kính bước nhảy:
    - **1-Hop:** Chỉ hiển thị các thiết bị kết nối vật lý trực tiếp với Focus Node.
    - **2-Hop:** Mở rộng thêm 1 cấp láng giềng (để nhìn thấy router Core đối tác và đường dự phòng).
    - **3-Hop:** Mở rộng diện rộng liên vùng.
    - **Toàn mạng (All):** Toàn cảnh 78 router.

- **REQ-05 [MUST] Ẩn hoặc làm mờ động các node ở xa (Distance-based Culling & Ghosting):**
  - Các node và liên kết có khoảng cách $> k$ bước nhảy sẽ:
    - *Chế độ Culling (Ẩn hẳn):* Biến mất hoàn toàn (`opacity: 0`, không nhận click) để loại bỏ 90% nhiễu thị giác.
    - *Chế độ Ghosting (Bóng mờ):* Giữ độ mờ mờ 5–10% để kỹ sư vẫn cảm nhận được bối cảnh tổng thể mạng.
  - Các node trong phạm vi $k$-hop giữ độ tương phản cao, nhãn tên cổng và trạng thái cảnh báo sáng rõ.

- **REQ-06 [MUST] Bảo toàn trục phân cấp khi Focus (Tier-Invariance Constraint):**
  - Khi một node được chọn và các node lân cận hiện ra, các node lân cận **bắt buộc phải nằm đúng trên làn tầng (Tier Band) cố định của chúng**.
  - Nghiêm cấm thuật toán vật lý tự do kéo node Core xuống đáy hoặc đẩy node Access lên đỉnh màn hình, gây mất phương hướng cho kỹ sư.

- **REQ-07 [SHOULD] Chuyển cảnh mềm mại (Animated Tweening):**
  - Mọi thao tác ẩn/hiện node, dịch chuyển góc nhìn (Pan) hoặc phóng to thu nhỏ (Zoom) phải có hiệu ứng nội suy chuyển động (tweening) trong 300–400ms.

---

### 2.3. Nhóm C: Điều tra Sự cố & Ngữ cảnh Vận hành L2/L3

- **REQ-08 [MUST] Khởi động tự động tại tâm chấn sự cố (Incident Epicenter Auto-Focus):**
  - Khi kỹ sư mở một sự cố (ví dụ `INC-2026-0915`), giao diện không hiển thị toàn cảnh xa xôi mà tự động căn giữa (Auto-Center) và đặt mức Focus 1-Hop quanh thiết bị phát sinh cảnh báo gốc (`R-HN-01` và `SW-HN-02`).

- **REQ-09 [MUST] Chuyển đổi ngữ cảnh 2 tầng (L2 Cáp quang vs L3 Định tuyến):**
  - **Tầng L2 (Vật lý & Cáp quang):**
    - Hiển thị loại cáp (Single-mode 10G/40G/100G).
    - Hiển thị công suất thu quang ($P_{rx}$ dBm), phát quang ($P_{tx}$ dBm), cảnh báo nhiệt độ module SFP.
    - Tỷ lệ lỗi bit vật lý (CRC errors/min).
  - **Tầng L3 (Logic & Định tuyến):**
    - Hiển thị dải mạng con `/30`, `/31` kết nối giữa các router.
    - Trạng thái phiên BGP Peering, chi phí OSPF Cost/Weight.
    - Hoạt ảnh luồng hạt chuyển động biểu thị lưu lượng dịch vụ ưu tiên (5G User Plane, VoIP).

- **REQ-10 [SHOULD] Truy vết diện ảnh hưởng sự cố (Blast Radius Tracing):**
  - Cung cấp nút thao tác 1-click `[Truy vết diện ảnh hưởng]`:
    - Tự động dò tìm theo thuật toán đồ thị tất cả các router hạ lưu và cụm trạm thuê bao bị gián đoạn hoặc bị rớt gói khi liên kết gặp sự cố.
    - Đổi màu liên kết bị ảnh hưởng sang màu cam nét đứt (`#f59e0b`) kèm nhãn tỷ lệ rớt gói.

---

### 2.4. Nhóm D: Tiện ích Vận hành & Hiệu năng Hệ thống

- **REQ-11 [SHOULD] Thanh tìm kiếm & Định vị tức thì (Quick Search & Jump):**
  - Hỗ trợ gõ nhanh mã router (ví dụ `CORE-01`, `AGG-05`), IP loopback hoặc tên Site.
  - Nhấn Enter sẽ lướt camera mượt mà đến router đó và tự động kích hoạt Focus 1-Hop.

- **REQ-12 [MUST] Đồng bộ hai chiều với Sidebar:**
  - Nhấp vào một node trên bản đồ $\rightarrow$ Tự động mở chi tiết thiết bị, cấu hình cổng, tải CPU và lệnh kiểm tra CLI ở Sidebar Phải.
  - Nhấp vào một Giả thuyết AI ở Sidebar Trái $\rightarrow$ Bản đồ tự động khoanh vùng đường truyền lỗi và dịch chuyển camera tương ứng.

- **REQ-13 [SHOULD] Radar / Minimap thu nhỏ:**
  - Cửa sổ nhỏ góc dưới thể hiện bản đồ tổng thể 78 router và khung chữ nhật thể hiện vùng nhìn (Viewport) hiện tại.

- **REQ-14 [MUST] Hiệu năng 60 FPS mượt mà cho 500+ đối tượng:**
  - Thuật toán tính toán bước nhảy BFS và render phải chạy dưới 5ms, đảm bảo trải nghiệm pan/zoom đạt tốc độ khung hình 60 FPS trên trình duyệt thông thường.


## 3. THIẾT KẾ KIẾN TRÚC DỮ LIỆU & THUẬT TOÁN CỐT LÕI

### 3.1. Mô hình Dữ liệu Chuẩn hóa (`NETWORK_DATA`)

```javascript
const NETWORK_DATA = {
  // 78 Routers thuộc phạm vi quản lý chính
  nodes: [
    { id: "CORE-01", role: "core", site: "SITE-1", tier: 2, vendor: "Cisco", model: "ASR-9922", ip: "10.244.0.1", status: "critical" },
    { id: "AGG-01", role: "edge_aggregation", site: "SITE-1", tier: 3, vendor: "Cisco", model: "NCS-5508", ip: "10.244.1.1", status: "warning" },
    { id: "EXCH-01", role: "exchange", site: "SITE-1", tier: 4, vendor: "Huawei", model: "S9704", ip: "10.244.2.1", status: "normal", accessCount: 14 }
  ],
  // 152 Liên kết đường trục L3 giữa các router
  links: [
    { id: "LNK-0001", source: "CORE-01", target: "AGG-01", sPort: "0/0/0", tPort: "0/0/0", speed: "100G", status: "fault", crcError: 1250 }
  ],
  // 480 Switch Access được gom theo cha để mở rộng khi cần
  accessClusters: {
    "EXCH-01": [
      { id: "ACC-001", role: "access", site: "SITE-1", status: "normal" },
      // ... 14 switch
    ]
  }
};
```

### 3.2. Thuật toán Duyệt Đồ thị Focus & Culling (BFS Ego-Network Algorithm)

Khi kỹ sư chọn node $u$ và bán kính $k \in \{1, 2, 3\}$:
1. **Khởi tạo:** Hàng đợi $Q = [u]$, bảng khoảng cách $dist[u] = 0$, $dist[v] = \infty$ với mọi $v \neq u$.
2. **Duyệt BFS:**
   ```javascript
   while (Q.length > 0) {
     const curr = Q.shift();
     if (dist[curr] >= k) continue;
     for (const neighbor of adjacencyList[curr]) {
       if (dist[neighbor] === Infinity) {
         dist[neighbor] = dist[curr] + 1;
         Q.push(neighbor);
       }
     }
   }
   ```
3. **Phân loại hiển thị:**
   - Nếu $dist[v] \le k$: `visible = true`, `opacity = 1.0`, hiển thị đầy đủ icon, tên và badge cảnh báo.
   - Nếu $dist[v] > k$:
     - *Chế độ Ẩn (Prune):* `visible = false` (bỏ qua không render).
     - *Chế độ Mờ (Dim):* `visible = true`, `opacity = 0.08` (không nhận sự kiện chuột).
4. **Giữ nguyên trục Y theo tầng (Tier-Invariance Constraint):**
   - Tọa độ Y của node $v$ được ấn định bất biến:
     $$Y(v) = \text{TierOffsets}[v.\text{role}]$$
   - Tọa độ X của các node hiển thị trong cùng một tầng được phân bố đều theo thứ tự ID hoặc Site để tránh chồng lấn nhãn.

