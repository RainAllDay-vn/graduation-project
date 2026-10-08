# Danh sách vấn đề còn lại sau khi review

Tạo bởi: review độc lập bằng subagent + tự kiểm chứng thủ công.
Phạm vi: `report.md`, `mock-ui/*.html`, `mock-ui/*.png`, `mock-ui/mock-data.md`.
Nguyên tắc: phần 1/II mô tả giải pháp của đơn vị khác nên được miễn trừ; chỉ
phần III (đặc tả đầu vào/đầu ra của hệ thống mới) và các mock UI đầu ra phải
khớp với nhau.

Tổng: **5 lỗi** (đã sửa 3, còn 2) · **23 cảnh báo** · **10 gợi ý**.

---

## VI. Lỗi nặng

| Mã | Vấn đề | Trạng thái |
| --- | --- | --- |
| L1 | `images/tcp_ip_model.png` không phải mô hình TCP/IP mà là ảnh chụp ghi chú kế hoạch nội bộ | **ĐÃ SỬA** — thay bằng mermaid 4 tầng tại `report.md:185` |
| L2 | Sự cố mở `14:32:00` nhưng `ALM-2035` lúc `13:58:44` nằm trong cùng sự cố, phủ định "cảnh báo sớm nhất = R-HN-01" | **ĐÃ SỬA** — đổi thời điểm mở sự cố về `13:58:44`, chuyển thiết bị sớm nhất sang `SW-HN-02` |
| L3 | Đồ thị Hình 10 không có nút `SW-HN-02`, nhưng Hình 11 trỏ "mở tại nút SW-HN-02" | **ĐÃ SỬA** — thêm nút `SW-HN-02` + `R-HN-01` nét liền, 5 nút còn lại nét đứt + làm mờ |
| L4 | Bằng chứng *"Không có thay đổi cấu hình nào trước 14:32"* — đầu vào không định nghĩa nhật ký cấu hình, và `### b.` nói tài liệu không gồm cấu hình thiết bị | **CHƯA SỬA** — xem `05-hypothesis-wireframe.html:108` |
| L5 | `R-HN-01` có hai uptime: mock 02 ghi `142 ngày`, mock-data và wireframe ghi `11 ngày 4 giờ` | **CHƯA SỬA** — xem `02-device-detail.html:114` |

### L4 — cách sửa đề xuất
Bỏ dòng bằng chứng khỏi `05-hypothesis-wireframe.html`, hoặc đánh dấu *"chưa có
nguồn dữ liệu — cần bổ sung nhật ký cấu hình vào đầu vào"* khớp cách hộp 2 đã
làm với câu *"chưa có dữ liệu, cần thu thập"*.

### L5 — cách sửa đề xuất
Đổi `142 ngày` → `11 ngày 4 giờ` rồi chụp lại `02-device-detail.png`. Có thể bỏ qua
vì mock 02 là ảnh công cụ bên thứ ba trong phần bối cảnh — cần người viết quyết.

---

## VII. Cảnh báo còn lại

### Liên quan trực tiếp tới phần 3 và hai wireframe đầu ra — nên sửa trước

**C7 — Hình 11 không trình bày bằng chứng và phép kiểm tra *cho từng giả thuyết*.**
`report.md` (mục `### b.`) nói *"Mỗi giả thuyết hiển thị: … các bằng chứng ủng hộ
… các bằng chứng không phù hợp … phép kiểm tra đề xuất cho từng giả thuyết"*. Wireframe
gộp thành ba khối dọc cột giữa, không gắn nhãn giả thuyết; giả thuyết #2–#5 không
có bằng chứng nào; khối "bằng chứng không phù hợp" trộn #1, #4, #5.
→ Ghi nhãn giả thuyết cho từng khối, bổ sung bằng chứng/phép kiểm tra tối thiểu cho #2–#5.

**C11 — Lỗi chính tả, 4 chỗ.**
- `report.md:89` "**viêc** phân trang" → `việc`
- `report.md:204` "**Đầu vàu** cảnh báo" → `Đầu vào`
- `mock-ui/04-dashboard-wireframe.html:59` + PNG hộp 1 "router biên **tịnh**" → `tỉnh`
  (đã đổi sang switch khu vực ở lần sửa L2, cần kiểm lại ảnh PNG cũ)
- `report.md:81` và `:132` `classDef **hightlight**` → `highlight`

**C4 — "Chạy phép kiểm tra" có nguy cơ phủ định ràng buộc không thực thi.**
`report.md:241` (*"chạy phép kiểm tra **ngay tại đây**"*) và
`05-hypothesis-wireframe.html:114` (*"↗ **Chạy** tại thiết bị R-HN-01"*), trong khi
đầu vào §III.2d và `report.md:212` nói rõ *"hệ thống chỉ đưa ra gợi ý chứ không thực
thi hành động"*.
→ Đổi thành *"Xem hướng dẫn chạy tại thiết bị — kỹ sư tự thực hiện"*.

