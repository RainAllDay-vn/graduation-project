package com.gr2.noc.document.config;

import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.enums.DocumentSource;
import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.document.repository.TechnicalDocumentRepository;
import com.gr2.noc.document.service.DocumentStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;

/**
 * Seeds the technical-document library with realistic telecom SOPs on startup (dev profile only).
 */
@Component
@Profile("dev")
@Order(5)
@RequiredArgsConstructor
@Slf4j
public class DocumentDataInitializer implements CommandLineRunner {

    private final TechnicalDocumentRepository documentRepository;
    private final DocumentStorageService documentStorageService;

    @Override
    @Transactional
    public void run(String... args) {
        if (documentRepository.count() > 0) {
            log.info("Document seed data already exists ({} records). Skipping initialization.", documentRepository.count());
            return;
        }

        log.info("Seeding technical-document library...");

        seedReadyDocument(
                "SOP-OPTICS-01",
                "Quy trình xử lý sự cố cáp quang và mất tín hiệu RX",
                DocType.OPERATION_RUNBOOK,
                DocumentSource.INTERNAL_WIKI,
                "quy-trinh-xu-ly-su-co-cap-quang.md",
                Set.of("OPTICS_RX_POWER_LOW"),
                """
                        # Quy trình xử lý sự cố cáp quang và mất tín hiệu RX

                        ## 1. Xác định vị trí đứt sợi
                        - Dùng máy OTDR đo từ hai đầu tuyến, ghi lại khoảng cách điểm đứt so với trạm A và trạm B.
                        - Đối chiếu với sơ đồ tuyến truyền dẫn để khoanh vùng vị trí đứt trên thực địa (hầm cáp, cột, mảng treo).

                        ## 2. Điều phối cứu hộ
                        - Điều đội cứu hộ tới hầm cáp hoặc cột gần vị trí đứt nhất, chuẩn bị máy hàn quang và cuộn sợi dự phòng.
                        - Thông báo cho đơn vị quản lý hạ tầng trước khi đào bới hoặc treo cáp mới.

                        ## 3. Hàn nối và khôi phục
                        - Hàn nối sợi, đo lại suy hao mối hàn (yêu cầu < 0.05 dB/mối).
                        - Theo dõi công suất RX quang tại hai đầu thiết bị sau khi khôi phục, đảm bảo về ngưỡng bình thường.

                        ## 4. Báo cáo sau xử lý
                        - Báo cáo sau xử lý trong 24 giờ, kèm ảnh trước/sau vị trí đứt và biểu đồ suy hao OTDR.
                        - Cập nhật nhật ký sự cố và bài học kinh nghiệm vào wiki nội bộ.
                        """,
                Instant.now().minus(2, ChronoUnit.DAYS)
        );

        seedReadyDocument(
                "SOP-OPTICS-02",
                "Quy trình xử lý quá nhiệt module SFP",
                DocType.OPERATION_RUNBOOK,
                DocumentSource.CONFLUENCE,
                "quy-trinh-xu-ly-qua-nhiet-sfp.md",
                Set.of("OPTICS_TEMP_HIGH"),
                """
                        # Quy trình xử lý quá nhiệt module SFP

                        ## 1. Xác nhận cảnh báo nhiệt độ
                        - Kiểm tra telemetry nhiệt độ module quang. Ngưỡng cảnh báo 75°C, ngưỡng nghiêm trọng 80°C.
                        - Xác nhận nhiệt độ môi trường phòng thiết bị trong khoảng 18-27°C.

                        ## 2. Kiểm tra tản nhiệt và luồng khí
                        - Kiểm tra quạt tản nhiệt thiết bị, vệ sinh bụi nếu luồng khí yếu.
                        - Đảm bảo khe module không bị che chắn, sắp xếp lại dây nhảy nếu cản trở luồng khí.

                        ## 3. Thay thế module nếu cần
                        - Nếu nhiệt độ tiếp tục vượt ngưỡng sau khi xử lý luồng khí, thay module SFP bằng module dự phòng cùng model.
                        - Ghi nhận số serial module cũ để bảo hành nhà sản xuất.

                        ## 4. Theo dõi sau xử lý
                        - Theo dõi nhiệt độ module trong 24 giờ tiếp theo, xác nhận nhiệt độ ổn định dưới 65°C.
                        """,
                Instant.now().minus(5, ChronoUnit.DAYS)
        );

        seedReadyDocument(
                "SOP-BGP-01",
                "Quy trình chẩn đoán BGP Flapping",
                DocType.OPERATION_RUNBOOK,
                DocumentSource.MANUAL,
                "quy-trinh-chan-doan-bgp-flapping.md",
                Set.of("BGP_FLAP"),
                """
                        # Quy trình chẩn đoán BGP Flapping

                        ## 1. Thu thập thông tin session
                        - Xác định neighbor BGP bị flap, thời điểm flap đầu tiên và tần suất.
                        - Kiểm tra log BGP: NOTIFICATION, HOLD TIMER EXPIRED hay INTERFACE DOWN.

                        ## 2. Kiểm tra lớp liên kết
                        - Nếu log cho thấy INTERFACE DOWN, ưu tiên xử lý sự cố lớp vật lý hoặc liên kết trước.
                        - Kiểm tra lỗi CRC, input errors trên cổng liên kết tới peer.

                        ## 3. Kiểm tra tài nguyên thiết bị
                        - Kiểm tra CPU và bộ nhớ của thiết bị. CPU cao kéo dài có thể gây miss keepalive và hold timer expired.
                        - Nếu CPU bình thường nhưng vẫn flap, nghiêng về nguyên nhân đường truyền.

                        ## 4. Phối hợp với peer
                        - Liên hệ đơn vị vận hành đầu peer, đối chiếu log hai đầu và khớp mốc thời gian flap.
                        - Cân nhắc route dampening hoặc tạm thời shutdown/đặt lại session nếu flap dai dẳng.
                        """,
                Instant.now().minus(7, ChronoUnit.DAYS)
        );

        seedFailedDocument();
        log.info("Successfully seeded 3 READY SOP documents and 1 FAILED document.");
    }

