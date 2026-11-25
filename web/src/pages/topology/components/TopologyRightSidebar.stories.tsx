import type { Meta, StoryObj } from '@storybook/react-vite'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { TopologyRightSidebar } from './TopologyRightSidebar'
import { sampleNodes, sampleLinks } from './canvas/mockTopologyData'

const meta: Meta<typeof TopologyRightSidebar> = {
  title: 'Topology/TopologyRightSidebar',
  component: TopologyRightSidebar,
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

/** Story 4b: Inspecting a selected node with Status tab open */
export const InspectingNodeTelemetryTabDark: Story = {
  args: {
    selectedNode: { ...mockCoreNode, status: 'DEGRADED', id: 'AGG-02', layer: 'AGGREGATION' },
    initialNodeTab: 'telemetry',
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
