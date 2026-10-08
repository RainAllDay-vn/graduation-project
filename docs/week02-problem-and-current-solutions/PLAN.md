# Kế hoạch báo cáo tuần 2 — Bài toán và giải pháp hiện tại

## 1. Đích của báo cáo

Trả lời trực tiếp bốn câu hỏi: **kỹ sư gặp khó khăn gì khi điều tra sự cố mạng; họ đang dùng những công cụ/góc nhìn nào; đầu vào của hệ thống đề xuất lấy từ đâu, thuộc loại dữ liệu nào và lớn đến mức nào; hệ thống trả ra kết quả gì để kỹ sư hành động?**

Ưu tiên hai phần **Bối cảnh** và **Giải pháp hiện tại và vấn đề** ở đầu báo cáo vì đây là hai phần thầy đã đọc trong đề xuất tuần 1. Kèm hình/diagram tự giải thích được thay cho các đoạn mô tả dài; ngay sau đó là phần **Định nghĩa bài toán — đầu vào/đầu ra**. Giữ ranh giới: hệ thống **hỗ trợ** điều tra, không tự quyết định nguyên nhân cuối cùng hoặc thao tác khắc phục trên mạng.

Tài liệu gốc để đối chiếu: [`../week01-proposal/proposal.md`](../week01-proposal/proposal.md), [`../week01-proposal/user-survey.md`](../week01-proposal/user-survey.md), [`../week01-proposal/possible-datasets.md`](../week01-proposal/possible-datasets.md). Không chuyển nguyên văn toàn bộ kiến trúc và danh sách công nghệ của tuần 1 sang hai phần mở đầu.

## 2. Dàn ý và minh họa cần chuẩn bị

