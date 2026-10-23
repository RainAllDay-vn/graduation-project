# Tuần 04: UI/UX Dashboard Điều tra Sự cố Mạng (Production-Ready Architecture)

Thư mục này chứa mã nguồn giao diện người dùng theo chuẩn production, tách biệt hoàn toàn CSS và JS để dễ dàng mở rộng và tích hợp vào hệ thống thực tế.

## 1. Cấu trúc thư mục mã nguồn
```
week04-ui-ux-design/
├── css/
│   └── styles.css              # Custom keyframe animations (pulse, traffic flow), scrollbars, SVG styling
├── js/
│   ├── data.js                 # Centralized Data Store (Incidents, Alarms, Theories, Nodes, Edges)
│   ├── topology.js             # SVG Topology Controller (Render, Zoom/Pan, Scope & Layer Filter)
│   ├── inspector.js            # Contextual Inspector (Telemetry, Accordions, Sparklines, CLI Actions)
│   └── app.js                  # Application State Manager & Event Binder
├── prototypes/                 # PROTOTYPES TRỰC QUAN HÓA TOPOLOGY 554 THIẾT BỊ (MOCK-DATA WEEK 03)
│   ├── index.html              # Trang tổng hợp & Bảng ma trận so sánh UX (lưu trữ kết quả đánh giá 3 cách)
│   ├── data.json               # Dữ liệu 78 routers + 480 access switches + 152 backbone links
│   ├── data.js                 # Script nạp window.NETWORK_DATA độc lập không phụ thuộc web server
│   └── 01-tiered-stratified.html  # Cách 1 (ĐƯỢC CHỌN): Stratified Tiered Canvas (Băng tầng phân cấp + k-hop)
├── 01-overview.html            # Giai đoạn 1: Tiếp nhận sự cố (Default Landing)
├── 02-theory-focus.html        # Giai đoạn 2: Điều tra giả thuyết #1 (Hypothesis Focus)
├── 03-node-inspect.html        # Giai đoạn 3: Soi thiết bị & Cổng quang (Deep Inspect)
├── 04-service-impact.html      # Giai đoạn 4: Đánh giá diện ảnh hưởng L3 (Service Impact)
├── 05-resolved.html            # Giai đoạn 5: Xác nhận nguyên nhân & Khắc phục (Resolution)
├── ui-ux-design-guide.md       # Tài liệu đặc tả yêu cầu UI/UX
└── user-journey.mmd            # Sơ đồ luồng hành trình người dùng (Mermaid)
```

## 2. Công nghệ sử dụng
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) utility-first framework kết hợp `css/styles.css` cho các hiệu ứng chuyển động vi mô (Micro-interactions).
- **Kiến trúc mã nguồn:** Decoupled Model-View-Controller (Data Store $\rightarrow$ Renderers $\rightarrow$ App Controller).
- **Tương tác:** Hỗ trợ điều hướng tuần tự qua 5 file HTML mô phỏng trọn vẹn hành trình người dùng (User Journey) từ lúc tiếp nhận đến khi xử lý xong sự cố.
