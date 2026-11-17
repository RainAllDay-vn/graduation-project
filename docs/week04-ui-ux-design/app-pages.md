# Bản đồ trang ứng dụng

Tài liệu liệt kê toàn bộ trang của hệ thống, quy ước điều hướng giữa các trang, và trạng thái thiết kế của từng trang. Dashboard điều tra sự cố là một trang trong số này — vì phức tạp nhất nên có thư mục thiết kế riêng (`dashboard-page-stylebook/`, ch0–ch5). Từ ngày 10-11, mỗi trang được đặc tả bằng **một trang thiết kế tương tác** trong thư mục `app-pages/` (miniature của trang ở giữa, hai sidebar card giải thích xung quanh); tài liệu này giữ vai trò **bản đồ + tóm tắt**, trỏ về trang tương tác của từng trang.

# Mục lục

- [I. Nguyên tắc](#i-nguyên-tắc)
- [II. Sơ đồ điều hướng](#ii-sơ-đồ-điều-hướng)
- [III. Bảng tổng hợp](#iii-bảng-tổng-hợp)
- [IV. Đặc tả từng trang](#iv-đặc-tả-từng-trang)
  - [1. Trang chủ](#1-trang-chủ)
  - [2. Đăng nhập](#2-đăng-nhập)
  - [3. Đăng ký tài khoản](#3-đăng-ký-tài-khoản)
  - [4. Tổng quan mạng](#4-tổng-quan-mạng)
  - [5. Bản đồ mạng & Điều tra sự cố (Topology)](#5-bản-đồ-mạng--điều-tra-sự-cố-topology)
  - [6. Tra cứu thiết bị, liên kết, dịch vụ](#6-tra-cứu-thiết-bị-liên-kết-dịch-vụ)
  - [7. Quản lý tài liệu](#7-quản-lý-tài-liệu)
  - [8. Cấu hình nguồn dữ liệu](#8-cấu-hình-nguồn-dữ-liệu)
  - [9. Cài đặt chung](#9-cài-đặt-chung)
- [V. Trang không làm](#v-trang-không-làm)

# I. Nguyên tắc

- Ứng dụng gồm **9 trang** (Đăng ký thêm 11-11; Trang chủ + Tổng quan mạng thêm 12-11; Nguồn dữ liệu + Cài đặt thêm 12-11; Hợp nhất Bản đồ mạng & Không gian điều tra Topology 17-11 theo mô hình *Single Topology Engine*). **Trang Topology là không gian làm việc trung tâm cốt lõi** phục vụ song song cả hai nhiệm vụ: quan sát khám phá hạ tầng mạng tự do và điều tra chẩn đoán sự cố chuyên sâu.
- **Cơ chế nâng cấp ngữ cảnh động (Contextual Elevation via `incidentId`)**:
  - Không có `incidentId` trong URL $\rightarrow$ **Chế độ Khám phá hạ tầng**: Canvas hiển thị toàn mạng viễn thông hoặc tiêu điểm thiết bị (`focusNodeId`), sidebar trái chỉ gồm 2 tab hạ tầng (*Thiết bị* và *Hiển thị*), Inspector hiển thị thông số phần cứng, telemetry và liên kết trực tiếp.
  - Có `incidentId` trong URL $\rightarrow$ **Chế độ Điều tra sự cố**: Header tự động bật chip sự cố (`INC-xx · ĐANG XỬ LÝ`), sidebar trái mở khóa thêm 2 tab chuyên sâu (*Timeline cảnh báo* và *Giả thuyết AI*), canvas khoanh vùng tâm chấn và vẽ luồng ảnh hưởng, Inspector bổ sung các hành động xác nhận/bác bỏ giả thuyết và đóng sự cố.
- **Format đặc tả một trang — trang thiết kế tương tác** trong `app-pages/` (một HTML mỗi trang, dùng chung `css/app-pages.css` + `js/app-pages.js`): **miniature của trang (khung thiết kế 1440×900, tự scale lấp vùng giữa) đặt giữa**, hai sidebar card hai bên — trái = **bố cục & vùng**, phải = **tương tác**; rê chuột lên card ở sidebar trái là soi thử vùng tương ứng trên miniature ngay lập tức, bấm card để chốt. Chi tiết hành vi canvas 5 tầng tham chiếu thêm tại `dashboard-page-stylebook/` (ch0–ch5).
- **Bảng + panel chi tiết** là pattern dùng chung của Tra cứu và Quản lý tài liệu (khối `.vp-thead`/`.vp-trow`/`.vp-chip` chia sẻ trong `css/app-pages.css`) — chip trạng thái một ngôn ngữ trên cả hai trang.
- **Token màu & font dùng chung một nguồn** (`design-tokens.css` đặt cạnh hai thư mục thiết kế, thêm 13-11): palette giấy/mực, màu nhấn, bộ ba trạng thái, màu canvas topology, site/tier, và hai họ font **Inter + JetBrains Mono**.

# II. Sơ đồ điều hướng

```mermaid
flowchart LR
    LAND[Trang chủ] --> LOGIN[Đăng nhập]
    LAND -->|chưa có tài khoản| SIGNUP[Đăng ký tài khoản]
    LOGIN --> OV[Tổng quan mạng]
    SIGNUP -->|tạo xong / quay lại| LOGIN
    OV -->|bấm sự cố đang mở| TOPO_INC[Topology · Chế độ sự cố ?incidentId=...]
    OV -->|bấm tab Topology| TOPO[Topology · Chế độ toàn cảnh]
    TOPO_INC -->|xử lý xong / thoát sự cố| TOPO
    OV --> TC[Tra cứu]
    TC -->|xem trong topology| TOPO
    OV --> DOCS[Quản lý tài liệu]
    OV --> SRC[Nguồn dữ liệu]
    OV --> SET[Cài đặt chung]
```

- Chưa đăng nhập: vào **Trang chủ** trước — hai nút dẫn sang Đăng nhập và Đăng ký. Nếu phiên cũ còn hợp lệ, nút chính đổi thành "Tiếp tục phiên làm việc" vào thẳng Tổng quan.
- Sau đăng nhập, trang mặc định là **Tổng quan mạng**; nếu có sự cố đang được xử lý dở, hệ thống hỏi "tiếp tục điều tra INC-xx?" và vào thẳng Topology với tham số sự cố nếu đồng ý.
- **Thanh điều hướng chính nằm trong topbar, hiện ở mọi trang sau đăng nhập (6 tab thống nhất)**:
  - **Tổng quan · Topology (có chấm đỏ nhấp nháy 🔴 khi có sự cố) · Tra cứu · Tài liệu · Nguồn dữ liệu · Cài đặt**.
  - Khi người dùng nhấp vào tab **Topology**:
    - Nếu hệ thống đang có sự cố mở: tự động dẫn vào `/topology?incidentId=INC-top` để ưu tiên xử lý sự cố.
    - Nếu hệ thống không có sự cố: mở `/topology` ở chế độ toàn cảnh hạ tầng.
- **Đi sâu từ Tra cứu**: chọn một thiết bị $\rightarrow$ nút "Xem trong topology →" mở thẳng `/topology?focusNodeId=...` với thiết bị đó làm tiêu điểm và bán kính lân cận (không ép buộc thiết bị phải nằm trong sự cố).

# III. Bảng tổng hợp

| # | Trang | Mục đích | Ai dùng | Độ phức tạp | Trạng thái thiết kế |
|---|-------|----------|---------|-------------|---------------------|
| 1 | Trang chủ | Cổng vào cho người dùng chưa đăng nhập — giới thiệu ngắn, dẫn sang Đăng nhập/Đăng ký | Mọi người dùng | Đơn giản | Khung đề xuất — [`app-pages/landing.html`](app-pages/landing.html) |
| 2 | Đăng nhập | Xác thực vào hệ thống | Mọi người dùng | Đơn giản | Khung đề xuất — [`app-pages/login.html`](app-pages/login.html) |
| 3 | Đăng ký tài khoản | Tự đăng ký tài khoản kỹ sư vận hành | Người dùng mới | Đơn giản | Khung đề xuất — [`app-pages/signup.html`](app-pages/signup.html) |
| 4 | Tổng quan mạng | Nhìn nhanh sức khỏe mạng và chọn sự cố để điều tra | Kỹ sư, quản lý vận hành | Trung bình | Khung đề xuất — [`app-pages/overview.html`](app-pages/overview.html) |
| 5 | Bản đồ mạng & Điều tra (Topology) | Không gian làm việc trực quan hóa cốt lõi: quan sát toàn mạng hạ tầng tự do; tự động nâng cấp sang chế độ điều tra sự cố khi có `incidentId` | Kỹ sư trực, kỹ sư IP/MPLS | Cao | **Đã thiết kế** — [`app-pages/topology.html`](app-pages/topology.html) · Stylebook ch0–ch5 |
| 6 | Tra cứu | Tra cứu thiết bị, liên kết, dịch vụ không gắn với sự cố đang mở | Kỹ sư | Trung bình | Khung đề xuất — [`app-pages/lookup.html`](app-pages/lookup.html) |
| 7 | Quản lý tài liệu | Nạp và quản lý tài liệu kỹ thuật, nghiệp vụ cho AI | Kỹ sư, người phụ trách nội dung | Đơn giản | Khung đề xuất — [`app-pages/documents.html`](app-pages/documents.html) |
| 8 | Nguồn dữ liệu | Cấu hình hệ thống nguồn bên thứ ba và mapping dữ liệu | Quản trị hệ thống | Trung bình | Khung đề xuất — [`app-pages/sources.html`](app-pages/sources.html) |
| 9 | Cài đặt chung | Tùy chỉnh giao diện toàn ứng dụng, lưu vĩnh viễn | Mọi người dùng | Đơn giản | Khung đề xuất — [`app-pages/settings.html`](app-pages/settings.html) |

# IV. Đặc tả từng trang

Mỗi mục dưới đây chỉ là tóm tắt — đặc tả đầy đủ nằm trong trang tương tác tương ứng của thư mục `app-pages/`.

## 1. Trang chủ

**Đã đặc tả: [`app-pages/landing.html`](app-pages/landing.html)** — miniature trang chủ ở giữa (5 vùng: thanh trên cùng, thông điệp chính, hai nút hành động, ba khối năng lực, chân trang), hai sidebar giải thích, demo 2 trạng thái (mặc định, có phiên cũ).

Tóm tắt thiết kế: lớp giới thiệu mỏng nhẹ — thanh trên cùng chỉ có brand + hai nút xác thực; một thông điệp nói rõ công cụ làm gì; ba khối năng lực (TOPOLOGY, ĐIỀU TRA, TRA CỬU) trỏ thẳng ba vùng cốt lõi của app thay vì liệt kê tính năng chung chung. Đề xuất chờ gật: nút "Tạo tài khoản" (đường phụ, giống link Đăng ký ở trang Đăng nhập) và trạng thái "có phiên cũ" — nút chính đổi thành "Tiếp tục phiên làm việc" vào thẳng Tổng quan.

## 2. Đăng nhập

**Đã đặc tả: [`app-pages/login.html`](app-pages/login.html)** — miniature trang đăng nhập ở giữa (7 vùng: khối nhận diện, hai trường nhập + hàng ghi nhớ/quên mật khẩu, nút chính, link SSO, panel phải nền tối, chuyển ngôn ngữ, chân trang), hai sidebar giải thích, demo 4 trạng thái (mặc định, lỗi, đang xử lý, thành công).

Tóm tắt thiết kế: **bố cục chia đôi** — cột form sáng bên trái (logo tròn đầu cột, tiêu đề lớn, dòng "Chưa có tài khoản? Đăng ký", hai trường với gợi ý viết ngay trong trường, hàng "Ghi nhớ tôi" + "Quên mật khẩu?", nút chính bo tròn đặt giữa, link SSO dưới phân cách "HOẶC") và panel nền tối bên phải có **hoạt ảnh topology nhẹ** — vài nút mạng nhấp nháy chậm, liên kết chảy dữ liệu, nút trung tâm phát sóng quét định kỳ (SVG + CSS thuần, không JS, tự tắt khi bật giảm chuyển động); nội dung thật của panel chờ quyết định. Góc trên phải có cặp nút VI/EN — đổi ngôn ngữ toàn trang ngay trong miniature, mặc định tiếng Việt (đề xuất chờ gật). Form nội bộ là đường chính, SSO là đường phụ (đề xuất chờ gật); lỗi báo inline trong cột, không alert; chân trang ghi phiên bản + môi trường (đề xuất). Sau đăng nhập vào Tổng quan mạng, hoặc thẳng Dashboard nếu có sự cố đang xử lý dở (quy ước ở mục II).

## 3. Đăng ký tài khoản

**Đã đặc tả: [`app-pages/signup.html`](app-pages/signup.html)** — miniature trang đăng ký ở giữa (6 vùng: khối nhận diện, bốn trường nhập, nút chính, panel phải nền tối, chuyển ngôn ngữ, chân trang), hai sidebar giải thích, demo 4 trạng thái (mặc định, mật khẩu không khớp, email đã tồn tại, thành công).

Tóm tắt thiết kế: cùng vỏ ngoài với Đăng nhập (bố cục chia đôi, cột form trái — logo tròn, dòng "Đã có tài khoản? Đăng nhập" chuyển về trang đăng ký, panel tối phải có hoạt ảnh topology nhẹ như Đăng nhập, chân trang môi trường); góc trên phải có cặp nút VI/EN đổi ngôn ngữ như Đăng nhập (đề xuất chờ gật); bốn trường với gợi ý ngay trong trường — họ và tên, email công ty, mật khẩu kèm gợi ý "tối thiểu 8 ký tự" dưới trường, xác nhận mật khẩu; lỗi báo inline đúng vị trí (dưới trường, băng trên form), không alert. Sau tạo tài khoản: gửi email kích hoạt rồi về Đăng nhập (**luồng đề xuất chờ gật** — phương án khác: chờ quản trị duyệt).

## 4. Tổng quan mạng

**Đã đặc tả: [`app-pages/overview.html`](app-pages/overview.html)** — miniature trang tổng quan ở giữa (6 vùng: thanh điều hướng ứng dụng, tiêu đề + thời điểm dữ liệu, bốn thẻ chỉ số, sự cố đang mở, đã xử lý gần đây, chân trang), hai sidebar giải thích, demo 4 trạng thái (mặc định, có phiên dở, đang tải, mới thiết lập).

Tóm tắt thiết kế: trả lời "mạng đang thế nào, việc gì cần xử lý trước" trong một màn hình — bốn thẻ chỉ số sức khỏe trên cùng (nút hoạt động, cảnh báo đang mở, sự cố đang xử lý, cổng mất kết nối, mỗi thẻ kèm dòng phụ chỉ đúng đối tượng), danh sách sự cố đang mở sắp theo mức độ ưu tiên với nút "Mở Dashboard" (lối vào chính của Dashboard), và sự cố đã xử lý gần đây kèm thời gian khôi phục. Nếu còn phiên điều tra dở, băng trên cùng hỏi "tiếp tục điều tra INC-xx?" (quy ước ở mục II). Khác Dashboard: Tổng quan trả lời "chọn việc gì" khi chưa có ngữ cảnh sự cố; Dashboard trả lời "sự cố này là gì" khi đã có.

## 5. Bản đồ mạng & Điều tra sự cố (Topology)

**Đã đặc tả: [`app-pages/topology.html`](app-pages/topology.html)** (tham chiếu chi tiết tương tác tại `dashboard-page-stylebook/` ch0–ch5) — không gian làm việc trung tâm cốt lõi của hệ thống, vận hành theo mô hình **Single Topology Engine** với cơ chế nâng cấp ngữ cảnh động (*Contextual Elevation*) dựa trên tham số `incidentId`:

- **Chế độ 1: Khám phá hạ tầng toàn cảnh (Khi KHÔNG có `incidentId`)**:
  - *URL:* `/topology` (hoặc `/topology?focusNodeId=CORE-01&kHop=1`).
  - *Header mỏng:* Giữ nhận diện thương hiệu `NOC TOPOLOGY` và chip tiêu điểm hạ tầng (`TOÀN MẠNG · 78 THIẾT BỊ · 152 LIÊN KẾT` hoặc `FOCUS: CORE-01 (1-Hop)`). Không có mã sự cố.
  - *Sidebar trái:* Chỉ gồm **2 tab hạ tầng** — **Thiết bị** (ô tìm kiếm + lọc theo tầng `CORE/AGG/EXCH/BIÊN` + danh sách thiết bị A→Z) và **Hiển thị** (chọn bán kính bước nhảy k-Hop 1/2/3/Toàn mạng, chế độ làm mờ/ẩn, công tắc nhãn cổng).
  - *Canvas topology 5 tầng:* Peering & Transit → National Border Gateway → Core Backbone → Edge Aggregation → Metro Exchange. Thuật toán BFS Ego-Network làm nổi bật láng giềng $k$-hop quanh node tiêu điểm và làm mờ các vùng ngoài lề.
  - *Inspector bên phải:* Khi chưa chọn thiết bị $\rightarrow$ hiển thị thẻ thống kê sức khỏe toàn mạng (tổng thiết bị, số node hoạt động, số cảnh báo); khi chọn thiết bị $\rightarrow$ hiển thị thông số định danh, IP, tải CPU/RAM, nhiệt độ SFP và danh sách cổng/liên kết trực tiếp.

- **Chế độ 2: Điều tra chẩn đoán sự cố (Khi CÓ `incidentId`)**:
  - *URL:* `/topology?incidentId=INC-07`.
  - *Header mỏng:* Bật chip sự cố nổi bật: `INC-07 · ĐANG XỬ LÝ · mở 13:52` (nền cam/đỏ nổi bật).
  - *Camera:* Tự động căn tiêu cự (Auto-fit/Auto-zoom) vào tâm chấn sự cố (`epicenter` của incident).
  - *Sidebar trái mở rộng thành 4 tab:* Tự động mở khóa thêm 2 tab chuyên sâu — **Timeline cảnh báo** (trục thời gian chuỗi alert liên quan) và **Giả thuyết AI** (danh sách nguyên nhân gốc rễ xếp theo độ tin cậy kèm nút Xác nhận / Bác bỏ).
  - *Canvas topology:* Khoanh vùng nghi vấn, kích hoạt vòng beacon đỏ nhấp nháy tại đường truyền lỗi và tô màu cam nét đứt cho diện ảnh hưởng (Blast Radius).
  - *Inspector bên phải:* Bổ sung khối trích dẫn tài liệu kỹ thuật, hướng dẫn đo kiểm quang, và nút kết thúc/đóng phiên điều tra sự cố.

## 6. Tra cứu thiết bị, liên kết, dịch vụ

**Đã đặc tả: [`app-pages/lookup.html`](app-pages/lookup.html)** — miniature trang tra cứu ở giữa (6 vùng: thanh điều hướng, tìm kiếm + bộ lọc, tab theo loại, bảng tài nguyên, panel chi tiết, chân trang), hai sidebar giải thích, demo 3 trạng thái (mặc định, chưa chọn, không có kết quả).

Tóm tắt thiết kế: tra cứu tài nguyên khi không có sự cố đang mở — ô tìm kiếm lớn (lọc ngay khi gõ, không nút "Tìm") + ba bộ lọc (Lớp, Khu vực, Trạng thái) và tab theo loại kèm số lượng (Thiết bị, Liên kết, Dịch vụ) đứng trên bảng. Chọn một dòng → panel chi tiết bên phải dùng ngôn ngữ hiển thị giống Inspector để nhất quán; nút chính "Xem trong topology →" mở thẳng `/topology?focusNodeId=...` với thiết bị đó ở trạng thái tiêu điểm và hiển thị bán kính lân cận mà không đòi hỏi thiết bị phải nằm trong sự cố (quy ước ở mục II).

## 7. Quản lý tài liệu

**Đã đặc tả: [`app-pages/documents.html`](app-pages/documents.html)** — miniature trang quản lý tài liệu ở giữa (5 vùng: thanh điều hướng, tiêu đề + nút tải lên, bảng tài liệu, xem trước, chân trang), hai sidebar giải thích, demo 3 trạng thái (mặc định, chưa chọn, vừa tải lên).

Tóm tắt thiết kế: nơi kỹ sư nạp tài liệu kỹ thuật, nghiệp vụ cho AI trích dẫn khi điều tra (kho tài liệu trong kiến trúc đề xuất). Bảng liệt kê tên, nguồn, loại, thời điểm cập nhật và **trạng thái lập chỉ mục** — SẴN SÀNG (AI trích dẫn được), ĐANG LẬP CHỈ MỤC, LỖI kèm lý do (tài liệu lỗi không bị AI trích dẫn để tránh dẫn chứng sai). Tải lên xong hiện băng xác nhận + dòng mới với chip "đang lập chỉ mục". Chọn một dòng → xem trước nội dung + meta nguồn + nút thay thế tệp (bản cũ giữ lại — đề xuất). Tài liệu AI trích dẫn trong Dashboard (khối wiki Inspector) phải tìm được về đây theo nguồn. Bố cục bảng + panel dùng chung pattern với Tra cứu.

## 8. Cấu hình nguồn dữ liệu

**Đã đặc tả: [`app-pages/sources.html`](app-pages/sources.html)** — miniature trang nguồn dữ liệu ở giữa (6 vùng: thanh điều hướng, tiêu đề + nút thêm nguồn, danh sách nguồn, cấu hình nguồn đang chọn, lịch sử đồng bộ, chân trang), hai sidebar giải thích, demo 4 trạng thái (mặc định, nguồn hàng đợi, lỗi đồng bộ, đang đồng bộ lại).

Tóm tắt thiết kế: trang quản trị kết nối hệ thống nguồn bên thứ ba (mô-đun tích hợp trong kiến trúc đề xuất). Danh sách nguồn hiển thị tên, kiểu kết nối (REST polling hoặc message queue) và trạng thái lần đồng bộ gần nhất ngay trên dòng — lỗi kèm lý do, không cần mở vào mới biết nguồn nào hỏng. Chọn một nguồn → panel phải đổi sang cấu hình tương ứng: địa chỉ, phương thức đồng bộ và bảng ánh xạ trường dữ liệu vào mô hình của hệ thống (trường chưa ánh xạ cảnh báo vàng). Lịch sử đồng bộ của nguồn đang chọn kèm nút "Đồng bộ lại từ đầu"; nguồn message queue nhận luồng liên tục nên không có lịch sử poll. Thay đổi chỉ có hiệu lực sau khi bấm "Lưu thay đổi". Dữ liệu chỉ đồng bộ một chiều — trang này không gửi ngược gì về hệ thống nguồn.

## 9. Cài đặt chung

**Đã đặc tả: [`app-pages/settings.html`](app-pages/settings.html)** — miniature trang cài đặt ở giữa (6 vùng: thanh điều hướng, tiêu đề, khối chủ đề, khối hiển thị mặc định, khối khôi phục mặc định, chân trang), hai sidebar giải thích, demo 4 trạng thái (mặc định, chủ đề tối, chưa lưu, đã lưu).

Tóm tắt thiết kế: nơi lưu tùy chọn giao diện toàn ứng dụng — khối chủ đề (Sáng / Tối / Theo hệ thống) áp dụng ngay mọi trang (trạng thái "Chủ đề tối" đổi màu cả miniature); khối hiển thị mặc định là bản gốc của phím chỉnh nhanh mục 4.4 trong Dashboard — 4.4 tác động phiên hiện tại, trang này là giá trị mặc định khi mở Dashboard mới, kèm tùy chọn băng hỏi tiếp tục phiên dở ở Tổng quan; nút "Khôi phục mặc định" đưa mọi tùy chọn về giá trị ban đầu. Đáp ứng tiêu chí khả năng sử dụng trong proposal: tùy chọn lưu theo tài khoản, khôi phục được về mặc định. Đề xuất chờ gật: cơ chế lưu rõ ràng với băng cảnh báo "chưa lưu".

# V. Trang không làm

- **Danh sách cảnh báo riêng**: timeline cảnh báo trong sidebar trái Dashboard (4.2) và danh sách ở Tổng quan mạng đã phủ nhu cầu; tách trang riêng chỉ khi cần lọc sâu quá mức của hai nơi trên.
- **Quản lý người dùng, phân quyền**: ngoài phạm vi proposal.
- **Trang thao tác trên thiết bị (cấu hình, khắc phục)**: hệ thống không trực tiếp cấu hình thiết bị hay thực thi lệnh trên hạ tầng — ngoài phạm vi.
- **Wiki tài liệu riêng**: tài liệu nằm ở Quản lý tài liệu; trong Dashboard chỉ có khối trích dẫn gắn với cảnh báo.
