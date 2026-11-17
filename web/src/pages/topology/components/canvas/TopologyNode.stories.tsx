import type { Meta, StoryObj } from '@storybook/react-vite'
import type { DeviceSummary } from '@/api/topology'
import { TopologyCanvas } from './TopologyCanvas'
import { TopologyNode } from './TopologyNode'

const mockNodeBase: DeviceSummary = {
  id: 'CORE-01',
  name: 'Core Router 01',
  layer: 'CORE',
  region: 'North',
  site: 'SITE-1',
  ipAddress: '10.244.1.1',
  model: 'Cisco ASR-9922',
  status: 'ACTIVE',
  accessDeviceCount: 0,
  accessErrorCount: 0,
}

const meta: Meta<typeof TopologyNode> = {
  title: 'Topology/Canvas/TopologyNode',
  component: TopologyNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TopologyNode>

const renderInSvgBoxLight = (w = 500, h = 200) => (Story: any) => (
  <div className="w-[500px] h-[200px] bg-[#f8fafc] rounded-xl border border-slate-200 p-4 flex items-center justify-center">
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full block">
      <Story />
    </svg>
  </div>
)

const renderInSvgBoxDark = (w = 500, h = 200) => (Story: any) => (
  <div className="dark w-[500px] h-[200px] bg-[#0b0f19] rounded-xl border border-slate-800 p-4 flex items-center justify-center">
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full block">
      <Story />
    </svg>
  </div>
)

export const SingleHealthyNode: Story = {
  decorators: [renderInSvgBoxLight()],
  args: {
    node: mockNodeBase,
    x: 250,
    y: 100,
    isSelected: false,
    isFocused: false,
  },
}

export const SingleHealthyNodeDark: Story = {
  decorators: [renderInSvgBoxDark()],
  args: {
    node: mockNodeBase,
    x: 250,
    y: 100,
    isSelected: false,
    isFocused: false,
  },
}

export const AllHealthStates: Story = {
  decorators: [renderInSvgBoxLight()],
  render: () => (
    <g>
      <TopologyNode
        node={{ ...mockNodeBase, id: 'CORE-01', status: 'ACTIVE' }}
        x={100}
        y={100}
      />
      <TopologyNode
        node={{ ...mockNodeBase, id: 'CORE-02', status: 'DEGRADED' }}
        x={250}
        y={100}
      />
      <TopologyNode
        node={{ ...mockNodeBase, id: 'CORE-03', status: 'CRITICAL' }}
        x={400}
        y={100}
      />
    </g>
  ),
}

export const AllHealthStatesDark: Story = {
  decorators: [renderInSvgBoxDark()],
  render: () => (
    <g>
      <TopologyNode
        node={{ ...mockNodeBase, id: 'CORE-01', status: 'ACTIVE' }}
        x={100}
        y={100}
      />
      <TopologyNode
        node={{ ...mockNodeBase, id: 'CORE-02', status: 'DEGRADED' }}
        x={250}
        y={100}
      />
      <TopologyNode
        node={{ ...mockNodeBase, id: 'CORE-03', status: 'CRITICAL' }}
        x={400}
        y={100}
      />
    </g>
  ),
}

export const AllSites: Story = {
  decorators: [renderInSvgBoxLight()],
  render: () => (
    <g>
      <TopologyNode
        node={{ ...mockNodeBase, id: 'AGG-01', site: 'SITE-1' }}
        x={80}
        y={100}
      />
      <TopologyNode
        node={{ ...mockNodeBase, id: 'AGG-02', site: 'SITE-2' }}
        x={190}
        y={100}
      />
      <TopologyNode
        node={{ ...mockNodeBase, id: 'AGG-03', site: 'SITE-3' }}
        x={300}
        y={100}
      />
      <TopologyNode
        node={{ ...mockNodeBase, id: 'AGG-04', site: 'SITE-4' }}
        x={410}
        y={100}
      />
    </g>
  ),
}

export const ExchangeWithAccessBadge: Story = {
  decorators: [renderInSvgBoxLight()],
  render: () => (
    <g>
      <TopologyNode
        node={{
          ...mockNodeBase,
          id: 'EXCH-01',
          layer: 'EXCHANGE',
          site: 'SITE-1',
          accessDeviceCount: 14,
          accessErrorCount: 0,
        }}
        x={160}
        y={90}
      />
      <TopologyNode
        node={{
          ...mockNodeBase,
          id: 'EXCH-02',
          layer: 'EXCHANGE',
          site: 'SITE-2',
          accessDeviceCount: 12,
          accessErrorCount: 2,
        }}
        x={340}
        y={90}
      />
    </g>
  ),
}

export const ExpandedExchangeBadge: Story = {
  decorators: [renderInSvgBoxLight()],
  args: {
    node: {
      ...mockNodeBase,
      id: 'EXCH-07',
      layer: 'EXCHANGE',
      site: 'SITE-1',
      accessDeviceCount: 14,
      accessErrorCount: 0,
    },
    x: 250,
    y: 90,
    isExpanded: true,
  },
}

export const FocusedWithBeaconRings: Story = {
  decorators: [renderInSvgBoxDark()],
  args: {
    node: {
      ...mockNodeBase,
      id: 'CORE-02',
      site: 'SITE-2',
      status: 'CRITICAL',
    },
    x: 250,
    y: 100,
    isFocused: true,
  },
}

export const SelectedWithHalo: Story = {
  decorators: [renderInSvgBoxLight()],
  args: {
    node: {
      ...mockNodeBase,
      id: 'CORE-01',
      site: 'SITE-1',
      status: 'ACTIVE',
    },
    x: 250,
    y: 100,
    isSelected: true,
  },
}

export const DimmedGhostState: Story = {
  decorators: [renderInSvgBoxDark()],
  render: () => (
    <g>
      <TopologyNode
        node={{ ...mockNodeBase, id: 'CORE-01', site: 'SITE-1' }}
        x={160}
        y={100}
        isDimmed={true}
      />
      <TopologyNode
        node={{ ...mockNodeBase, id: 'CORE-02', site: 'SITE-2', status: 'CRITICAL' }}
        x={340}
        y={100}
        isDimmed={false}
        isSelected={true}
      />
    </g>
  ),
}

const sampleFullNodes: DeviceSummary[] = [
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
    id: 'PEER-02',
    name: 'Peering Transit 02',
    layer: 'PEER',
    region: 'North',
    site: 'SITE-3',
    ipAddress: '10.244.0.12',
    model: 'Cisco ASR-9904',
    status: 'ACTIVE',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'IGW-01',
    name: 'National Border Gateway 01',
    layer: 'IGW',
    region: 'North',
    site: 'SITE-1',
    ipAddress: '10.244.0.11',
    model: 'Cisco ASR-9922',
    status: 'ACTIVE',
    accessDeviceCount: 0,
    accessErrorCount: 0,
  },
  {
    id: 'IGW-02',
    name: 'National Border Gateway 02',
    layer: 'IGW',
    region: 'North',
    site: 'SITE-2',
    ipAddress: '10.244.0.13',
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
    id: 'CORE-03',
    name: 'Core Backbone 03',
    layer: 'CORE',
    region: 'North',
    site: 'SITE-4',
    ipAddress: '10.244.1.3',
    model: 'Cisco ASR-9922',
    status: 'ACTIVE',
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
    id: 'AGG-04',
    name: 'Aggregation Node 04',
    layer: 'AGGREGATION',
    region: 'North',
    site: 'SITE-4',
    ipAddress: '10.244.2.4',
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
    id: 'EXCH-03',
    name: 'Metro Exchange 03',
    layer: 'EXCHANGE',
    region: 'North',
    site: 'SITE-2',
    ipAddress: '10.244.3.3',
    model: 'Huawei S9704',
    status: 'ACTIVE',
    accessDeviceCount: 18,
    accessErrorCount: 0,
  },
  {
    id: 'EXCH-04',
    name: 'Metro Exchange 04',
    layer: 'EXCHANGE',
    region: 'North',
    site: 'SITE-3',
    ipAddress: '10.244.3.4',
    model: 'Huawei S9704',
    status: 'ACTIVE',
    accessDeviceCount: 16,
    accessErrorCount: 0,
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

export const NodesOnStratifiedCanvasLight: StoryObj<typeof TopologyCanvas> = {
  render: () => (
    <div className="w-full max-w-[1200px] h-[780px] rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <TopologyCanvas
        nodes={sampleFullNodes}
        selectedNodeId="CORE-02"
        focusNodeId="CORE-02"
        expandedNodeIds={['EXCH-01']}
        locale="vi"
      />
    </div>
  ),
}

export const NodesOnStratifiedCanvasDark: StoryObj<typeof TopologyCanvas> = {
  decorators: [
    (Story) => (
      <div className="dark bg-[#020617] p-2 rounded-xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="w-full max-w-[1200px] h-[780px] rounded-xl border border-slate-800 shadow-xs overflow-hidden">
      <TopologyCanvas
        nodes={sampleFullNodes}
        selectedNodeId="CORE-02"
        focusNodeId="CORE-02"
        expandedNodeIds={['EXCH-01']}
        locale="vi"
      />
    </div>
  ),
}