| Thứ tự | Nội dung cần viết | Hình/diagram và thông điệp bắt buộc |
| --- | --- | --- |
| 1. Bối cảnh | Một tình huống xuyên suốt: cảnh báo lỗi liên kết/thiết bị → nhiều cảnh báo liên đới → kỹ sư truy dấu thành phần và dịch vụ bị ảnh hưởng. Nêu rõ đây là **tình huống minh họa**, chưa phải nhật ký sự cố thật nếu chưa có bằng chứng. | **Hình 1: chuỗi phụ thuộc** thiết bị/liên kết → máy chủ → dịch vụ, tô đỏ điểm lỗi và tô màu vùng ảnh hưởng; chú thích quan hệ là ví dụ hay được chứng thực từ dữ liệu. **Hình 2: hành trình điều tra** nhận cảnh báo → mở trạng thái → tra topology → kiểm tra metric/tài liệu → đưa ra giả thuyết và kiểm chứng, chỉ ra bước nào cần đổi màn hình. Giảm phần chữ hiện tại thành vài câu giải thích ý nghĩa hai hình. |
| 2. Giải pháp hiện tại và vấn đề | Mô tả theo **loại góc nhìn**, không khẳng định mọi sản phẩm đều có cùng hạn chế: quản lý tài nguyên theo phân cấp; dashboard trạng thái/KPI; danh sách cảnh báo. Theo tình huống trên, cho thấy kỹ sư tìm thấy gì và thiếu gì ở từng bước. Đối chiếu với ví dụ công khai đã ghi trong `user-survey.md`; nếu dùng tên/giao diện sản phẩm cụ thể phải kiểm tra nguồn và phiên bản. | **Hình 3: hai cách nhìn cùng một sự cố**: cây khu vực → nhóm → thiết bị (dễ tra cứu) cạnh đồ thị phụ thuộc xuyên lớp (dễ nhìn thành phần liên quan); ghi rõ hình do nhóm tự vẽ, không phải ảnh sản phẩm. **Hình 4: chuỗi 2–3 màn hình minh họa** danh sách alarm → chi tiết tài nguyên → chỉ số theo thời gian, với các mũi tên thao tác đối chiếu thủ công. Nếu có quyền sử dụng ảnh chụp từ công cụ thực, dùng ảnh đã che thông tin nhạy cảm, ghi tên công cụ, nguồn/ngày và chú thích; nếu không thì dùng wireframe tự vẽ, gắn nhãn “mô phỏng”. Kết mỗi hình bằng một câu về giới hạn cụ thể, tránh tuyên bố “công cụ hiện tại không hỗ trợ” khi chưa có chứng cứ. |
| 3. Định nghĩa bài toán | Một phát biểu ngắn: từ **cảnh báo hoặc câu hỏi điều tra**, kết hợp trạng thái, metric, topology/quan hệ phụ thuộc và tài liệu trong phạm vi đã chọn để hỗ trợ khoanh vùng, đánh giá ảnh hưởng và đề xuất bước kiểm tra. Ghi điều kiện cần: cùng định danh thiết bị và mốc thời gian, có quan hệ đủ để truy dấu. | **Hình 5: sơ đồ ranh giới I/O**: các nguồn dữ liệu + yêu cầu của kỹ sư → module hỗ trợ điều tra → các đầu ra có liên kết ngược về bằng chứng; phân biệt dữ liệu sẵn có và dữ liệu còn dự kiến. |
| 4. Đầu vào, nguồn và chất lượng | Một bảng kiểm kê theo từng loại dữ liệu (mẫu ở mục 3 bên dưới), kèm con số **đã đo được**, giới hạn và cách suy ra quy mô. Chốt **một kịch bản dữ liệu chính** để mô tả/đánh giá; các dataset khác chỉ là phương án bổ sung. | Bảng nguồn dữ liệu + một sơ đồ mapping `source ID → canonical device ID → timestamp → quan hệ/cảnh báo/metric`. |
| 5. Đầu ra và ví dụ end-to-end | Phân biệt đầu ra **quan sát/truy xuất** và đầu ra **suy luận/gợi ý AI**; thể hiện trường hợp thiếu dữ liệu. Dùng cùng tình huống ở mục 1 để người đọc đối chiếu được từng đầu ra với đầu vào. | Một thẻ kết quả minh họa: sự cố/tài nguyên, thành phần liên quan, phạm vi ảnh hưởng **có căn cứ**, giả thuyết (chưa phải kết luận), ưu tiên, bước kiểm tra tiếp theo, nguồn bằng chứng và thời điểm dữ liệu, nhãn “không đủ dữ liệu” nếu phù hợp. |
| 6. Giới hạn và phạm vi đánh giá | Tóm tắt phạm vi loại thiết bị/sự cố có dữ liệu; nêu những quan hệ, nhãn sự cố, tài liệu hoặc số liệu thực tế còn thiếu. Không biến mục tiêu 3.000 thiết bị thành kết quả đã thử nghiệm. | Bảng nhỏ “đã có / tự tạo / cần xác minh”, không thêm sơ đồ kiến trúc dài. |

### Quy tắc cho hình

- Mỗi hình có số, tiêu đề nêu thông điệp, chú giải màu/ký hiệu, nguồn và nhãn **ảnh chụp thật / từ nguồn công khai / sơ đồ tự vẽ / wireframe mô phỏng**. Không dùng hình lấy trên mạng mà không có nguồn hoặc hình demo làm bằng chứng cho tính năng có thật.
- Dùng Mermaid cho luồng và quan hệ; xuất SVG/PNG khi đóng gói PDF và rà lại chữ có đọc được ở kích thước trang. Có thể tham khảo cách xuất trong [`../export_mermaid_diagrams.py`](../export_mermaid_diagrams.py) nhưng script hiện cần cấu hình đường dẫn và đặt tên đầu ra theo `proposal-diagrams`; điều chỉnh khi thực sự xuất hình tuần 2.
- Đặt ảnh nguồn trong `images/`, Mermaid gần nội dung báo cáo; hạn chế nhiều hơn một thông điệp chính trong một hình. Kiểm tra đường dẫn ảnh khi xem Markdown và bản PDF.

