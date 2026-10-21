# HƯỚNG DẪN YÊU CẦU THIẾT KẾ UI/UX (UI/UX DESIGN REQUIREMENTS)

## 1. Yêu cầu thiết kế UI/UX theo phản hồi Review (Review Feedback & Core Requirements)

Sau đợt review bản thiết kế và wireframe trước đó, giao diện cần được điều chỉnh tinh gọn theo 3 yêu cầu cốt lõi sau:

1. **Kiến trúc một màn hình duy nhất (Single-Page Dashboard):**
   - Toàn bộ hoạt động điều tra diễn ra trên một trang Dashboard duy nhất.
   - Trọng tâm của dự án là **Topology mạng**, không phải tính năng trợ lý AI. Không tách thành nhiều trang rời rạc và loại bỏ khung chat AI chiếm diện tích.

2. **Topology là trung tâm tương tác (Topology-Centric Layout):**
   - Bản đồ Topology phải nằm ở **vị trí chính giữa và kích thước lớn** (chiếm phần lớn không gian màn hình).
   - Các thành phần khác đóng vai trò là **Sidebar hỗ trợ điều hướng Topology**.
   - Hỗ trợ tương tác trực quan: Khi kỹ sư nhấp vào một giả thuyết (theory) do AI đề xuất, hệ thống sẽ tự động làm nổi bật (highlight) đường truyền và các liên kết/thiết bị (paths & edges) liên quan trên bản đồ.

3. **Phong cách tối giản, hiển thị tinh gọn (Simplified & Concise UI):**
   - Thiết kế theo hướng tối giản (clean/simplified theme).
   - Thông tin hiển thị phải cô đọng, súc tích, tránh quá tải thông tin (information overload) cho kỹ sư vận hành.

---

## 2. Thiết kế mới (New Dashboard Design)

Bố cục giao diện được chuẩn hoá theo mô hình luồng tư duy tự nhiên từ Trái sang Phải (**Nguyên nhân $\rightarrow$ Bản đồ tác chiến $\rightarrow$ Căn cứ kiểm chứng**), áp dụng nguyên tắc phân cấp thông tin 3 tầng (Progressive Disclosure) để tránh quá tải:

- **Topology Canvas (Trung tâm - Hero Component, chiếm 65–70%):**
  - **Trực quan hóa trọng tâm:** Chỉ hiển thị liên kết nghi ngờ (đỏ đậm), luồng ảnh hưởng (cam nét đứt); làm mờ các thành phần bình thường để loại bỏ nhiễu.
  - **Tương tác click 2 chiều:** Nhấp vào Node hoặc Edge trên sơ đồ sẽ lập tức đồng bộ dữ liệu chi tiết sang Sidebar Phải (không dùng popup che khuất sơ đồ).
  - **Bộ lọc hiển thị nổi (Overlay Controls):**
    - *Scope Filter:* Chỉ hiện vùng sự cố (mặc định) / Mở rộng +1 Hop / Toàn bộ Ring mạng.
    - *Layer Overlay:* Chuyển đổi linh hoạt giữa tầng vật lý L2 (cổng, quang), định tuyến L3, và luồng dịch vụ (Service Flow).

- **Sidebar Trái (Navigator & AI Theories, rộng ~20%):**
  - **Cảnh báo liên đới:** Danh sách mini dạng timeline tóm tắt các cảnh báo gốc (thời điểm, thiết bị, lỗi).
  - **Giả thuyết AI (Actionable Micro-Cards):** Danh sách Top 3 nguyên nhân xếp hạng theo độ tin cậy. Nhấp vào giả thuyết $\rightarrow$ tự động phóng to và kích hoạt highlight đường đi trên Topology.

- **Sidebar Phải (Contextual Inspector & Action, rộng ~20%, hỗ trợ thu gọn):**
  - **Tự động chuyển đổi ngữ cảnh:**
    - Khi chọn *Liên kết (Edge):* Hiện 4 chỉ số cốt lõi (băng thông, tỷ lệ lỗi CRC, công suất quang) + biểu đồ sparkline nhỏ tại thời điểm lỗi.
    - Khi chọn *Thiết bị (Node):* Hiện trạng thái cổng, tải CPU và danh sách cảnh báo cục bộ.
  - **Phân cấp bằng Accordion:** Các thông số cơ bản mở sẵn; thông tin cấu hình sâu/log thô xếp trong mục mở rộng để giữ giao diện thoáng.
  - **Hành động xác thực:** Cung cấp lệnh CLI kiểm tra 1-click copy và nút xác nhận/bác bỏ nguyên nhân.

- **Thanh trượt thời gian (Bottom Timeline Scrubber):**
  - Thanh trượt hiển thị các mốc sự kiện chính (`13:58`, `14:32`, `14:33`, `Hiện tại`), cho phép kỹ sư tua lại (replay) tiến trình lan truyền sự cố trên sơ đồ mạng.

---

## 3. Chuỗi Wireframe theo User Journey (Deliverables)

Toàn bộ luồng nghiệp vụ được cụ thể hóa bằng chuỗi file HTML tương ứng theo từng bước trong sơ đồ [`user-journey.mmd`](./user-journey.mmd):

1. **Giai đoạn 1 (Tiếp nhận sự cố - Default Landing):** [`01-overview.html`](./01-overview.html)
2. **Giai đoạn 2 (Điều tra giả thuyết #1 - Hypothesis Focus):** `02-theory-focus.html`
3. **Giai đoạn 3 (Soi chi tiết thiết bị & Cổng quang - Deep Inspect):** `03-node-inspect.html`
4. **Giai đoạn 4 (Đánh giá diện ảnh hưởng L3 - Service Impact):** `04-service-impact.html`
5. **Giai đoạn 5 (Xác nhận nguyên nhân & Khắc phục - Resolution):** `05-resolved.html`