**C5 — Bằng chứng Hình 11 trỏ tới vị trí không tồn tại.**
`05-hypothesis-wireframe.html:102-104`: bằng chứng dựa trên *"Cổng WAN-01 vẫn ở
trạng thái up, không có sự kiện flap"* nhưng lại trỏ *"↗ Mở tại **khối trạng thái
thiết bị**"*. §III.3a nhóm (4) chỉ có trạng thái hoạt động / uptime / mức tải / bảng
định tuyến — không có trạng thái cổng. Trạng thái cổng thuộc thông tin trạng thái
liên kết, chưa có chỗ hiển thị nào.
→ Sửa nhãn thành "Mở tại đồ thị liên kết", hoặc bổ sung trạng thái cổng vào đặc tả nhóm (4)/(6).

**C6 — Bằng chứng Hình 11 dùng chỉ số không có trong đầu ra.**
`05-hypothesis-wireframe.html:105-107`: *"**Lưu lượng** qua cổng không vượt ngưỡng
cấu hình"* trỏ *"↗ Mở tại **biểu đồ chỉ số**"*. §III.3a nhóm (5) chỉ định nghĩa một
chỉ số (`packet-error`); Hình 10 không có trục lưu lượng.
→ Bỏ dòng này, hoặc mở rộng nhóm (5) để nhiều chỉ số.

**C12 — `report.md:204` mơ hồ về chủ thể tạo cảnh báo.**
*"khi một phép kiểm tra không đạt thì **hệ thống** tạo cảnh báo"* — ngay trước đó
cùng đoạn đã quy việc gộp/chống lặp cho *"hệ thống giám sát bên ngoài"*, nên đọc vội
sẽ hiểu là hệ thống của đồ án tự sinh cảnh báo, trái với định nghĩa cảnh báo là
*"đơn vị nhỏ nhất mà hệ thống tiếp nhận"*.
→ Ghi rõ "hệ thống giám sát bên ngoài tạo cảnh báo rồi chuyển giao".

**C13 — Nguồn của "tài liệu mã lỗi" lệch khỏi định nghĩa đã chốt.**
`report.md:204`: *"tra trong tài liệu vận hành hoặc tài liệu mã lỗi **của chính thiết
bị đó**"*; định nghĩa là *"tài liệu mã lỗi **của nhà sản xuất**"*.
→ Sửa theo định nghĩa.

**C14 — `report.md:183` và `:212` khẳng định quá mạnh.**
*"mỗi cảnh báo và **mỗi chuỗi chỉ số đều gắn với đúng một thiết bị**"* /
*"mọi dữ liệu vận hành đều gắn với một thiết bị"*. Nhưng §III.2a đã định nghĩa thông
tin trạng thái **liên kết** (tải, tỷ lệ lỗi) — dữ liệu này gắn với **hai** thiết bị
+ hai cổng.
→ Sửa thành "gắn với một thiết bị **hoặc một liên kết**".

**C16 — Đầu vào §III.2d (câu hỏi kỹ sư, hội thoại nhiều lượt) không có chỗ hiển thị ở đầu ra.**
§III.3 chỉ có `a` và `b`; Hình 10 và 11 không có khung hội thoại, chỉ có nhãn "Đối tượng".
→ Bổ sung một ô hội thoại vào Hình 11, hoặc ghi rõ câu hỏi chỉ là ngữ cảnh đầu vào
chứ không phải khối hiển thị riêng.

**C17 — Một phần đầu vào §III.2a không xuất hiện ở đầu ra.**
*Thông tin định danh liên kết* (phương tiện truyền, dung lượng tối đa) và *trạng thái
liên kết* (tải, tỷ lệ lỗi, trạng thái vận hành) không hiển thị ở đâu trong §III.3a
nhóm (6) — các cạnh chỉ có tên cổng.
→ Bổ sung vào nhóm (6), hoặc nói rõ đó là dữ liệu dùng nội bộ cho suy luận.

**C18 — Tham chiếu một dạng đầu ra chưa được định nghĩa: "dashboard của tài nguyên".**
`report.md:224`, `04-dashboard-wireframe.html` (chân hình) và
`05-hypothesis-wireframe.html:58` (*"↗ Mở dashboard của SW-HN-02"*). §III.3 chỉ
định nghĩa **2** dạng đầu ra.
→ Bổ sung là dạng thứ ba, hoặc đổi thành "mở phần định danh thiết bị ngay trên dashboard".

