import type { Meta, StoryObj } from '@storybook/react-vite'
import type { AlarmSummary } from '@/api/incidents'
import { TopologyLeftSidebar } from './TopologyLeftSidebar'
import { sampleNodes } from './canvas/mockTopologyData'

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

