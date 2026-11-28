import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AlarmSummary } from '@/api/incidents'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import type { TelemetryMockData } from './inspector'
import { TopologyRightSidebar } from './TopologyRightSidebar'
import { sampleNodes, sampleLinks } from './canvas/mockTopologyData'

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
  },
})

const meta: Meta<typeof TopologyRightSidebar> = {
  title: 'Topology/TopologyRightSidebar',
  component: TopologyRightSidebar,
  decorators: [
    (Story) => (
      <QueryClientProvider client={storyQueryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    onCloseInspect: () => {},
  },
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TopologyRightSidebar>

const mockCoreNode: DeviceSummary = {
  id: 'CORE-02',
  name: 'hn-core-02',
  layer: 'CORE',
  region: 'North',
  site: 'SITE-2',
  ipAddress: '10.244.1.2',
  model: 'Cisco ASR-9922',
  status: 'CRITICAL',
  accessDeviceCount: 0,
  accessErrorCount: 0,
}

const mockLink: LinkSummary = {
  linkId: 'LNK-CORE-AGG-02',
  sourceDeviceId: 'CORE-02',
  targetDeviceId: 'AGG-02',
  sourcePort: 'HundredGig0/0/0/1',
  targetPort: 'HundredGig0/0/0/2',
  linkType: 'PHYSICAL_FIBER',
  capacityGbps: 100,
  operStatus: 'DOWN',
  utilizationPercent: 0,
}

/** Story 1: Unselected default state showing network health cards (Dark Mode) */
export const UnselectedOverviewDark: Story = {
  args: {
    locale: 'vi',
    nodes: sampleNodes,
    links: sampleLinks,
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 2: Unselected default state in Light Mode */
export const UnselectedOverviewLight: Story = {
  args: {
    locale: 'vi',
    nodes: sampleNodes,
    links: sampleLinks,
  },
  render: (args) => (
    <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-300 shadow-lg flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 3: Inspecting a selected critical node (Dark Mode) */
export const InspectingNodeDark: Story = {
  args: {
    selectedNode: mockCoreNode,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 4: Inspecting a selected critical node in Light Mode */
export const InspectingNodeLight: Story = {
  args: {
    selectedNode: mockCoreNode,
    locale: 'vi',
  },
  render: (args) => (
    <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-300 shadow-lg flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

const sampleTelemetryMock: TelemetryMockData = {
  snapshot: {
    deviceId: 'AGG-02',
    collectedAt: '2026-11-25T15:11:13.000Z',
    operStatus: 'DEGRADED',
    uptimeSeconds: 3636000,
    loadPercentage: 34.0,
    routesLearned: 1284,
    routesUsed: 976,
    cpuPercent: 78.5,
    memoryPercent: 62.1,
    temperatureCelsius: 52.0,
  },
  availableMetrics: ['CPU', 'TEMPERATURE'],
  seriesByMetric: {
    CPU: {
      deviceId: 'AGG-02',
      metricName: 'CPU',
      unit: '%',
      points: [
        { timestamp: '2026-11-25T14:11:13.000Z', value: 35.0, unit: '%' },
        { timestamp: '2026-11-25T14:21:13.000Z', value: 38.2, unit: '%' },
        { timestamp: '2026-11-25T14:31:13.000Z', value: 41.0, unit: '%' },
        { timestamp: '2026-11-25T14:41:13.000Z', value: 52.5, unit: '%' },
        { timestamp: '2026-11-25T14:51:13.000Z', value: 68.0, unit: '%' },
        { timestamp: '2026-11-25T15:01:13.000Z', value: 74.2, unit: '%' },
        { timestamp: '2026-11-25T15:11:13.000Z', value: 78.5, unit: '%' },
      ],
    },
    TEMPERATURE: {
      deviceId: 'AGG-02',
      metricName: 'TEMPERATURE',
      unit: '°C',
      points: [
        { timestamp: '2026-11-25T14:11:13.000Z', value: 42.0, unit: '°C' },
        { timestamp: '2026-11-25T14:21:13.000Z', value: 43.5, unit: '°C' },
        { timestamp: '2026-11-25T14:31:13.000Z', value: 45.0, unit: '°C' },
        { timestamp: '2026-11-25T14:41:13.000Z', value: 47.2, unit: '°C' },
        { timestamp: '2026-11-25T14:51:13.000Z', value: 49.8, unit: '°C' },
        { timestamp: '2026-11-25T15:01:13.000Z', value: 51.2, unit: '°C' },
        { timestamp: '2026-11-25T15:11:13.000Z', value: 52.0, unit: '°C' },
      ],
    },
  },
}

/** Story 4b: Inspecting a selected node with Status tab open (default: empty chart per §5.3) */
export const InspectingNodeTelemetryTabDark: Story = {
  args: {
    selectedNode: { ...mockCoreNode, status: 'DEGRADED', id: 'AGG-02', layer: 'AGGREGATION' },
    links: sampleLinks,
    initialNodeTab: 'telemetry',
    mockTelemetry: sampleTelemetryMock,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[680px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 4b-2: Status tab with CPU timeseries highlighted & plotted (Dark Mode) */
export const InspectingNodeTelemetryChartActiveDark: Story = {
  args: {
    selectedNode: { ...mockCoreNode, status: 'DEGRADED', id: 'AGG-02', layer: 'AGGREGATION' },
    links: sampleLinks,
    initialNodeTab: 'telemetry',
    initialTelemetryMetric: 'CPU',
    mockTelemetry: sampleTelemetryMock,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[680px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 4b-3: Status tab with Temperature timeseries plotted (Light Mode) */
export const InspectingNodeTelemetryChartActiveLight: Story = {
  args: {
    selectedNode: { ...mockCoreNode, status: 'DEGRADED', id: 'AGG-02', layer: 'AGGREGATION' },
    links: sampleLinks,
    initialNodeTab: 'telemetry',
    initialTelemetryMetric: 'TEMPERATURE',
    mockTelemetry: sampleTelemetryMock,
    locale: 'vi',
  },
  render: (args) => (
    <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 flex items-center justify-center">
      <div className="h-[680px] rounded-lg overflow-hidden border border-slate-300 shadow-lg flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 4c: Inspecting a selected node during an active incident (3 tabs: Identity, Alerts, Status) */
export const InspectingNodeIncident3TabsDark: Story = {
  args: {
    selectedNode: mockCoreNode,
    incidentId: 'INC-2026-0915',
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 4d: Inspecting Huawei Exchange hub with access cluster error badge */
export const InspectingHuaweiExchIdentityDark: Story = {
  args: {
    selectedNode: {
      id: 'EXCH-HN-02',
      name: 'hn-exch-02',
      layer: 'EXCHANGE',
      region: 'Miền Bắc - Hà Nội',
      site: 'EXCH-HN-02',
      ipAddress: '10.100.10.2',
      model: 'Huawei S9704',
      status: 'ACTIVE',
      accessDeviceCount: 12,
      accessErrorCount: 2,
    },
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 5: Inspecting a selected link */
export const InspectingLinkDark: Story = {
  args: {
    selectedLink: mockLink,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

const healthyNodes: DeviceSummary[] = sampleNodes.map((n) => ({
  ...n,
  status: 'ACTIVE',
  accessErrorCount: 0,
}))

const healthyLinks: LinkSummary[] = sampleLinks.map((l) => ({
  ...l,
  operStatus: 'UP',
  utilizationPercent: Math.min(l.utilizationPercent ?? 45, 72),
}))

/** Story 6: Unselected overview when 100% of network nodes & trunks are healthy */
export const UnselectedHealthyNetworkDark: Story = {
  args: {
    locale: 'vi',
    nodes: healthyNodes,
    links: healthyLinks,
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

/** Story 7: Empty network state (0 nodes & 0 links) */
export const UnselectedEmptyNetworkDark: Story = {
  args: {
    locale: 'en',
    nodes: [],
    links: [],
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}

const mockIncidentAlarms: AlarmSummary[] = [
  {
    id: 'ALM-2036',
    deviceId: 'CORE-02',
    timestamp: '2026-11-27T11:13:00Z',
    severity: 'CRITICAL',
    alarmType: 'FAULT_CODE',
    faultCode: 'OPTICS_RX_POWER_LOW',
    message: 'Cường độ tín hiệu RX quang giảm xuống -24.2 dBm (ngưỡng an toàn -22.0 dBm)',
    isCurrentIncident: true,
  },
  {
    id: 'ALM-2037',
    deviceId: 'CORE-02',
    timestamp: '2026-11-27T11:20:00Z',
    severity: 'WARNING',
    alarmType: 'RULE_BASED',
    faultCode: 'BGP_FLAP',
    message: 'BGP session với peer 10.100.1.2 đã flap 3 lần trong 10 phút gần nhất',
    isCurrentIncident: true,
  },
  {
    id: 'ALM-1990',
    deviceId: 'CORE-02',
    timestamp: '2026-11-27T08:10:00Z',
    severity: 'INFO',
    alarmType: 'RULE_BASED',
    faultCode: 'PSU_INPUT_LOST',
    message: 'Nguồn dự phòng PSU-2 từng chuyển mạch trước phiên sự cố hiện tại',
    isCurrentIncident: false,
  },
]

/** Story 8: Node Alerts Tab & Incident Session Lifecycle (§5.2) */
export const InspectingNodeAlertsTabDark: Story = {
  args: {
    selectedNode: mockCoreNode,
    incidentId: 'INC-2026-0915',
    incidentStatus: 'INVESTIGATING',
    incidentAlarms: mockIncidentAlarms,
    initialNodeTab: 'alerts',
    onUpdateIncidentStatus: async () => {},
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800 flex items-center justify-center">
      <div className="h-[620px] rounded-lg overflow-hidden border border-slate-800 shadow-xl flex">
        <TopologyRightSidebar {...args} />
      </div>
    </div>
  ),
}