## 3. Chốt đầu vào: nguồn, tính xác thực, quy mô

**Việc đầu tiên trước khi viết khẳng định về dữ liệu:** chọn bối cảnh thử nghiệm (ví dụ một site với hạ tầng server/switch/storage và quan hệ phụ thuộc), 1–2 nhóm sự cố có bằng chứng (ví dụ lỗi liên kết, suy giảm hiệu năng), rồi điền bảng bên dưới bằng số kiểm đếm được. Không mặc định rằng có đầy đủ chuỗi dịch vụ/5G nếu nguồn chỉ chứa hạ tầng hoặc network L3.

| Loại đầu vào cần chứng minh | Nguồn ứng viên / nơi kiểm tra | Phân loại và điểm cần xác minh | Số lượng cần thống kê |
| --- | --- | --- | --- |
| Inventory/topology và quan hệ | [`../../../infrahub/mock_data/infrastructure.yml`](../../../infrahub/mock_data/infrastructure.yml) và schema ở `infrahub/schemas/`; nếu dùng nguồn khác, ghi URL/đường truy cập và phiên bản | Fixture cục bộ được đặt trong `mock_data`: **dữ liệu mẫu**, không chứng minh đó là inventory production dù tên/giá trị có vẻ thực. Kiểm tra quan hệ thực sự có trong file, độ đầy đủ của các cạnh và khả năng nối ID giữa các loại đối tượng. | Đếm node theo loại (site/rack/server/switch/OSD/pod...), cạnh theo loại, số site, tỷ lệ tham chiếu hợp lệ; ghi ngày/commit kiểm đếm. |
| Trạng thái, chỉ số hiệu năng theo thời gian | Nguồn API/fixture thực sự truy cập được; ứng viên tham khảo [`../week01-proposal/possible-datasets.md`](../week01-proposal/possible-datasets.md) (GNNet2021: mô phỏng mạng L3; GNNet2023: testbed) | Chỉ đưa vào kịch bản chính sau khi kiểm tra tải được, trường dữ liệu, timestamps, thiết bị nào nối được với topology chính. GNNet2021 là **simulation**, không phải dữ liệu vận hành thực tế hay nhật ký sự cố 5G. | Số thiết bị có metric, số metric/thiết bị, tần suất lấy mẫu, thời gian bao phủ, số bản ghi/ngày; phân biệt số đo thật với phép ngoại suy. |
| Cảnh báo/sự kiện và nhãn sự cố | Dataset Cisco IE Telemetry trong [`possible-datasets.md`](../week01-proposal/possible-datasets.md) hoặc nguồn có quyền truy cập thực tế; nguồn tự tạo nếu không ghép được dataset ngoài | Cisco có sự kiện gắn thời gian và topology nhưng gồm testbed/VIRL; kiểm tra từng case, phân biệt dữ liệu đo testbed với mô phỏng VIRL. **Không** coi case Cisco tự động nối được vào ID của fixture Infrahub; nếu ghép/inject sự cố, mô tả quy tắc tạo và đánh nhãn synthetic. | Số case, loại sự cố, số sự kiện/alarm, tỷ lệ có nhãn, khoảng thời gian; đếm số record ghép được vào topology (số ghép được / tổng số). |
| Tài liệu kỹ thuật/quy trình | Tài liệu được phép sử dụng, đường dẫn/phiên bản hoặc tài liệu tự soạn | Phân biệt tài liệu có nguồn và kịch bản hướng dẫn tự viết; ghi quyền sử dụng và mốc cập nhật. Nếu chưa có thì ghi “chưa có”, không mô tả AI như đã có căn cứ tài liệu. | Số tài liệu, trang/đoạn có thể truy xuất, mức độ bao phủ nhóm sự cố đã chọn. |
| Yêu cầu của kỹ sư | Một alert được chọn hoặc câu hỏi bằng ngôn ngữ tự nhiên | Đây là thao tác người dùng; ví dụ hội thoại phải ghi “ví dụ minh họa”. | Số kịch bản/câu hỏi thử nghiệm, số trường bắt buộc (ID, thời gian, phạm vi). |

