/**
 * Centralized Data Store for Incident Investigation
 * Fully decoupled and extendable for production API integration
 */

const INCIDENT_DATA = {
  id: "INC-2026-0915",
  severity: "CRITICAL",
  status: "INVESTIGATING",
  openedAt: "13:58:44",
  date: "15/09/2026",
  region: "Metropolitan Ring HN-Core-01",
  affectedServices: ["VoIP Transit", "5G User Plane Traffic", "Core Inter-DC Link"]
};

const ALARMS_DATA = [
  {
    id: "ALM-2035",
    deviceId: "SW-HN-02",
    time: "13:58:44",
    severity: "warning",
    message: "Nhiệt độ module quang vượt ngưỡng (58.2°C)",
    code: "OPTICS_TEMP_HIGH"
  },
  {
    id: "ALM-2041",
    deviceId: "R-HN-01",
    time: "14:32:00",
    severity: "critical",
    message: "packet-error cổng WAN-01 vượt 1.250",
    code: "CRC_ERROR_THRESHOLD"
  },
  {
    id: "ALM-2038",
    deviceId: "R-HN-07",
    time: "14:33:10",
    severity: "warning",
    message: "Tăng tỷ lệ rớt gói trên luồng rẽ tiếp WAN-02",
    code: "REROUTE_TRAFFIC_LOSS"
  }
];

const THEORIES_DATA = [
  {
    id: 1,
    rank: "#1",
    matchScore: 88,
    title: "Suy hao tín hiệu cáp quang SW-HN-02 ↔ R-HN-01",
    shortTitle: "Lỗi cáp quang UPLINK-03 ↔ WAN-01",
    targetType: "edge",
    targetId: "edge-fault",
    sourceNode: "SW-HN-02",
    targetNode: "R-HN-01",
    sourcePort: "UPLINK-03",
    targetPort: "WAN-01",
    confidenceRationale: "Trùng khớp mốc thời gian bùng nổ CRC error với cảnh báo nhiệt độ quang học trước đó 34 phút.",
    evidence: [
      "Packet error tại WAN-01 tăng vọt từ 0 lên 1.250 lỗi/phút lúc 14:32:00.",
      "Công suất quang thu (Rx Power) giảm mạnh xuống -18.4 dBm (dưới ngưỡng tối thiểu -14 dBm).",
      "Nhiệt độ module SFP tại SW-HN-02 duy trì ở mức cao 58.2°C trước thời điểm nổ lỗi."
    ],
    telemetry: {
      speed: "10G Optical · Full Duplex",
      peakErrorRate: "1.250 CRC/phút",
      peakTime: "14:32:00 (15/09)",
      rxPower: "-18.4 dBm (Cảnh báo suy hao)",
      txPower: "-2.1 dBm (Bình thường)",
      sfpTemp: "58.2°C (Vượt ngưỡng 50°C)"
    },
    cliCommand: "show interfaces wan-01 controllers | inc CRC",
    verificationCmd: "show interfaces wan-01 controllers | inc CRC",
    secondaryCli: "show interfaces transceiver detail"
  },
  {
    id: 2,
    rank: "#2",
    matchScore: 62,
    title: "Nghẽn lưu lượng luồng rẽ tiếp qua WAN-02",
    shortTitle: "Nghẽn luồng rẽ tiếp R01 ↔ R07",
    targetType: "edge",
    targetId: "edge-impact",
    sourceNode: "R-HN-01",
    targetNode: "R-HN-07",
    sourcePort: "WAN-02",
    targetPort: "EGRESS-01",
    confidenceRationale: "Lưu lượng tự động đổ về đường backup WAN-02 làm tăng tỷ lệ drop gói thứ cấp.",
    evidence: [
      "Băng thông cổng WAN-02 vượt 94% tải định mức lúc 14:33:00.",
      "Tỷ lệ rớt gói (packet drop) đạt 1.8% trên luồng rẽ tiếp sang R-HN-07.",
      "Cảnh báo ALM-2038 kích hoạt chậm hơn 1 phút 10 giây so với cảnh báo gốc."
    ],
    telemetry: {
      speed: "10G Optical · Định tuyến lại",
      peakErrorRate: "Rớt gói 1.8% (Buffer Overflow)",
      peakTime: "14:33:10 (15/09)",
      rxPower: "-5.2 dBm (Tốt)",
      txPower: "-2.0 dBm (Tốt)",
      sfpTemp: "41.5°C (Bình thường)"
    },
    cliCommand: "show ip route summary | inc WAN-02",
    verificationCmd: "show ip route summary | inc WAN-02",
    secondaryCli: "show interface wan-02 stats"
  },
  {
    id: 3,
    rank: "#3",
    matchScore: 41,
    title: "Lỗi module quang SFP cổng UPLINK-03 tại SW-HN-02",
    shortTitle: "Hỏng module SFP tại SW-HN-02",
    targetType: "node",
    targetId: "SW-HN-02",
    confidenceRationale: "Chỉ số nhiệt độ tăng cao bất thường chỉ ghi nhận trên switch cục bộ.",
    evidence: [
      "Cảnh báo nhiệt độ SFP ALM-2035 xuất hiện sớm nhất lúc 13:58:44.",
      "Không ghi nhận lỗi tương đương trên các cổng khác cùng switch."
    ],
    telemetry: {
      speed: "10G SFP+ Local Port",
      peakErrorRate: "Cảnh báo cảm biến phần cứng",
      peakTime: "13:58:44",
      rxPower: "-18.4 dBm",
      txPower: "Không ổn định",
      sfpTemp: "58.2°C"
    },
    cliCommand: "show environment temperature | inc Transceiver",
    verificationCmd: "show environment temperature | inc Transceiver",
    secondaryCli: "show inventory | inc SFP"
  }
];

