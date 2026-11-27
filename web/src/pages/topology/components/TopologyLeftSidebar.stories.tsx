import type { Meta, StoryObj } from '@storybook/react-vite'
import type { AlarmSummary } from '@/api/incidents'
import type { HypothesisDetails, HypothesisSummary } from '@/api/hypotheses'
import { TopologyLeftSidebar } from './TopologyLeftSidebar'
import { sampleNodes } from './canvas/mockTopologyData'

const sampleHypotheses: HypothesisSummary[] = [
  {
    id: 1,
    rank: 1,
    matchScore: 88,
    title: 'Suy hao tín hiệu cáp quang CORE-02 ↔ AGG-02',
    shortTitle: 'Suy hao tín hiệu cáp quang',
    targetType: 'EDGE',
    targetId: 'CORE-02 ↔ AGG-02',
    status: 'UNDER_CONSIDERATION',
    cliCommand: 'show interfaces transceiver HundredGigE0/0/1 detail',
  },
  {
    id: 2,
    rank: 2,
    matchScore: 74,
    title: 'Lỗi giao diện phần cứng / Thẻ module quang SFP+ bị hỏng',
    shortTitle: 'Thẻ module quang lỗi',
    targetType: 'NODE',
    targetId: 'SW-HN-02',
    status: 'UNDER_CONSIDERATION',
    cliCommand: 'show environment temperature',
  },
  {
    id: 3,
    rank: 3,
    matchScore: 45,
    title: 'Quá tải CPU điều khiển dẫn đến BGP Keepalive Timeout',
    shortTitle: 'BGP Keepalive Timeout do CPU',
    targetType: 'NODE',
    targetId: 'SW-HN-02',
    status: 'REJECTED',
    cliCommand: 'show processes cpu sorted',
  },
]

const sampleHypothesisDetails: Record<number, HypothesisDetails> = {
  1: {
    ...sampleHypotheses[0],
    incidentId: 'INC-2026-0915',
    sourceNode: 'CORE-02',
    targetNode: 'AGG-02',
    confidenceRationale:
      'Công suất RX quang -24.2 dBm dưới ngưỡng an toàn (-22.0 dBm), kết hợp BGP flap 3 lần.',
    evidence: [
      'Công suất RX quang -24.2 dBm',
      'BGP neighbor Down/Up 3 lần trong 10 phút',
    ],
    contradictingEvidence: ['TX CORE-02 duy trì +1.2 dBm'],
    verificationCmd: 'show ip bgp summary',
    createdAt: '2026-11-27T11:05:00Z',
  },
  3: {
    ...sampleHypotheses[2],
    incidentId: 'INC-2026-0915',
    sourceNode: 'SW-HN-02',
    rejectionReason: 'CPU chỉ 24.5%, OSPF vẫn Full',
    evidence: ['BGP Hold Timer Expired'],
    contradictingEvidence: ['CPU control plane bình thường (24.5%)'],
    createdAt: '2026-11-27T11:06:00Z',
  },
}

const sampleAlarms: AlarmSummary[] = [
  {
    id: 'ALM-2037',
    deviceId: 'CORE-02',
    timestamp: '2026-11-27T11:20:00Z',
    severity: 'WARNING',
    alarmType: 'RULE_BASED',
    faultCode: 'BGP_FLAP',
    message: 'BGP session với peer PEER-01 đã flap 3 lần trong 10 phút gần nhất',
    isCurrentIncident: true,
  },
  {
    id: 'ALM-2036',
    deviceId: 'CORE-02',
    timestamp: '2026-11-27T11:13:00Z',
    severity: 'CRITICAL',
    alarmType: 'FAULT_CODE',
    faultCode: 'OPTICS_RX_POWER_LOW',
    message: 'Cường độ tín hiệu RX quang giảm xuống -24.2 dBm (ngưỡng -22.0 dBm)',
    isCurrentIncident: true,
  },
  {
    id: 'ALM-2035',
    deviceId: 'AGG-02',
    timestamp: '2026-11-27T11:07:00Z',
    severity: 'ERROR',
    alarmType: 'FAULT_CODE',
    faultCode: 'OPTICS_TEMP_HIGH',
    message: 'Nhiệt độ module quang vượt ngưỡng 78°C (ngưỡng 75°C)',
    isCurrentIncident: true,
  },
]

const meta: Meta<typeof TopologyLeftSidebar> = {
  title: 'Topology/TopologyLeftSidebar',
  component: TopologyLeftSidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TopologyLeftSidebar>

/** Story 1: Standard infrastructure overview mode (Tab Thiết bị & Hiển thị) - Dark Mode */
export const OverviewModeDark: Story = {
  args: {
    nodes: sampleNodes,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 2: Standard overview mode in Light Mode */
export const OverviewModeLight: Story = {
  args: {
    nodes: sampleNodes,
    locale: 'vi',
  },
  render: (args) => (
    <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-300 shadow-lg flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 3: Device Selected state (CORE-02 selected) */
export const DeviceSelectedState: Story = {
  args: {
    nodes: sampleNodes,
    selectedNodeId: 'CORE-02',
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 4: Empty directory state (0 devices) */
export const EmptyDirectory: Story = {
  args: {
    nodes: [],
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 5: Contextual incident mode (Unlocks 4 tabs: Timeline, Hypotheses, Devices, Display) */
export const IncidentElevationDark: Story = {
  args: {
    incidentId: 'INC-2026-0915',
    alarms: sampleAlarms,
    selectedAlarmId: 'ALM-2036',
    nodes: sampleNodes,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 6: English locale typography */
export const EnglishLocale: Story = {
  args: {
    incidentId: 'INC-2026-0915',
    alarms: sampleAlarms,
    selectedAlarmId: 'ALM-2037',
    nodes: sampleNodes,
    locale: 'en',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 7: Tab Hiển thị (Display Settings) in Dark Mode */
export const DisplayTabDark: Story = {
  args: {
    nodes: sampleNodes,
    initialTab: 'layers',
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 8: Tab Hiển thị (Display Settings) in Light Mode */
export const DisplayTabLight: Story = {
  args: {
    nodes: sampleNodes,
    initialTab: 'layers',
    locale: 'vi',
  },
  render: (args) => (
    <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-300 shadow-lg flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 9: Tab Hiển thị with custom toggles & 2-Hop */
export const DisplayTabCustomToggled: Story = {
  args: {
    nodes: sampleNodes,
    initialTab: 'layers',
    displaySettings: {
      showTierBands: true,
      showCenterlines: false,
      showCounts: false,
      showPortLabels: true,
    },
    kHop: 2,
    filterMode: 'prune',
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 10: AI Hypothesis Tab in Dark Mode (§4.3) */
export const HypothesisTabDark: Story = {
  args: {
    incidentId: 'INC-2026-0915',
    initialTab: 'hypothesis',
    hypotheses: sampleHypotheses,
    expandedHypothesisId: 1,
    expandedHypothesisDetails: sampleHypothesisDetails[1],
    hypothesisDetailsById: sampleHypothesisDetails,
    nodes: sampleNodes,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyLeftSidebar {...args} />
      </div>
    </div>
  ),
}

