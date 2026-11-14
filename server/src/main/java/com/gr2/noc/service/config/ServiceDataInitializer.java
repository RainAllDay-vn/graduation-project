package com.gr2.noc.service.config;

import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.dto.get.NetworkServiceSummary;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.service.NetworkServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds telecom L3 services on application startup (dev profile only).
 * Services traverse the seeded topology; two Hà Nội services depend on the
 * degraded incident path (SW-HN-02, CORE-02, AGG-02) of INC-2026-0915.
 */
@Component
@Profile("dev")
@Order(4)
@RequiredArgsConstructor
@Slf4j
public class ServiceDataInitializer implements CommandLineRunner {

    private final NetworkServiceService networkServiceService;

    @Override
    public void run(String... args) {
        List<NetworkServiceSummary> existing = networkServiceService.getServices(null, null, null, null);
        if (!existing.isEmpty()) {
            log.info("Service seed data already exists ({} records). Skipping initialization.", existing.size());
            return;
        }

        log.info("Seeding telecom L3 services inventory...");

        List<CreateNetworkServiceRequest> services = List.of(
                // Miền Bắc - Hà Nội (incident path services)
                CreateNetworkServiceRequest.builder()
                        .id("SVC-INT-TRANSIT-HN")
                        .name("Internet Transit Hà Nội")
                        .description("Transit Internet quốc gia đi qua trục lõi Hà Nội, phục vụ tổng đài khu vực phía Bắc.")
                        .type(ServiceType.INTERNET_TRANSIT)
                        .region("Miền Bắc - Hà Nội")
                        .status(ServiceStatus.DEGRADED)
                        .subscriberCount(45000)
                        .dependentDeviceIds(List.of("IGW-01", "CORE-01", "CORE-02", "SW-HN-02"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-VPN-MPLS-HN")
                        .name("VPN MPLS Doanh nghiệp Miền Bắc")
                        .description("Dịch vụ VPN MPLS kết nối trụ sở doanh nghiệp tại Hà Nội về lõi mạng.")
                        .type(ServiceType.VPN_MPLS)
                        .region("Miền Bắc - Hà Nội")
                        .status(ServiceStatus.DEGRADED)
                        .subscriberCount(320)
                        .dependentDeviceIds(List.of("CORE-02", "AGG-02", "EXCH-HN-01"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-VOIP-HN")
                        .name("VoIP Tổng đài Hà Nội")
                        .description("Điện thoại IP cho tổng đài viên và nội bộ khu vực Hà Nội.")
                        .type(ServiceType.VOIP)
                        .region("Miền Bắc - Hà Nội")
                        .subscriberCount(8200)
                        .dependentDeviceIds(List.of("SW-HN-02", "EXCH-HN-02"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-IPTV-HN")
                        .name("IPTV Truyền hình Hà Nội")
                        .description("Truyền hình IPTV phát tới thuê bao khu vực Hà Nội qua tổng hợp AGG-01.")
                        .type(ServiceType.IPTV)
                        .region("Miền Bắc - Hà Nội")
                        .subscriberCount(15000)
                        .dependentDeviceIds(List.of("AGG-01", "EXCH-HN-01"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-DNS-CORE")
                        .name("DNS Resolving Quốc gia")
                        .description("Dịch vụ phân giải tên miền dùng chung toàn mạng, đặt tại cặp gateway quốc tế.")
                        .type(ServiceType.DNS)
                        .region("Miền Bắc - Hà Nội")
                        .subscriberCount(900000)
                        .dependentDeviceIds(List.of("IGW-01", "CORE-01"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-CLOUD-DC-HN")
                        .name("Cloud Connect DC-HN-02")
                        .description("Kết nối riêng từ trung tâm dữ liệu DC-HN-02 tới lõi mạng.")
                        .type(ServiceType.CLOUD_CONNECT)
                        .region("Miền Bắc - Hà Nội")
                        .subscriberCount(120)
                        .dependentDeviceIds(List.of("CORE-01", "AGG-01"))
                        .build(),

                // Miền Trung - Đà Nẵng
                CreateNetworkServiceRequest.builder()
                        .id("SVC-INT-TRANSIT-DN")
                        .name("Internet Transit Đà Nẵng")
                        .description("Transit Internet cho khách hàng miền Trung qua trục lõi Đà Nẵng.")
                        .type(ServiceType.INTERNET_TRANSIT)
                        .region("Miền Trung - Đà Nẵng")
                        .subscriberCount(21000)
                        .dependentDeviceIds(List.of("CORE-DN-01", "AGG-DN-01"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-VPN-MPLS-DN")
                        .name("VPN MPLS Doanh nghiệp Miền Trung")
                        .description("Dịch vụ VPN MPLS cho doanh nghiệp tại miền Trung.")
                        .type(ServiceType.VPN_MPLS)
                        .region("Miền Trung - Đà Nẵng")
                        .subscriberCount(140)
                        .dependentDeviceIds(List.of("CORE-DN-01"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-DATACENTER-DN")
                        .name("Datacenter Đà Nẵng")
                        .description("Lưu trữ và máy chủ ảo tại datacenter Đà Nẵng, đi ra qua AGG-DN-01.")
                        .type(ServiceType.DATACENTER)
                        .region("Miền Trung - Đà Nẵng")
                        .subscriberCount(3500)
                        .dependentDeviceIds(List.of("AGG-DN-01"))
                        .build(),

                // Miền Nam - TP. Hồ Chí Minh
                CreateNetworkServiceRequest.builder()
                        .id("SVC-INT-TRANSIT-HCM")
                        .name("Internet Transit TP.HCM")
                        .description("Transit Internet cho khách hàng miền Nam qua lõi TP. Hồ Chí Minh.")
                        .type(ServiceType.INTERNET_TRANSIT)
                        .region("Miền Nam - TP. Hồ Chí Minh")
                        .subscriberCount(68000)
                        .dependentDeviceIds(List.of("CORE-HCM-01"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-VOIP-HCM")
                        .name("VoIP Tổng đài TP.HCM")
                        .description("Điện thoại IP cho tổng đài viên và nội bộ khu vực TP. Hồ Chí Minh.")
                        .type(ServiceType.VOIP)
                        .region("Miền Nam - TP. Hồ Chí Minh")
                        .subscriberCount(12500)
                        .dependentDeviceIds(List.of("CORE-HCM-01"))
                        .build(),
                CreateNetworkServiceRequest.builder()
                        .id("SVC-DATACENTER-HCM")
                        .name("Datacenter Sài Gòn")
                        .description("Lưu trữ và máy chủ ảo tại datacenter Sài Gòn.")
                        .type(ServiceType.DATACENTER)
                        .region("Miền Nam - TP. Hồ Chí Minh")
                        .subscriberCount(4800)
                        .dependentDeviceIds(List.of("CORE-HCM-01"))
                        .build()
        );

        services.forEach(networkServiceService::createService);
        log.info("Successfully seeded {} telecom L3 services.", services.size());
    }
}
