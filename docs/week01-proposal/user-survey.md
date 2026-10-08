# Network Engineer Discovery Questions

## 1. Scale

1. How many devices does an engineer typically monitor, what is the geographical coverage, and what is the typical volume of data?
   (Một kỹ sư giám sát hệ thống thường cần giám sát bao nhiêu thiết bị? Diện tích khoảng bao nhiêu? Độ lớn của dữ liệu? VD: Một kỹ sư thường giám sát 1 quận/huyện gồm trung bình 1000 thiết bị bao phủ diện tích 10km², mỗi ngày hệ thống có thể cung cấp hàng trăm ngàn dòng dữ liệu status của thiết bị)

### Approved evidence — Vietnam official workload benchmarks — devices monitored

- **Finding:** No Vietnam survey or report identified a typical engineer-to-device ratio, geographic coverage, or monitoring-data volume. The example figures in this question remain unverified.
- [Hanoi Decision 30/2025/QĐ-UBND](https://vanban.hanoi.gov.vn/chi-tiet-van-ban/ve-viec-ban-hanh-mot-so-dinh-muc-kinh-te-ky-thuat-dich-vu-su-nghiep-cong-su-dung-ngan-sach-nha-n-219891) ([HTML text](https://luatvietnam.vn/thong-tin/quyet-dinh-30-2025-qd-ubnd-ha-noi-dinh-muc-kinh-te-ky-thuat-dich-vu-su-nghiep-cong-linh-vuc-thong-tin-va-truyen-thong-398051-d2.html)), issued 16 April 2025, sets Hanoi public-service labour inputs per device per working day: 0.229 engineer-days for routers, 0.208 for switches, 0.167 for modems, and 0.135 for other devices. The work includes operational-status and service checks, backup checks, port work, and shift handover. This is a local planning norm, not observed industry practice or a national capacity benchmark; do not invert it into an engineer-to-device ratio.
- [Hanoi Decision 29/2026/QĐ-UBND](https://vanban.hanoi.gov.vn/chi-tiet-van-ban/ve-viec-ban-hanh-dinh-muc-kinh-te-ky-thuat-giam-sat-dam-bao-an-toan-thong-tin-doi-voi-he-thong-ha-t-236341) defines monitoring workload bands of at most 100, 101–300, and more than 300 devices or log sources, with log-rate bands of at most 1,000, 1,000–10,000, and more than 10,000 logs per second. It is useful local workload context, but has no engineer denominator or survey sample.
- **Confidence:** Medium that the Vietnamese public evidence gap remains; low for any numerical per-engineer capacity, geographic-coverage, or data-volume claim.

### Approved evidence — Vietnam websites — devices monitored

- **Finding:** No public Vietnamese website verified a typical number of network devices monitored per engineer. The example figures in this question remain illustrative only.
- [FPT Telecom (2021)](https://fpt.vn/tin-tuc/cach-trai-tim-fpt-telecom-chuyen-doi-so-6377.html) describes 15 NOC.IP engineers operating a network framed as more than 800 nodes and nearly 2,000 links. This is production team-level context, but the node/link metaphor is not an unambiguous device count and cannot establish a per-engineer ratio.
- [Viettel IDC (2024)](https://viettelidc.com.vn/tin-tuc/noc-la-gi) states that its NOC monitors network-device status, link parameters, and servers, with at least three shift staff for 24/7 operations. It does not publish a monitored-device inventory.
- [VNPT (2021)](https://vnpt.vn/gioi-thieu/tin-tuc/nen-tang-quan-ly-thiet-bi-giup-tiet-kiem-chi-phi.html) reports that its ONE Telco platform manages nearly eight million devices, but does not provide staffing figures and includes varied/IoT equipment rather than only network devices.
- **Confidence:** Medium that a Vietnam-specific public evidence gap exists; low for any numerical staffing ratio. These company sources are not Vietnam-wide benchmarks.

### Approved evidence — Vietnam blogs — devices monitored

- **Finding:** Vietnamese company posts show substantial production-scale operations but do not establish a typical nationwide engineer-to-device ratio, routine geographic coverage, or exact monitoring-data volume. The illustrative figures in this question remain unverified.
- [HPT SmartNOC (2021)](https://www.hpt.vn/tin-tuc/smartnoc-giam-sat-hoat-dong-cua-hon-3000-thiet-bi-unifi-wifi/2046) reports monitoring more than 3,000 distributed Unifi devices for FTI-OSS; it also says FTI-OSS had supplied more than 15,000 devices since 2016. This is a company-specific production case, not an individual assignment or national benchmark.
- [MobiFone MobiBeat (2026)](https://mobibeat.mobifone.vn/category/5/post/6113) describes an event-readiness plan that placed technical staff in 34 provinces and cities, with centralized 24/7 network monitoring from Hanoi, Da Nang, and Ho Chi Minh City. This confirms event-specific geographic coverage, not normal operating territory per engineer.
- [Viettel Networks (2026)](https://viettelfamily.com/news/vtnet-mang-bo-ba-giai-phap-ai-make-in-vietnam-chinh-phuc-mwc-2026) describes millions of real-time operational metrics and millions of daily NOC alerts on Viettel's large network. It does not define an exact telemetry rate or establish a daily status-line volume.
- **Confidence:** Medium for the cited company and event-specific figures; low for any typical Vietnam-wide per-engineer, geographic-coverage, or data-volume claim.

### Approved evidence — Vietnam social/community — devices monitored

- **Finding:** Public Vietnamese-language community posts provide bounded, anecdotal examples of monitoring and multi-branch support, but do not validate a typical Vietnam-wide ratio, coverage area, or data volume. The authors' geography and roles are not independently established.
- [VOZ Zabbix/MySQL thread](https://voz.vn/t/tim-cao-thu-zabbix-va-mysql.570025/) (MRCD™, 22 June 2022) is a self-reported experience: a Zabbix deployment monitored about 300 hosts, including MikroTik switches, routers, Wi-Fi APs, and more than 100 Hikvision cameras; its two-core, 4 GB VM's MySQL exceeded 90% after several hours. It has no engineer denominator or samples-per-day figure.
- [VOZ IT-helpdesk thread](https://voz.vn/t/tam-su-cua-mot-dan-it-ma-khong-phai-la-it-it-helpdesk-ngay-cuoi-nam.473291/#post-15233666) (winter16, 13 January 2022) is a personal-experience post stating, “Cty mình thì 10 chi nhánh, mình chủ yếu hỗ trợ từ xa các chi nhánh khác.” It supports a single multi-branch remote-support example, not an area measurement or staffing benchmark.
- [VOZ Wi-Fi thread](https://voz.vn/t/tu-van-he-thong-wifi-ket-noi-100-thiet-bi-trong-5-phut-roi-out.101135/) (webdone, 5 August 2020) is an anecdotal capacity discussion reporting 50–100 phones cycling through in five minutes and 40–50 concurrent devices regularly saturating modems. It is client-capacity context, not monitoring-scale evidence.
- **Confidence:** Low. These are uncorroborated forum anecdotes and cannot be generalized beyond their stated scenarios.

### Approved consolidated conclusion

- Vietnam-only evidence does not support one typical engineer-to-device ratio, geographic coverage, or monitoring-data volume. It instead shows bounded official planning norms, company- and event-specific scales from hundreds to thousands of devices, and large-network metrics or alert volumes.
- The official, company, and community evidence above is useful for defining variable scale scenarios, but not as a national benchmark. The illustrative 1,000 devices, 10 km², and hundreds of thousands of daily status lines remain unverified.
- **Confidence:** Medium that this Vietnam public-evidence gap exists; low for any specific nationwide numerical claim.

## 2. Monitoring and detection

2. What perspective or view do you typically use when monitoring the network?
   (Khi giám sát, anh thường giám sát theo view như thế nào? VD: Giám sát theo từng vùng, nhóm thiết bị theo vị trí vật lý / Theo logic, nhóm thiết bị theo ngoại biên, core,... / Theo chức năng, nhóm server, router,... / Hay tùy theo trường hợp cụ thể như thế nào?)
3. Do you monitor on a fixed schedule or only react to system alerts, and what triggers an investigation?
   (Khi giám sát thì anh thường giám sát theo 1 tần suất nhất định (VD: 2 lần / ngày) hay chỉ khi có cảnh báo từ hệ thống? Khi nào thì anh xác định là hệ thống có bất thường cần điều tra (khi hiệu năng giảm / khi có cảnh báo / khi có nhiều cảnh báo từ nhiều thiết bị / khi hệ thống crash / ...)?)
4. When an incident occurs, do alerts typically originate from an isolated point or cascade across a wider area/cluster?
   (Khi sự cố xảy ra thì cảnh báo thường xuất hiện từ 1 điểm (lỗi tại 1 hay 1 số thiết bị có liên kết trực tiếp) hay tạo thành 1 vùng (có thể gồm hàng chục thiết bị qua nhiều liên kết khác nhau)?)
5. Among all the alerts generated, what proportion are truly actionable and useful?
   (Trong số những cảnh báo, thì đa số chúng có hữu dụng không? VD: Đa số là cảnh báo nhiễu, chỉ có một số nhỏ cung cấp thông tin thực sự hữu ích)

### Approved evidence — Vietnam websites — monitoring and detection

- **Question 2 — Monitoring views:** Vietnam production cases combine physical location, device state, network role or topology, and service/customer-impact views. [FPT Telecom (2021)](https://fpt.vn/tin-tuc/cach-trai-tim-fpt-telecom-chuyen-doi-so-6377.html) describes NETD views of device count, installation location, model, and state; CoreIP, CGNAT, BGP, and MPOP/BRAS functions; and the services and customers affected by a link. [HPT SmartNOC (2021)](https://www.hpt.vn/tin-tuc/smartnoc-giam-sat-hoat-dong-cua-hon-3000-thiet-bi-unifi-wifi/2046) describes dashboards for device condition and user experience across more than 3,000 distributed devices. [Báo Điện tử Chính phủ (2025)](https://baochinhphu.vn/quy-dinh-moi-ve-hoat-dong-cua-mang-truyen-so-lieu-chuyen-dung-phuc-vu-cac-co-quan-dang-nha-nuoc-102250915174416725.htm) defines a national NOC, regional centres, regional/provincial centres, trunk/access networks, and central management platforms; this is a prescribed model, not proof of routine practice.
- **Question 3 — Cadence and triggers:** Continuous alert-driven monitoring coexists with scheduled checks. FPT reports threshold alerts for immediate incident awareness and upgrade planning. [Báo Điện tử Chính phủ (2023)](https://baochinhphu.vn/5-mo-hinh-ket-noi-mang-truyen-so-lieu-chuyen-dung-phuc-vu-co-quan-dang-nha-nuoc-102231228104716807.htm) describes 00:00–24:00 traffic monitoring using five-minute samples over at least three months, plus periodic checks; this is an official operating model. [Cục Tần số (2026)](https://rfd.gov.vn/tin-tuc/pages/hoat-dong-su-kien.aspx?ItemID=3422) documents iSpectra detecting an illegal repeater and triggering inspection coordinated with local authorities.
- **Question 4 — Incident scope:** Both local-cluster and wider-area impacts occur. The Cục Tần số incident reports one illegal repeater affecting mobile stations in its area. [VNPT (2020)](https://vnpt.vn/gioi-thieu/tin-tuc/vnpt-da%CC%89m-ba%CC%89o-an-toa%CC%80n-o%CC%89n-di%CC%A3nh-ma%CC%A3ng-luo%CC%81i-mu%CC%80a-mua-ba%CC%83o-tai-dien-bien.html) reports storm damage disrupting communications across Nậm Pồ, Tuần Giáo, and Điện Biên Đông; [VOV (2020)](https://vov.vn/cong-nghe/mang-mobifone-dang-mat-ket-noi-o-nhieu-noi-782163.vov) reports simultaneous MobiFone service-loss reports in multiple provinces and Hanoi. These reports do not expose the underlying alert stream or its root-cause distribution.
- **Question 5 — Actionable alerts:** No public Vietnam source provides an audited network-health useful-versus-noise ratio. [Viettel Networks (2026)](https://viettelfamily.com/news/vtnet-mang-bo-ba-giai-phap-ai-make-in-vietnam-chinh-phuc-mwc-2026) states that its NOCs process millions of alerts daily and that most are noise or not root-cause indicators, but supplies no denominator or audit. [Viettel IDC (2025)](https://viettel-idc.com.vn/index.php/tin-tuc/tin-cong-nghe/siem-viettel-va-vai-tro-then-chot-trong-he-thong-security-operations-center-soc-207.html) claims 70% false positives in an unnamed bank's security-alert case; [Viettel Cyber Security (2025)](https://viettelsecurity.com/vi/customer-story/tu-dong-hoa-77-canh-bao-phishing-toi-uu-van-hanh-soc-o-quy-mo-tap-doan/) claims 77% automation of phishing-alert handling. Both are adjacent security cases and do not quantify network-health alert actionability.
- **Evidence gap:** No Vietnam-wide evidence identifies engineers' most-used view, manual inspection cadence or thresholds, isolated-versus-cascading incident proportions, or an audited network-health actionable-alert ratio.
- **Confidence:** Medium for the cited production and official examples; low for any nationwide frequency, preference, or alert-quality percentage.

### Approved evidence — Vietnam blogs — monitoring and detection

- **Question 2 — Monitoring views:** [Viettel GNOC (2024)](https://viettelfamily.com/news/bo-truong-nguyen-manh-hung-khong-chi-dieu-hanh-ky-thuat-noc-phai-dieu-hanh-ca-kinh-doanh) describes automated monitoring and handling down to individual cells, using network KPIs, resource utilisation, and station-level views. This is a Viettel production description, not evidence of a nationwide preferred view.
- **Question 3 — Cadence and triggers:** [MobiFone's Wipha response (2025)](https://mobibeat.mobifone.vn/category/5/post/5606) describes 24/7 readiness, continuously updated NOC data, infrastructure review before the storm, and post-storm network-quality checks. It is an event-specific production operation and does not establish a normal manual inspection cadence, thresholds, or SLA.
- **Question 4 — Incident scope:** [Viettel's HGG501 incident (2024)](https://viettelfamily.com/news/ky-thuat-viettel-no-luc-cuu-tram-ngay-trong-dem-ngan-trang-song-52675) documents local service loss from a cable fault. [Viettel's storm response (2025)](https://viettelfamily.com/news/sau-bao-so-5-mang-luoi-viettel-tiep-tuc-doi-mat-voi-ngap-lut-lu-quet) reports 1,915 sites without power, 23 trunk-cable faults, 853 interrupted sites, and 35 isolated sites across Thanh Hóa and Nghệ An. These incident accounts confirm both local and wider effects, but not their frequency in the alert stream.
- **Evidence gap:** No Vietnam-wide source establishes the preferred monitoring view, routine manual cadence, alert thresholds, investigation SLA, isolated-versus-cascading incident proportion, or an audited network-health useful-versus-noise ratio.
- **Confidence:** Medium for the cited company-specific production and incident accounts; low for nationwide frequency or alert-quality claims.

### Approved evidence — Vietnam surveys/reports — monitoring and detection

- **Question 3 — Cadence and triggers:** [Vietnam Report (2024)](https://vietnamreport.net/Top-10-Cong-ty-Cong-nghe-uy-tin-nam-2024-10894-1007.html) reports that 77.5% of surveyed technology businesses identified infrequent cyber-risk review/detection as a limitation, compared with 42.9% in June 2023; 68.0% prioritized stronger cybersecurity monitoring, 38.9% periodic risk assessment, and 55.6% varied incident-response scenarios. This provides contextual support for combining ongoing monitoring with periodic checks, but does not quantify alert-driven versus scheduled work.
- **Limitations:** The report does not disclose its sample size or response rate. It is self-reported cybersecurity practice and priority data, not network-health telemetry or a national benchmark.
- **Evidence gap:** Questions 2 and 4 have no direct Vietnam survey/report evidence. For Question 3, the alert-driven versus scheduled-work split remains unknown. For Question 5, no survey/report provides a useful-versus-noise ratio for network-health alerts.
- **Confidence:** Low to medium for the bounded cybersecurity-monitoring context; low for any inference about routine network operations.

### Approved consolidated conclusion

- **Question 2:** Vietnam evidence supports using combined location/site, device-state, network-role/topology, KPI/resource, service, and customer-impact views. Community material—such as [Viblo's Zabbix overview](https://viblo.asia/p/tong-quan-ve-zabbix-KE7bGo04v5e2) and [Grafana walkthrough](https://viblo.asia/p/cai-dat-do-hoa-grafana-thay-cho-zabbix-oOVlYOn4K8W)—qualitatively corroborates device, service, performance, dashboard, and remote-branch contexts, but is instructional and not evidence of a typical preference or view order.
- **Question 3:** Continuous alert-driven monitoring coexists with scheduled polling, traffic sampling, periodic checks, and event-readiness reviews. Threshold or metric breaches initiate investigation, but the routine manual cadence, production thresholds, escalation time, and response SLA are unverified. Community examples such as [Cacti polling](https://viblo.asia/p/tong-quan-ve-cong-cu-cacti-ho-tro-xay-dung-he-thong-theo-doi-may-tinh-trong-mang-cuc-bo-bWrZnxEp5xw) provide only illustrative implementation detail.
- **Question 4:** Both isolated local faults and wider multi-site or province-scale impacts occur. [Viblo's alerting comparison](https://viblo.asia/p/kibana-alerting-vs-prometheus-alertmanager-bao-dong-khi-nao-bao-cai-gi-pgjLNAdPJ32) qualitatively supports grouping related alerts, but no source measures the isolated-versus-cascading incident proportion.
- **Question 5:** No audited Vietnam network-health actionable, duplicate, false-positive, or noise rate was found. Noise, alert fatigue, grouping, and correlation are qualitatively recognized, but the available community material is opinion/design guidance rather than measured practice.
- **Confidence:** Medium for bounded company and official operating examples; low for Vietnam-wide preferences, frequencies, or alert-quality percentages. The remaining claims are recorded as Vietnam evidence gaps; comparator research was not performed.

## 3. Fault response workflow

6. Describe a recent fault from initial alert through diagnosis, mitigation, verification, and post-incident work in sequential steps.
   (Anh có thể miêu tả quá trình mà anh dùng để xử lý 1 sự cố không? Qua các bước từ chẩn đoán, khắc phục, kiểm tra và các việc hậu sự cố khác 1 cách lần lượt)
7. At each step, what information do you use, what decision do you make, and what output or record do you produce?
   (Ở mỗi bước thì anh cần thông tin gì, anh cần đưa ra những quyết định gì, anh phải viết báo cáo gì không?)
8. How consistent or variable is the investigation workflow across different incidents?
   (Thường mỗi lần điều tra 1 vấn đề thì workflow có nhiều thay đổi không? VD: Không nhiều thay đổi, thường có thể ước lượng được thời gian để xử lý ngay từ những thông tin ban đầu / Thay đổi nhiều qua mỗi lần, không thể biết trước được vấn đề này cần điều tra gì trước hay mất bao lâu khi nhìn sơ qua thông tin ban đầu)
9. How do you distinguish correlation from root cause, and what checks confirm that distinction?
   (Anh làm sao để phân biệt giữa nguyên nhân thực sự và tương quan/sự trùng hợp? Điều gì giúp anh kiểm tra điều đó?)
10. When a mitigation is attempted, how do you assess risk, obtain approval, and know whether it worked?
    (Khi một phương pháp khắc phục được áp dụng, anh làm sao để kiểm soát rủi ro, xin sự đồng ý và kiểm tra phương pháp có đúng hay không?)
11. After service is restored, which follow-up actions occur, such as documentation, review, trend tracking, or prevention work?
    (Khi dịch vụ được khắc phục thì hành động nào sẽ được thực hiện? VD: Viết báo cáo, viết review, kiểm tra xu hướng hay tăng cường phòng tránh trường hợp tương tự?)

## 4. Information sources and topology context

12. Which categories of information do you consult during an investigation, and in what order?
    (Khi sử dụng dashboard, anh thường xem những thông số nào (topology view/diff/device logs)? Và theo thứ tự như thế nào?)
13. What topology, dependency, ownership, or change context is essential for interpreting an alert?
    (Thông tin topology, dependency, ownership, hay change context nào là cần thiết để hiểu được một cảnh báo?)
14. Where do you find that context, how current is it, and what do you do when sources disagree or are incomplete?
    (Anh tìm thấy những thông tin trên ở đâu, độ chính xác và cập nhật của nó như thế nào? Khi các nguồn không đồng nhất hoặc không đầy đủ thì anh sẽ làm gì?)

## 5. AI assistant adoption and success

15. At which points in monitoring, fault response, or optimization would an AI assistant provide the most useful help?
    (Trong quá trình giám sát, xử lý sự cố, tối ưu hiệu năng, ở điểm nào một trợ lý AI có thể hỗ trợ hữu ích nhất?)
16. What should the assistant show first, which evidence should it cite, and how should it communicate uncertainty?
    (Trợ lý nên hiển thị thông tin gì đầu tiên, nên trích dẫn bằng chứng nào, thể hiện sự không chắc chắn ra sao?)
17. What inputs, actions, handoffs, or outputs should it support, and where must an engineer remain in control?
    (Trợ lý nên hỗ trợ những input, hành động, handoff nào và kỹ sư cần kiểm soát ở đâu?)
18. What measurable outcomes would demonstrate success, such as faster detection, shorter recovery, fewer repeat incidents, or better documentation?
    (Kết quả đo lường nào cho thấy sự thành công của hệ thống AI? VD: Thời gian phát hiện nhanh hơn, thời gian khắc phục ngắn hơn, số lần sự cố lặp lại ít hơn, tài liệu được viết đầy đủ hơn)
19. What recent workflow example would be a good pilot, and what baseline and acceptance criteria would you use to evaluate it?
    (Ví dụ về workflow nào sẽ được dùng để thử nghiệm, các tiêu chí đánh giá cơ sở và chấp nhận là gì?)
