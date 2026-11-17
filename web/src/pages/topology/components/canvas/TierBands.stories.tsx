import type { Meta, StoryObj } from '@storybook/react-vite'
import type { DeviceSummary } from '@/api/topology'
import { computeStratifiedLayout, DEFAULT_CANVAS_DIMENSIONS } from './layoutEngine'
import { TierBands } from './TierBands'
import { TopologyCanvas } from './TopologyCanvas'

const sampleNodes: DeviceSummary[] = [
  {
    id: 'PEER-01',
    name: 'Peering Transit 01',
    layer: 'PEER',
    region: 'North',
    site: 'SITE-1',
    ipAddress: '10.244.0.10',
    model: 'Cisco ASR-9904',
    status: 'ACTIVE',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'IGW-01',
    name: 'International Gateway 01',
    layer: 'IGW',
    region: 'North',
    site: 'SITE-2',
    ipAddress: '10.244.0.11',
    model: 'Cisco ASR-9922',
    status: 'ACTIVE',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'CORE-01',
    name: 'Core Backbone 01',
    layer: 'CORE',
    region: 'North',
    site: 'SITE-1',
    ipAddress: '10.244.1.1',
    model: 'Cisco ASR-9922',
    status: 'ACTIVE',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'CORE-02',
    name: 'Core Backbone 02',
    layer: 'CORE',
    region: 'North',
    site: 'SITE-2',
    ipAddress: '10.244.1.2',
    model: 'Cisco ASR-9922',
    status: 'CRITICAL',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'AGG-01',
    name: 'Aggregation Node 01',
    layer: 'AGGREGATION',
    region: 'North',
    site: 'SITE-1',
    ipAddress: '10.244.2.1',
    model: 'Cisco NCS-5508',
    status: 'ACTIVE',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'AGG-02',
    name: 'Aggregation Node 02',
    layer: 'AGGREGATION',
    region: 'North',
    site: 'SITE-2',
    ipAddress: '10.244.2.2',
    model: 'Cisco NCS-5508',
    status: 'DEGRADED',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'AGG-03',
    name: 'Aggregation Node 03',
    layer: 'AGGREGATION',
    region: 'North',
    site: 'SITE-3',
    ipAddress: '10.244.2.3',
    model: 'Cisco NCS-5508',
    status: 'ACTIVE',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'EXCH-01',
    name: 'Metro Exchange 01',
    layer: 'EXCHANGE',
    region: 'North',
    site: 'SITE-1',
    ipAddress: '10.244.3.1',
    model: 'Huawei S9704',
    status: 'ACTIVE',
    accessDeviceCount: 14,
    accessErrorCount: 0,
  },
  {
    id: 'EXCH-02',
    name: 'Metro Exchange 02',
    layer: 'EXCHANGE',
    region: 'North',
    site: 'SITE-2',
    ipAddress: '10.244.3.2',
    model: 'Huawei S9704',
    status: 'ACTIVE',
    accessDeviceCount: 12,
    accessErrorCount: 2,
  },
  {
    id: 'ACC-01',
    name: 'Access Switch Cluster 01',
    layer: 'ACCESS',
    region: 'North',
    site: 'SITE-1',
    ipAddress: '10.244.4.1',
    model: 'Huawei CloudEngine 6800',
    status: 'ACTIVE',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
]

const emptyLayout = computeStratifiedLayout([], { width: 1200, height: 844 })
const sampleLayout = computeStratifiedLayout(sampleNodes, { width: 1200, height: 844 })

const meta: Meta<typeof TierBands> = {
  title: 'Topology/Canvas/TierBands',
  component: TierBands,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TierBands>

const renderInSvgLight = (Story: any) => (
  <div className="w-full max-w-[1200px] h-[750px] bg-[#f8fafc] p-4 rounded-xl border border-slate-200 shadow-xs overflow-hidden flex items-center justify-center">
    <svg
      viewBox={`0 0 ${DEFAULT_CANVAS_DIMENSIONS.width} ${DEFAULT_CANVAS_DIMENSIONS.height}`}
      className="w-full h-full block"
    >
      <Story />
    </svg>
  </div>
)

const renderInSvgDark = (Story: any) => (
  <div className="dark w-full max-w-[1200px] h-[750px] bg-[#0b0f19] p-4 rounded-xl border border-slate-800 shadow-xs overflow-hidden flex items-center justify-center">
    <svg
      viewBox={`0 0 ${DEFAULT_CANVAS_DIMENSIONS.width} ${DEFAULT_CANVAS_DIMENSIONS.height}`}
      className="w-full h-full block"
    >
      <Story />
    </svg>
  </div>
)

export const Default: Story = {
  decorators: [renderInSvgLight],
  args: {
    tierBounds: emptyLayout.tierBounds,
    dimensions: emptyLayout.dimensions,
    locale: 'vi',
    showCenterlines: true,
    showCounts: true,
  },
}

export const EnglishLocale: Story = {
  decorators: [renderInSvgLight],
  args: {
    tierBounds: emptyLayout.tierBounds,
    dimensions: emptyLayout.dimensions,
    locale: 'en',
    showCenterlines: true,
    showCounts: true,
  },
}

export const WithSampleNodesLayout: Story = {
  decorators: [renderInSvgLight],
  args: {
    tierBounds: sampleLayout.tierBounds,
    dimensions: sampleLayout.dimensions,
    locale: 'vi',
    showCenterlines: true,
    showCounts: true,
  },
}

export const WithoutCenterlines: Story = {
  decorators: [renderInSvgLight],
  args: {
    tierBounds: sampleLayout.tierBounds,
    dimensions: sampleLayout.dimensions,
    locale: 'vi',
    showCenterlines: false,
    showCounts: true,
  },
}

export const DarkMode: Story = {
  decorators: [renderInSvgDark],
  args: {
    tierBounds: sampleLayout.tierBounds,
    dimensions: sampleLayout.dimensions,
    locale: 'vi',
    showCenterlines: true,
    showCounts: true,
  },
}

export const FullTopologyCanvas: StoryObj<typeof TopologyCanvas> = {
  render: () => (
    <div className="w-full max-w-[1200px] h-[750px] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <TopologyCanvas
        nodes={sampleNodes}
        locale="vi"
        showCenterlines={true}
        showCounts={true}
      />
    </div>
  ),
}

export const FullTopologyCanvasDark: StoryObj<typeof TopologyCanvas> = {
  decorators: [
    (Story) => (
      <div className="dark bg-[#020617] p-2 rounded-xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="w-full max-w-[1200px] h-[750px] rounded-xl border border-slate-800 shadow-xs overflow-hidden">
      <TopologyCanvas
        nodes={sampleNodes}
        locale="vi"
        showCenterlines={true}
        showCounts={true}
      />
    </div>
  ),
}