const TOPOLOGY_DATA = {
  nodes: [
    {
      id: "SW-HN-02",
      label: "SW-HN-02",
      ip: "10.244.1.2",
      type: "Access Switch",
      model: "Cisco Catalyst 9300",
      x: 180,
      y: 280,
      radius: 30,
      status: "warning",
      uptime: "27 ngày 2 giờ",
      cpuLoad: "34%",
      activeAlarm: "ALM-2035 (Nhiệt độ SFP cao: 58.2°C)",
      cli: "show environment temperature | inc Transceiver",
      tier: "access"
    },
    {
      id: "R-HN-01",
      label: "R-HN-01",
      ip: "10.244.1.1",
      type: "Core Router",
      model: "Cisco ASR 9000",
      x: 470,
      y: 280,
      radius: 32,
      status: "critical",
      uptime: "142 ngày 8 giờ",
      cpuLoad: "58%",
      activeAlarm: "ALM-2041 (packet-error WAN-01 vượt 1.250)",
      cli: "show interfaces wan-01 controllers | inc CRC",
      tier: "core"
    },
    {
      id: "R-HN-07",
      label: "R-HN-07",
      ip: "10.244.1.7",
      type: "Egress L3 Router",
      model: "Juniper MX480",
      x: 620,
      y: 390,
      radius: 25,
      status: "warning",
      uptime: "89 ngày 14 giờ",
      cpuLoad: "72% (Tải phụ truyền tiếp)",
      activeAlarm: "ALM-2038 (Tỷ lệ rớt gói 1.8%)",
      cli: "show interface wan-02 stats",
      tier: "egress"
    },
    {
      id: "Dist-03",
      label: "Dist-03",
      ip: "10.244.1.3",
      type: "Distribution Switch",
      model: "Cisco Catalyst 9500",
      x: 630,
      y: 180,
      radius: 23,
      status: "normal",
      uptime: "210 ngày",
      cpuLoad: "18%",
      activeAlarm: "Bình thường",
      cli: "show ip ospf neighbor",
      tier: "distribution"
    },
    {
      id: "Srv-A",
      label: "Srv-A",
      ip: "10.244.10.11",
      type: "Application Server",
      model: "Dell PowerEdge R750",
      x: 90,
      y: 430,
      width: 40,
      height: 24,
      status: "normal",
      tier: "host"
    },
    {
      id: "Srv-B",
      label: "Srv-B",
      ip: "10.244.10.12",
      type: "Database Host",
      model: "Dell PowerEdge R750",
      x: 250,
      y: 430,
      width: 40,
      height: 24,
      status: "normal",
      tier: "host"
    }
  ],
  edges: [
    {
      id: "edge-fault",
      source: "SW-HN-02",
      target: "R-HN-01",
      sourcePort: "UPLINK-03",
      targetPort: "WAN-01",
      speed: "10G",
      type: "Single-mode Fiber",
      status: "fault",
      badgeText: "CRC: 1.25k/m (Lỗi)",
      l3Subnet: "10.244.12.0/30 (BGP Peer)"
    },
    {
      id: "edge-impact",
      source: "R-HN-01",
      target: "R-HN-07",
      sourcePort: "WAN-02",
      targetPort: "EGRESS-01",
      speed: "10G",
      type: "Optical Link",
      status: "impact",
      badgeText: "Rớt gói 1.8%",
      l3Subnet: "10.244.18.0/30 (OSPF Weight 50)"
    },
    {
      id: "edge-dist03",
      source: "R-HN-01",
      target: "Dist-03",
      sourcePort: "TEN-0/1",
      targetPort: "TEN-1/1",
      speed: "40G",
      type: "Core Trunk",
      status: "normal"
    },
    {
      id: "edge-hosta",
      source: "SW-HN-02",
      target: "Srv-A",
      sourcePort: "GE-0/1",
      targetPort: "ETH-0",
      speed: "1G",
      type: "Copper",
      status: "normal"
    },
    {
      id: "edge-hostb",
      source: "SW-HN-02",
      target: "Srv-B",
      sourcePort: "GE-0/2",
      targetPort: "ETH-0",
      speed: "1G",
      type: "Copper",
      status: "normal"
    }
  ]
};

const TIMELINE_STEPS = [
  { step: 1, time: "13:58", title: "ALM-2035", desc: "Nhiệt độ SFP cao tại SW-HN-02", percent: "10%" },
  { step: 2, time: "14:32", title: "ALM-2041 (Gốc)", desc: "Bùng phát lỗi CRC tại WAN-01", percent: "62%", isRoot: true },
  { step: 3, time: "14:33", title: "ALM-2038", desc: "Rớt gói do rẽ tiếp sang R-HN-07", percent: "72%" },
  { step: 4, time: "Hiện tại", title: "14:45", desc: "Đang mở phiên điều tra sự cố", percent: "95%", isCurrent: true }
];