**Cách xác minh dữ liệu (ghi kết quả vào phụ lục kiểm kê khi viết báo cáo):**

1. Lấy mẫu và thống kê từ **file/bản tải thật**, lưu URL, phiên bản, ngày truy cập, định dạng, license/quyền dùng; đếm bằng script/truy vấn có thể chạy lại, không đếm theo cảm quan từ README. Nếu chưa tải/chưa được cấp quyền, ghi “ứng viên, chưa xác minh”, không điền số ước lượng như số thực đo.
2. Kiểm tra chất lượng: khóa định danh trùng/thiếu; timestamp và múi giờ; độ phủ và tuổi của topology; cạnh mồ côi; missing values; nhãn lỗi và cân bằng loại sự cố; sự đồng bộ giữa topology, metric và alarm. Nêu rõ **dữ liệu production / dữ liệu testbed thật / mô phỏng từ simulator / mock fixture / tự sinh** cho từng tập, không gọi chung là “data thật”.
3. So sánh quy mô theo **cùng đơn vị và phạm vi**: số thiết bị, site, liên kết, chu kỳ lấy mẫu, metric và alarm/ngày. Mốc `≥3.000 thiết bị` ở đề xuất tuần 1 là **mục tiêu hiệu năng** dựa trên [trường hợp HPT SmartNOC giám sát hơn 3.000 thiết bị Unifi](https://www.hpt.vn/tin-tuc/smartnoc-giam-sat-hoat-dong-cua-hon-3000-thiet-bi-unifi-wifi/2046); đây không phải quy mô điển hình của một kỹ sư và không trực tiếp đại diện cho mạng đa lớp server/switch/5G. Đặt số của tập dữ liệu thử nghiệm cạnh mốc này và ghi chênh lệch/khác biệt về loại thiết bị. Không có cơ sở để khẳng định “gần quy mô thực tế” chỉ từ một mốc này.
4. Nếu tạo dữ liệu tải/telemetry tổng hợp, công bố **công thức, seed, phân phối và giả định**. Ví dụ `số thiết bị × số metric/thiết bị × số mẫu/ngày` chỉ là **phép tính kịch bản**, không phải số đo production. Ghi riêng số có thật trong dataset và số tự sinh để stress-test.
5. Nếu các nguồn không thể nối khóa/thời gian, **thu hẹp kịch bản** về một nguồn nhất quán hoặc nêu rõ tầng nào là fixture/synthetic. Không mô tả kết quả suy luận xuyên lớp là được kiểm chứng bằng dữ liệu thật khi quan hệ xuyên lớp do nhóm dựng.

**Quyết định cần có trước bản nháp:** ghi một câu nêu dataset chính, loại dữ liệu, lớp mạng, độ phủ và loại sự cố hỗ trợ; kèm bảng số lượng đã kiểm kê. Nếu chưa chốt được dataset thật, chọn kịch bản demo dựa trên mock + sự cố tự dựng, gắn nhãn rõ và tách kế hoạch đánh giá trên dữ liệu công khai ở bước sau.

## 4. Đầu ra cần mô tả bằng hợp đồng dễ kiểm tra

| Đầu ra cho kỹ sư | Trường tối thiểu trong ví dụ báo cáo | Căn cứ/ranh giới |
| --- | --- | --- |
| Góc nhìn theo dõi | Tài nguyên, loại, trạng thái, timestamp, liên kết/quan hệ liên quan | Dẫn về bản ghi topology/trạng thái; không vẽ cạnh không có trong nguồn mà không ghi “minh họa”. |
| Ngữ cảnh của cảnh báo | Mã cảnh báo, nguồn, thời điểm, mức nghiêm trọng, các metric và cảnh báo liên quan | Chỉ nói “có liên quan/cần kiểm tra”, không tự suy ra chung nguyên nhân từ việc cùng thời điểm. |
| Phạm vi ảnh hưởng | Danh sách thiết bị/dịch vụ phụ thuộc tìm được, mức độ chắc chắn và quan hệ truy vết | Nếu thiếu mapping tới dịch vụ, ghi “chưa xác định ảnh hưởng tới dịch vụ/khách hàng”. |
| Hỗ trợ điều tra | Giả thuyết nguyên nhân, mức ưu tiên, bước kiểm tra tiếp, bằng chứng trích dẫn (ID/URL bản ghi, timestamp, đoạn tài liệu) | Phân biệt giả thuyết với nguyên nhân đã xác minh; nêu thiếu dữ liệu/mâu thuẫn. Kỹ sư xác minh và quyết định hành động. |

Tạo **một ví dụ xuyên suốt** nối alert + thời điểm + thành phần trong topology + biến động metric + câu hỏi của kỹ sư → thẻ kết quả; dùng nhãn “ví dụ giả lập” với mọi số liệu chưa lấy từ dataset. Đối chiếu mỗi trường đầu ra với nguồn đầu vào; trường không có nguồn thì bỏ hoặc đánh dấu chưa xác định.

## 5. Trình tự thực hiện và điều kiện hoàn thành

- [ ] **Bước 1 — Chốt trường hợp và bằng chứng:** chọn loại sự cố/phạm vi thiết bị, thu 1–2 ví dụ công khai về vận hành/góc nhìn hiện tại từ `user-survey.md` (kiểm tra lại nguồn gốc); xác định có ảnh thật được phép dùng hay sẽ vẽ wireframe.
- [ ] **Bước 2 — Kiểm kê nguồn:** thử truy cập tập dữ liệu chính; đếm bản ghi/đối tượng; điền bảng nguồn–chất lượng–quy mô và báo cáo chênh lệch với mốc quy mô công khai. Ghi lại thứ gì chưa xác minh, chọn kịch bản fallback trung thực nếu thiếu alarm/metric/quan hệ.
- [ ] **Bước 3 — Phác thảo hình trước:** vẽ chuỗi phụ thuộc, hành trình điều tra, đối chiếu cây/đồ thị, các màn hình hiện tại, sơ đồ I/O; thống nhất tên thiết bị và sự cố xuyên các hình. Chú thích nguồn và loại hình ngay khi tạo.
- [ ] **Bước 4 — Viết bản thảo:** lưu `report.md` tại thư mục này; viết ngắn hai phần đầu dựa vào hình, sau đó định nghĩa bài toán, bảng đầu vào, ví dụ đầu ra và giới hạn. Tạo `images/` khi thực sự có hình; không để link ảnh trỏ tới file chưa tồn tại trong bản báo cáo.
- [ ] **Bước 5 — Rà soát như người phản biện:** chỉ đọc từ đầu đến hết phần giải pháp hiện tại xem có hiểu vấn đề qua hình không; kiểm tra từng con số có đơn vị/nguồn/cách đếm, từng tuyên bố “thật” có chứng cứ, mỗi gợi ý đầu ra có bằng chứng hoặc nhãn chưa xác định; xem bản Markdown và PDF để chắc hình rõ/chú thích đầy đủ.

**Hoàn thành khi:** người đọc chỉ cần vài phần đầu có thể mô tả được một sự cố, luồng làm việc hiện tại và giới hạn của nó; trả lời được “dữ liệu lấy ở đâu, thực hay giả, bao nhiêu, so với thực tế ra sao”; và nêu được đầu ra cụ thể cùng bằng chứng đầu vào tương ứng.