**C19 — Số thứ tự hộp trong Hình 10 (1–5) không khớp thứ tự 6 nhóm ở §III.3a.**
`report.md` liệt kê: (1) thông tin sự cố, (2) danh sách cảnh báo, (3) định danh
thiết bị, (4) trạng thái, (5) chỉ số, (6) đồ thị. Wireframe đánh số: 1 = định danh
thiết bị, 2 = trạng thái, 3 = chỉ số, 4 = đồ thị, 5 = danh sách cảnh báo (thông tin
sự cố chuyển lên thanh trên cùng). Người đối chiếu sẽ lệch chỉ số.
→ Đánh số lại theo §III.3a, hoặc ghi ánh xạ trong chú thích Hình 10.

**C1 — Nội dung thông báo lệch giữa `mock-data.md` và Hình 10.**
`mock-data.md` ghi `ALM-2035` = *"Nhiệt độ vượt ngưỡng"*; Hình 10 ghi *"Nhiệt độ vượt
ngưỡng **trên thiết bị đầu xa của liên kết**"* — vế suy luận do hệ thống tự thêm,
không có trong thông báo gốc. Tương tự `ALM-2038`: *"tăng cùng cửa sổ"* vs *"tăng
cùng cửa sổ **phát sinh**"*.
→ Đã sửa trong HTML; cần chụp lại PNG.

### Liên quan tới mock minh họa bối cảnh (có thể chấp nhận)

**C2 — KPI "hiện tại" của mock 03 tự mâu thuẫn với biểu đồ ngay bên dưới.**
`03-interface-metrics.html:73` ghi *"Packet-error **hiện tại**: 1.250"* trong khi
`mock-data.md` nói sau 14:40 rơi về dưới 15 và đường polyline đã hồi phục về ~10 tại
15:00. → Đổi KPI thành *"Đỉnh trong cửa sổ: 1.250"*.

**C3 — Trục thời gian của biểu đồ mock 03 lệch vùng vẽ dữ liệu.**
`03-interface-metrics.html:90-95`: polyline chạy `x=40`→`590` nhưng nhãn `14:00` đặt ở
`x=220`, `15:00` ở `x=420`. → Dời nhãn về `x=40`/`x=590` hoặc kéo polyline về đúng `[220,420]`.

**C8 — Hãng sản xuất / firmware mâu thuẫn trong cùng thiết bị `R-HN-01`.**
`mock-data.md` và Hình 10 ghi hãng `Cisco`, model `ASR-9006`, nhưng mock 02
(`02-device-detail.html:113`) ghi firmware `VRP-8.2-giả-định` — VRP là hệ điều hành
của Huawei. → Đổi sang `IOS XR`, hoặc khai rõ đây là dữ liệu công cụ bên thứ ba.

**C9 — Nhãn hướng dẫn bị cắt trong ảnh PNG mock 02.**
`02-device-detail.html:79` dùng `white-space: nowrap`; trong PNG, nhãn đỏ *"2 · Hai
thiết bị liên quan nằm ở hai nhánh khác nh..."* bị cắt ở mép phải. → Cho phép xuống
dòng rồi chụp lại.

**C10 — Mock 01 tự mâu thuẫn với chính bảng của nó.**
`01-alarm-list.html:82` đặt tiêu đề khối *"Cảnh báo **đang mở**"* nhưng dòng
`ALM-2035` (`.html:90`) có trạng thái *"Đã xác nhận"*; `mock-data.md` lại liệt kê
cột trang cảnh báo không có cột `Trạng thái`.
→ Đổi tiêu đề thành "Cảnh báo gần đây", hoặc lọc bỏ dòng đã xác nhận; bổ sung
`Trạng thái` vào danh sách cột.