    private void seedReadyDocument(String id, String title, DocType docType, DocumentSource source,
                                   String fileName, Set<String> targetFaultCodes, String content, Instant createdAt) {
        long fileSizeBytes = content.getBytes(StandardCharsets.UTF_8).length;
        String storagePath = documentStorageService.store(
                id, 1, fileName, new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)));
        TechnicalDocument document = TechnicalDocument.builder()
                .id(id)
                .title(title)
                .docType(docType)
                .source(source)
                .fileName(fileName)
                .fileFormat("MD")
                .fileSizeBytes(fileSizeBytes)
                .storagePath(storagePath)
                .version(1)
                .content(content)
                .targetFaultCodes(targetFaultCodes)
                .indexingStatus(IndexingStatus.READY)
                .createdAt(createdAt)
                .build();
        if (document == null) {
            return;
        }
        documentRepository.save(document);
    }

    private void seedFailedDocument() {
        String content = """
                MaTB,TenThietBi,Tram,Hang
                SW-HN-02,Aggregation Switch,HN-POP-01,Huawei
                CORE-02,Core Router,HN-POP-01,Cisco
                AGG-02,Aggregation Switch,HN-POP-01,Nokia
                """;
        String fileName = "danh-muc-thiet-bi-tram-a.csv";
        long fileSizeBytes = content.getBytes(StandardCharsets.UTF_8).length;
        String storagePath = documentStorageService.store(
                "DOC-CSV-01", 1, fileName, new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)));
        TechnicalDocument document = TechnicalDocument.builder()
                .id("DOC-CSV-01")
                .title("Danh mục thiết bị trạm A")
                .docType(DocType.VENDOR_SPECIFICATION)
                .source(DocumentSource.MANUAL)
                .fileName(fileName)
                .fileFormat("CSV")
                .fileSizeBytes(fileSizeBytes)
                .storagePath(storagePath)
                .version(1)
                .indexingStatus(IndexingStatus.FAILED)
                .statusReason("Định dạng tệp không được hỗ trợ (chỉ chấp nhận .md, .txt)")
                .createdAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .build();
        if (document == null) {
            return;
        }
        documentRepository.save(document);
    }
}
