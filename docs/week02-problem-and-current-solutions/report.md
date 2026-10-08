<style>
  :not(pre) > code {
    color: #000000 !important;
    background-color: transparent !important;
  }
</style>
# BÁO CÁO ĐỊNH NGHĨA BÀI TOÁN

# Mục lục

- [I. Bối cảnh](#i-bối-cảnh)
- [II. Giải pháp hiện tại và vấn đề](#ii-giải-pháp-hiện-tại-và-vấn-đề)
  - [1. Sử dụng cảnh báo để thu thập thông tin vận hành của các thiết bị liên quan](#1-sử-dụng-cảnh-báo-để-thu-thập-thông-tin-vận-hành-của-các-thiết-bị-liên-quan)
  - [2. Từ dữ liệu vận hành để đưa ra các giả thuyết cho nguyên nhân](#2-từ-dữ-liệu-vận-hành-để-đưa-ra-các-giả-thuyết-cho-nguyên-nhân)
- [III. Định nghĩa bài toán](#iii-định-nghĩa-bài-toán)
  - [1. Phát biểu bài toán](#1-phát-biểu-bài-toán)
  - [2. Đầu vào](#2-đầu-vào)
  - [3. Đầu ra](#3-đầu-ra)

# I. Bối cảnh

Một dịch vụ viễn thông hoạt động nhờ nhiều thành phần phối hợp: thiết bị mạng và đường truyền kết nối đến máy chủ, nơi các ứng dụng hoặc chức năng mạng vận hành. Các thành phần này có quan hệ phụ thuộc; bất thường ở một điểm có thể ảnh hưởng đến những thành phần phía sau nó. Vì vậy, kỹ sư vận hành không chỉ cần biết thiết bị nào đang báo lỗi mà còn cần biết lỗi đó liên quan đến dịch vụ nào.

![](./images/network_layers.png)

*Hình 1. Các lớp thành phần tạo nên dịch vụ viễn thông.*

Khi có cảnh báo về liên kết hoặc phản ánh dịch vụ suy giảm, kỹ sư cần xác định thành phần phát sinh bất thường, xem trạng thái các thành phần liên quan và kiểm tra chỉ số tại thời điểm xảy ra sự cố. Từ đó, họ khoanh vùng nguyên nhân có thể xảy ra, đánh giá phạm vi ảnh hưởng, quyết định bước kiểm tra hoặc xử lý và theo dõi dịch vụ sau khi khôi phục. Một cảnh báo ban đầu chỉ là **điểm khởi đầu điều tra**, chưa đủ để kết luận nguyên nhân.

```mermaid
flowchart TB
    ALERT["1. Nhận cảnh báo"]
    LOCATE["2. Xác định thiết bị<br/>liên quan"]
    PATCH["3. Xử lý tạm thời<br/>để giảm ảnh hưởng"]
    CHECK["4. Đối chiếu trạng thái, chỉ số<br/>với tài liệu chẩn đoán"]
    ASSESS["5. Đề xuất giả thuyết<br/>về nguyên nhân"]
    VERIFY["6. Kiểm chứng giả thuyết<br/>và xác định nguyên nhân"]
    ACT["7. Áp dụng biện pháp<br/>xử lý lâu dài"]
    RECORD["8. Ghi biên bản<br/>sự cố"]

    ALERT --> LOCATE
    LOCATE --> CHECK
    LOCATE --> PATCH
    CHECK --> ASSESS
    ASSESS --> VERIFY
    VERIFY --> ACT
    VERIFY --> RECORD
```

*Hình 2. Luồng điều tra và khắc phục sự cố của các kỹ sư vận hành mạng.*

Khó khăn là những thông tin ấy thường được tổ chức ở các nguồn hoặc góc nhìn khác nhau. Kỹ sư phải đối chiếu cảnh báo xảy ra khi nào, thành phần nào có quan hệ với điểm lỗi và chỉ số nào thay đổi cùng thời điểm. Nếu thiếu quan hệ phụ thuộc hoặc dữ liệu không khớp định danh, thời gian, việc liên hệ một bất thường ở thiết bị với ảnh hưởng tới dịch vụ càng khó khăn. Bước điều tra tiếp theo vì thế phụ thuộc nhiều vào việc kỹ sư tự tổng hợp bối cảnh và kiểm chứng các giả thuyết.

Khi không thể nhanh chóng ghép các thông tin trên thành một bức tranh nhất quán, việc khoanh vùng, đánh giá ảnh hưởng và lựa chọn hướng xử lý có thể bị chậm trễ, kéo dài thời gian gián đoạn dịch vụ. Đây là bối cảnh của bài toán hỗ trợ điều tra sự cố được trình bày ở các phần tiếp theo.

# II. Giải pháp hiện tại và vấn đề

Hiện nay, nhiều doanh nghiệp viễn thông sử dụng các nền tảng chuyên dụng để quản lý thông tin tài nguyên mạng, thu thập dữ liệu trạng thái và hiệu năng, cũng như tiếp nhận cảnh báo từ thiết bị. Các công cụ này cung cấp những thông tin cần thiết cho việc xử lý sự cố. Tuy nhiên, khi điều tra một cảnh báo cụ thể, kỹ sư vẫn gặp phải hai khó khăn chính trong quy trình xử lý sự cố.

## 1. Sử dụng cảnh báo để thu thập thông tin vận hành của các thiết bị liên quan

```mermaid
flowchart TB
    ALERT["1. Nhận cảnh báo"]
    LOCATE["2. Xác định thiết bị<br/>liên quan"]
    PATCH["3. Xử lý tạm thời<br/>để giảm ảnh hưởng"]
    CHECK["4. Đối chiếu trạng thái, chỉ số<br/>với tài liệu chẩn đoán"]
    ASSESS["5. Đề xuất giả thuyết<br/>về nguyên nhân"]
    VERIFY["6. Kiểm chứng giả thuyết<br/>và xác định nguyên nhân"]
    ACT["7. Áp dụng biện pháp<br/>xử lý lâu dài"]
    RECORD["8. Ghi biên bản<br/>sự cố"]

    ALERT --> LOCATE
    LOCATE --> CHECK
    LOCATE --> PATCH
    CHECK --> ASSESS
    ASSESS --> VERIFY
    VERIFY --> ACT
    VERIFY --> RECORD

    classDef hightlight fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F;
    class ALERT,LOCATE hightlight;
```

*Hình 3. Việc sử dụng cảnh báo để thu thập thông tin vận hành của các thiết bị là bước 1 và 2 của quy trình khắc phục sự cố.*

Giao diện vận hành của doanh nghiệp thường được tổ chức theo chức năng quản lý: trang cảnh báo hiển thị các sự kiện kèm thông tin cơ bản như loại cảnh báo, thời điểm, nguồn phát và mức độ nghiêm trọng; trang thiết bị hỗ trợ tra cứu thông tin tài nguyên; trang giám sát cung cấp trạng thái và chỉ số vận hành. Như vậy, dữ liệu cần thiết cho bước điều tra ban đầu đã tồn tại, nhưng nằm ở các màn hình khác nhau; khi xử lý một cảnh báo cụ thể, kỹ sư phải tự kết nối chúng lại với nhau.

Bên cạnh đó, viêc phân trang theo tài nguyên quản lý khiến cho mô hình quản lý phân cấp trở nên rất phổ biến. Giao diện phân cấp theo khu vực, nhóm tài nguyên và thiết bị giúp xác định vị trí của một đối tượng trong phạm vi quản lý một cách nhanh chóng. Tuy nhiên, việc chuẩn đoán sự cố thường dựa trên các thành phần có quan hệ với nhau. Các thành phần đó có thể nằm ở những nhánh hoặc lớp khác nhau. Do dó, chỉ nhìn theo cấu trúc phân cấp sẽ khó lần theo quan hệ giữa chúng một cách trực quan. Kỹ sư vì thế có thể phải mở lần lượt nhiều nhánh để tự ghép bối cảnh của sự cố.

Ví dụ một tình huống sau: router `R-HN-01` phát sinh packet-error tăng đột biến trên cổng `WAN-01` lúc 14:32, kỹ sư cần tìm hiểu lý do. Bắt đầu ở trang cảnh báo, kỹ sư nhận thấy cảnh báo `ALM-2041` trên `R-HN-01` lúc 14:32 — nhưng chỉ gồm thông tin cơ bản và không kèm ngữ cảnh về đầu xa liên kết hay các thiết bị liên quan. Kỹ sư phải lấy mã thiết bị từ cảnh báo để tiếp tục tra cứu ở các trang khác.

![](./mock-ui/01-alarm-list.png)

*Hình 4. Trang cảnh báo: dòng `ALM-2041` cho biết thiết bị, thời điểm và mức độ, nhưng không cho biết liên kết gặp sự cố nối tới đâu hay cần kiểm tra thêm thành phần nào.*

Sang trang thiết bị, kỹ sư tìm được `R-HN-01` theo cây phân cấp khu vực — nhóm — thiết bị. Tuy nhiên, đầu xa của liên kết là switch `SW-HN-02` lại nằm ở một nhánh khác, còn bảng cổng của `R-HN-01` không hiển thị thông tin đầu xa. Kỹ sư vì thế phải mở lần lượt nhiều nhánh mới ghép được quan hệ giữa các thành phần.

![](./mock-ui/02-device-detail.png)

*Hình 5. Trang thiết bị: hai thiết bị có liên kết trực tiếp nằm ở hai nhánh phân cấp khác nhau; cột thiết bị đầu xa để trống nên quan hệ liên kết không thể hiện trực quan.*

Cuối cùng, để xem diễn biến packet-error, kỹ sư phải sang trang giám sát và tự nhập mã thiết bị, chọn cổng `WAN-01` cùng khoảng thời gian 14:00–15:00. Biểu đồ cho thấy đỉnh bất thường trùng với thời điểm cảnh báo, nhưng việc đối chiếu này do kỹ sư thực hiện thủ công; trang giám sát cũng không tự gợi ý cổng đối tác cần kiểm tra thêm.

![](./mock-ui/03-interface-metrics.png)

*Hình 6. Trang giám sát: đỉnh packet-error trùng thời điểm cảnh báo, nhưng kỹ sư phải tự chọn thiết bị, cổng, khoảng thời gian và tự đối chiếu với cảnh báo `ALM-2041`.*

Như vậy, trong cùng một tình huống, kỹ sư phải chuyển qua ba trang để thu thập đủ thông tin do thông tin rời rạc, không tập trung. Ngay cả khi đã tìm đúng thiết bị, quan hệ với các thành phần liên quan vẫn khó quan sát dưới góc nhìn phân cấp. Sau khi có trạng thái và chỉ số của các thành phần, bước tiếp theo là đối chiếu chúng để hình thành giả thuyết về nguyên nhân.

## 2. Từ dữ liệu vận hành để đưa ra các giả thuyết cho nguyên nhân

```mermaid
flowchart TB
    ALERT["1. Nhận cảnh báo"]
    LOCATE["2. Xác định thiết bị<br/>liên quan"]
    PATCH["3. Xử lý tạm thời<br/>để giảm ảnh hưởng"]
    CHECK["4. Đối chiếu trạng thái, chỉ số<br/>với tài liệu chẩn đoán"]
    ASSESS["5. Đề xuất giả thuyết<br/>về nguyên nhân"]
    VERIFY["6. Kiểm chứng giả thuyết<br/>và xác định nguyên nhân"]
    ACT["7. Áp dụng biện pháp<br/>xử lý lâu dài"]
    RECORD["8. Ghi biên bản<br/>sự cố"]

    ALERT --> LOCATE
    LOCATE --> CHECK
    LOCATE --> PATCH
    CHECK --> ASSESS
    ASSESS --> VERIFY
    VERIFY --> ACT
    VERIFY --> RECORD

    classDef hightlight fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F;
    class CHECK,ASSESS hightlight;
```

*Hình 7. Việc sử dụng dữ liệu vận hành kết hợp với tài liệu chuẩn đoán là bước 4 và 5 của quy trình khắc phục sự cố.*

Sau khi xác định được thành phần cần kiểm tra, kỹ sư có thể xem trạng thái, chỉ số hiệu năng theo thời gian và những cảnh báo liên quan trên các công cụ giám sát. Tài liệu kỹ thuật hoặc quy trình chẩn đoán cung cấp thêm thông tin để nhận diện dấu hiệu và lựa chọn phép kiểm tra phù hợp. Những nguồn này giúp kỹ sư hình thành giả thuyết trước khi kiểm chứng nguyên nhân ở bước tiếp theo.

Khó khăn xuất hiện khi cần đối chiếu nhiều loại thông tin: chỉ số nào thay đổi trước hoặc sau cảnh báo, các thành phần liên quan có biểu hiện tương tự không, và dấu hiệu đó phù hợp với trường hợp nào trong tài liệu. Khi dữ liệu và tài liệu chưa được trình bày cùng một ngữ cảnh điều tra, kỹ sư phải tự tìm kiếm, so sánh và tổng hợp bằng chứng. Công việc này có thể mất thời gian và phụ thuộc vào kinh nghiệm của kỹ sư mạng.

Như vậy, giải pháp hiện tại đã cung cấp cảnh báo, thông tin tài nguyên, dữ liệu giám sát và tài liệu chẩn đoán, nhưng việc liên kết chúng theo thiết bị, quan hệ phụ thuộc và thời điểm trong một tình huống sự cố vẫn đòi hỏi nhiều thao tác của kỹ sư. Đây là khoảng trống mà bài toán hỗ trợ điều tra hướng tới.

# III. Định nghĩa bài toán

## 1. Phát biểu bài toán

Bài toán được đặt ra nhằm hỗ trợ kỹ sư điều tra sự cố mạng. Từ một cảnh báo hoặc một câu hỏi điều tra của kỹ sư, hệ thống tổng hợp dữ liệu vận hành, thông tin quan hệ giữa các thành phần và tài liệu kỹ thuật hoặc nghiệp vụ liên quan trong phạm vi đã chọn, để hỗ trợ đưa ra các giả thuyết về nguyên nhân và đề xuất bước kiểm tra tiếp theo.

```mermaid
flowchart LR
    subgraph SRC["Đầu vào"]
        TOPO["Topology hệ thống"]
        STATE["Trạng thái và chỉ số<br/>thiết bị theo thời gian"]
        DOC["Tài liệu kỹ thuật"]
        ALERT["Cảnh báo"]
        ASK["Câu hỏi của kỹ sư"]
    end

    SYSTEM["Hệ thống hỗ trợ điều tra"]

    subgraph OUT["Đầu ra"]
        VIEW["Dashboard cảnh báo động<br/> kèm ngữ cảnh đầy đủ"]
        HINT["Giả thuyết và gợi ý<br/> cho các bước tiếp theo"]
    end

    TOPO --> SYSTEM
    STATE --> SYSTEM
    DOC --> SYSTEM
    ALERT --> SYSTEM
    ASK --> SYSTEM
    SYSTEM --> VIEW
    SYSTEM --> HINT

    classDef planned fill:#F8FAFC,stroke:#94A3B8,stroke-dasharray:4 3,color:#475569;
    class TOPO,DOC planned;
```

*Hình 8. Ranh giới đầu vào/đầu ra của bài toán.*

## 2. Đầu vào

### a. Topology hệ thống

### b. Trạng thái và chỉ số thiết bị theo thời gian

### c. Tài liệu kỹ thuật

### d. Cảnh báo

### e. Câu hỏi của kỹ sư

## 3. Đầu ra

### a. Dashboard cảnh báo động kèm ngữ cảnh đầy đủ

Với một cảnh báo đang được chọn, dashboard sẽ hiển thị:
- Thông tin định danh cảnh báo: mã cảnh báo, thời điểm phát sinh và mức độ (ví dụ `ALM-2041`, `14:32:00`, `Major`).
- Đối tượng bị cảnh báo: thiết bị, cổng và chỉ số đã phát sinh giá trị bất thường (ví dụ `R-HN-01`, cổng `WAN-01`, chỉ số `packet-error`).
- Thông tin tổng quát và trạng thái hiện tại của thiết bị phát cảnh báo, gồm tên, loại, địa chỉ quản lý, vị trí trong cây phân cấp quản lý và thời điểm cập nhật gần nhất.
- Giá trị và lịch sử của chỉ số quanh thời điểm phát sinh, bao gồm giá trị tại thời điểm phát sinh, biên độ tăng và xu hướng trước, sau sự kiện (ví dụ chỉ số `packet-error` đạt đỉnh `1.250` trong khoảng `14:32`–`14:37`).
- Đồ thị thể hiện thiết bị phát cảnh báo với các thiết bị khác có liên kết với thiết bị đó, trong đó mỗi liên kết ghi rõ đầu xa và cổng đối tác (ví dụ `R-HN-01:WAN-01` nối với `SW-HN-02:UPLINK-03`).
- Các cảnh báo gần đây của chính thiết bị đó, cùng với các cảnh báo liên quan xảy ra trên thiết bị khác trong cùng khung thời gian, xếp cạnh nhau theo mốc thời gian (ví dụ `ALM-2038` trên `R-HN-07` lúc `14:33:10`).

Các thành phần này được gắn với nhau bằng liên kết có thể bấm: bấm vào thiết bị hoặc cổng sẽ điều hướng tới dashboard của tài nguyên đó, bấm vào nút lá của đồ thị để mở rộng thêm liên kết, bấm vào một cảnh báo để đưa cảnh báo đó vào ngữ cảnh điều tra, và bấm vào mốc thời gian sẽ mở biểu đồ chỉ số tại đúng cửa sổ phát sinh. Như vậy, những thông tin vốn nằm rải rác ở các trang cảnh báo, thiết bị và giám sát được gom về một màn hình theo cùng một định danh tài nguyên, và việc xác định phạm vi ảnh hưởng của một cảnh báo được thực hiện ngay trên cùng một màn hình.

![](./mock-ui/04-dashboard-wireframe.png)

*Hình 9. Wireframe bố cục dashboard.*

### b. Giả thuyết và gợi ý cho các bước tiếp theo

Trên cơ sở ngữ cảnh đang hiển thị, hệ thống đề xuất một danh sách giả thuyết nguyên nhân được xếp hạng, kèm bằng chứng và phép kiểm tra tương ứng cho từng giả thuyết. Hệ thống chỉ gợi ý, không kết luận nguyên nhân; kỹ sư vẫn phải kiểm chứng trước khi quyết định biện pháp xử lý. Mỗi giả thuyết hiển thị:
- Tên giả thuyết và thứ hạng, ví dụ lỗi vật lý hoặc lỗi tín hiệu trên liên kết `R-HN-01:WAN-01`.
- Cơ sở xếp hạng, nêu rõ tiêu chí như số bằng chứng độc lập, mức khớp với tài liệu và khoảng cách thời gian; đây là tín hiệu để đối chiếu chứ không phải xác suất tuyệt đối.
- Các bằng chứng ủng hộ, mỗi bằng chứng kèm nguồn trích dẫn: giá trị chỉ số tại thời điểm phát sinh, cảnh báo liên quan ở thiết bị khác, quan hệ liên kết, hoặc đoạn tài liệu kỹ thuật.
- Các bằng chứng không phù hợp đối với giả thuyết hiện tại.
- Phép kiểm tra đề xuất cho từng giả thuyết: thao tác cụ thể, dữ liệu cần thu thập, và kết quả kỳ vọng nếu giả thuyết đúng hoặc sai.

Ví dụ, với cảnh báo `ALM-2041` trên `R-HN-01:WAN-01`, hệ thống gợi ý kiểm tra thống kê lỗi `CRC/FCS` ở cả hai đầu liên kết (`WAN-01` và `UPLINK-03` trên `SW-HN-02`): nếu lỗi chỉ xuất hiện ở một đầu thì nghiêng về lỗi cổng, nếu xuất hiện ở cả hai đầu thì nghiêng về lỗi đường truyền, và kết quả thu được được ghi nhận lại làm bằng chứng cho vòng đánh giá tiếp theo.

Mỗi bằng chứng và mỗi phép kiểm tra đều là liên kết có thể bấm, cho phép kỹ sư chuyển thẳng tới vị trí hiển thị bằng chứng đó trên dashboard hoặc chạy phép kiểm tra ngay tại đây. Nhờ vậy, việc hình thành và kiểm chứng giả thuyết được thực hiện có hệ thống thay vì phụ thuộc hoàn toàn vào kinh nghiệm cá nhân.

![](./mock-ui/05-hypothesis-wireframe.png)

*Hình 10. Wireframe danh sách giả thuyết và phép kiểm tra đề xuất.*