**C15 — Thuật ngữ "tài liệu chẩn đoán" không thuộc 3 loại tài liệu ở §III.2b.**
Xuất hiện ở `report.md:35/67/119` (bước 4 trong Hình 2/3/7), `:138` (*"quy trình
chẩn đoán"*), `:142`. §III.2b chỉ có **đặc tả kỹ thuật / hướng dẫn vận hành /
wiki nội bộ**.
→ Đồng nhất dùng đúng 3 tên đã chốt.

**C20 — Hình thiếu nhãn loại / nguồn / chú giải.**
Cả 11 chú thích hình chỉ có số + tiêu đề; không hình nào có nhãn *ảnh chụp thật /
từ nguồn công khai / sơ đồ tự vẽ / wireframe mô phỏng*. Riêng Hình 4–6 là mock-UI
của công cụ bên thứ ba, dễ bị hiểu là ảnh sản phẩm thật. Hình 8 dùng nét đứt màu
xám cho node *Tài liệu kỹ thuật* nhưng **không có chú giải**, và ngữ nghĩa `planned`
không được giải thích.
→ Bổ sung nhãn loại hình, dòng nguồn, chú giải Hình 8.

**C22 — `report.md` không tham chiếu `mock-ui/mock-data.md` hay 5 file HTML nguồn.**
7 ảnh PNG được tham chiếu, còn `mock-data.md` và toàn bộ `.html` không được liên kết
ở đâu — người đọc không truy được tới tuyên bố "dữ liệu giả".
→ Thêm một câu ở đầu hoặc cuối phần III trỏ tới `mock-data.md`.

**C23 — Nội dung phần I và II của tuần 3 trùng nguyên văn tuần 2.**
`week02/report.md:1-148` giống `week03/report.md:1-148` từng dòng, dùng chung bộ
`mock-ui/`. File giống `images/tcp_ip_model.png` (nguồn của L1) cũng nằm ở
`week02/images/` và `week02/outputs/images/`.
Hệ quả: `week02/report.md` vẫn dùng `Major`, `địa chỉ quản lý`, `cây phân cấp quản
lý` và gọi *"Dashboard cảnh báo động"* trong khi trỏ tới đúng ảnh Hình 10 nay đã đổi
sang `warning`/`error` và *dashboard sự cố*.
→ Xác nhận thứ tự nộp với giảng viên; nếu nộp cả hai tuần thì phải tách lại ảnh đầu ra.

---

## VIII. Gợi ý

- **G1** — Hình 2, 3 và 7 (`report.md:30-48`, `:62-83`, `:113-134`) là cùng một khối mermaid 8 node, chỉ khác ở `class ... hightlight`. Ba hình gần như trùng nhau. → Cân nhắc gộp thành một hình có chú giải nhấn mạnh từng bước.
- **G2** — `report.md:224` và `04-dashboard-wireframe.html` dùng *"nút lá"* (leaf node) cho đồ thị không có phân cấp. → Đổi thành "nút thiết bị đầu xa".
- **G3** — `report.md:218` viết *"xếp cạnh nhau theo mốc thời gian"*; `04-dashboard-wireframe.html:124` đã dùng cách rõ hơn là *"theo trục thời gian"*. → Thống nhất.
- **G4** — `05-hypothesis-wireframe.html:65-68` đưa giả thuyết **đã bị loại** vào danh sách "xếp hạng", làm mờ logic thứ hạng. → Tách sang mục riêng "giả thuyết đã loại trừ".
- **G5** — Trộn Việt/Anh trong mock: `01:97` *"Lịch sử cảnh báo (past alarms)"*, `02:108` tab *"Cổng / Interface"*, `03:67` placeholder *"Tìm thiết bị, cổng, chỉ số… (minh hoạ)"*. → Thống nhất tiếng Việt.
- **G6** — `03:82` `aria-label="Bieu do packet-error minh hoa"` thiếu dấu tiếng Việt; nội dung này đọc bằng trình đọc màn hình nên lỗi dấu ảnh hưởng assistive technology. → Sửa thành `Biểu đồ packet-error minh họa`.
- **G7** — `03:73,87-89,103-105` trộn định dạng số: `1.250` ở KPI/bảng nhưng trục tung vẽ nhãn `1250`. → Thống nhất.
- **G8** — `05:34` và PNG thanh trên cùng ghi *"Đối tượng R-HN-01 · cổng WAN-01"*; cảnh báo gắn một thiết bị và không gắn cổng. → Tách `Đối tượng R-HN-01` + `Tập trung cổng WAN-01`.
- **G9** — `report.md:1-6` đặt `<style>` ghi đè màu code bằng `!important`, kế thừa từ tuần 2. → Thay bằng cấu hình theme của trình render.
- **G10** — `report.md:162` `VIEW["Dashboard sự cố<br/> kèm ngữ cảnh đầy đủ"]` thừa khoảng trắng sau `<br/>`. → Dọn khi chỉnh Hình 8.

---

## IX. Trạng thái việc dở dang

- **Cần chụp lại ảnh.** `04-dashboard-wireframe.html` đã sửa nội dung (L2, L3, C1,
  C11) nhưng `04-dashboard-wireframe.png` **vẫn là bản cũ**. Phải chụp lại trước khi
  nộp.
- **`02-device-detail.png`** cần chụp lại nếu sửa L5 hoặc C9.
- **Mục "Giới hạn và phạm vi đánh giá"** chưa có trong báo cáo — mục lục
  `report.md:11-18` chỉ có I–III, dừng ở Hình 11. Nếu kế hoạch dự án yêu cầu mục này
  thì còn thiếu.