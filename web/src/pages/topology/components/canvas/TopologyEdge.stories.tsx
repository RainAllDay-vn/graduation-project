import type { Meta, StoryObj } from '@storybook/react-vite'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { TopologyCanvas } from './TopologyCanvas'
import { TopologyEdge } from './TopologyEdge'

const mockSource = { x: 140, y: 50 }
const mockTarget = { x: 360, y: 150 }

const mockLinkBase: LinkSummary = {
  linkId: 'LNK-01',
  sourceDeviceId: 'CORE-01',
  targetDeviceId: 'AGG-01',
  sourcePort: 'TenGig0/0/0/1',
  targetPort: 'TenGig0/0/0/0',
  linkType: 'PHYSICAL_FIBER',
  capacityGbps: 100,
  operStatus: 'UP',
  utilizationPercent: 85,
  isBackup: false,
}

const meta: Meta<typeof TopologyEdge> = {
  title: 'Topology/Canvas/TopologyEdge',
  component: TopologyEdge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TopologyEdge>

const renderInSvgLight = (w = 500, h = 200) => (Story: any) => (
  <div className="w-[500px] h-[200px] bg-[#f8fafc] rounded-xl border border-slate-200 p-4 flex items-center justify-center">
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full block">
      <Story />
    </svg>
  </div>
)

const renderInSvgDark = (w = 500, h = 200) => (Story: any) => (
  <div className="dark w-[500px] h-[200px] bg-[#0b0f19] rounded-xl border border-slate-800 p-4 flex items-center justify-center">
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full block">
      <Story />
    </svg>
  </div>
)

export const SingleHealthyEdge: Story = {
  decorators: [renderInSvgDark()],
  args: {
    link: mockLinkBase,
    sourcePos: mockSource,
    targetPos: mockTarget,
    isSelected: false,
    isHovered: false,
    isDimmed: false,
  },
}

export const SingleHealthyEdgeLight: Story = {
  decorators: [renderInSvgLight()],
  args: {
    link: mockLinkBase,
    sourcePos: mockSource,
    targetPos: mockTarget,
    isSelected: false,
    isHovered: false,
    isDimmed: false,
  },
}

export const AllHealthColors: Story = {
  decorators: [renderInSvgDark(600, 220)],
  render: () => (
    <g>
      {/* 1. Healthy (Emerald) */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-HEALTHY', operStatus: 'UP' }}
        sourcePos={{ x: 60, y: 40 }}
        targetPos={{ x: 180, y: 170 }}
      />
      {/* 2. Degraded (Amber) */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-DEGRADED', operStatus: 'DEGRADED' }}
        sourcePos={{ x: 240, y: 40 }}
        targetPos={{ x: 360, y: 170 }}
      />
      {/* 3. Critical (Bright Red) */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-CRITICAL', operStatus: 'DOWN' }}
        sourcePos={{ x: 420, y: 40 }}
        targetPos={{ x: 540, y: 170 }}
      />
    </g>
  ),
}

export const AllBandwidthTiers: Story = {
  decorators: [renderInSvgDark(600, 220)],
  render: () => (
    <g>
      {/* Sub-10G (1.5px) */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-1G', capacityGbps: 1 }}
        sourcePos={{ x: 60, y: 40 }}
        targetPos={{ x: 180, y: 170 }}
      />
      {/* 10G-40G (2.5px) */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-10G', capacityGbps: 10 }}
        sourcePos={{ x: 240, y: 40 }}
        targetPos={{ x: 360, y: 170 }}
      />
      {/* 100G (3.8px) */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-100G', capacityGbps: 100 }}
        sourcePos={{ x: 420, y: 40 }}
        targetPos={{ x: 540, y: 170 }}
      />
    </g>
  ),
}

export const UtilizationDashPatterns: Story = {
  decorators: [renderInSvgDark(600, 220)],
  render: () => (
    <g>
      {/* Low utilization / Backup (<15% -> "2 8") */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-LOW', utilizationPercent: 5, isBackup: true }}
        sourcePos={{ x: 60, y: 40 }}
        targetPos={{ x: 180, y: 170 }}
      />
      {/* Medium utilization (15%-70% -> "7 3.5") */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-MED', utilizationPercent: 45 }}
        sourcePos={{ x: 240, y: 40 }}
        targetPos={{ x: 360, y: 170 }}
      />
      {/* Full utilization (>=70% -> solid) */}
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-FULL', utilizationPercent: 92 }}
        sourcePos={{ x: 420, y: 40 }}
        targetPos={{ x: 540, y: 170 }}
      />
    </g>
  ),
}

export const SameTierRingLink: Story = {
  decorators: [renderInSvgDark(500, 200)],
  render: () => (
    <g>
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-RING', capacityGbps: 100 }}
        sourcePos={{ x: 120, y: 120 }}
        targetPos={{ x: 380, y: 120 }}
      />
    </g>
  ),
}

export const SelectedAndBlastRadius: Story = {
  decorators: [renderInSvgDark(500, 200)],
  render: () => (
    <g>
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-SEL' }}
        sourcePos={{ x: 80, y: 40 }}
        targetPos={{ x: 220, y: 160 }}
        isSelected={true}
      />
      <TopologyEdge
        link={{ ...mockLinkBase, linkId: 'L-BLAST', operStatus: 'DOWN' }}
        sourcePos={{ x: 280, y: 40 }}
        targetPos={{ x: 420, y: 160 }}
        isBlastRadius={true}
      />
    </g>
  ),
}

export const WithAndWithoutPortLabels: Story = {
  decorators: [renderInSvgDark(500, 220)],
  render: () => (
    <g>
      <TopologyEdge
        link={{
          ...mockLinkBase,
          linkId: 'L-WITH-PORTS',
          sourcePort: 'HundredGig0/0/0/1',
          targetPort: 'HundredGig0/0/0/2',
        }}
        sourcePos={{ x: 100, y: 40 }}
        targetPos={{ x: 200, y: 160 }}
        showPortLabels={true}
      />
      <TopologyEdge
        link={{
          ...mockLinkBase,
          linkId: 'L-WITHOUT-PORTS',
          sourcePort: 'HundredGig0/0/0/1',
          targetPort: 'HundredGig0/0/0/2',
        }}
        sourcePos={{ x: 300, y: 40 }}
        targetPos={{ x: 400, y: 160 }}
        showPortLabels={false}
      />
    </g>
  ),
}

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
]

const sampleLinks: LinkSummary[] = [
  // Tier 1 -> Tier 2 (100G Trunks)
  {
    linkId: 'L-P1-C1',
    sourceDeviceId: 'PEER-01',
    targetDeviceId: 'CORE-01',
    sourcePort: 'HundredGig0/0/0/1',
    targetPort: 'HundredGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'UP',
    utilizationPercent: 78,
  },
  {
    linkId: 'L-P1-C2',
    sourceDeviceId: 'PEER-01',
    targetDeviceId: 'CORE-02',
    sourcePort: 'HundredGig0/0/0/2',
    targetPort: 'HundredGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'DOWN', // Fault link into epicenter
    utilizationPercent: 0,
  },
  {
    linkId: 'L-I1-C1',
    sourceDeviceId: 'IGW-01',
    targetDeviceId: 'CORE-01',
    sourcePort: 'HundredGig0/0/0/1',
    targetPort: 'HundredGig0/0/0/2',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'UP',
    utilizationPercent: 65,
  },
  {
    linkId: 'L-I2-C2',
    sourceDeviceId: 'IGW-02',
    targetDeviceId: 'CORE-02',
    sourcePort: 'HundredGig0/0/0/1',
    targetPort: 'HundredGig0/0/0/2',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'DEGRADED',
    utilizationPercent: 40,
  },
  {
    linkId: 'L-P2-C3',
    sourceDeviceId: 'PEER-02',
    targetDeviceId: 'CORE-03',
    sourcePort: 'HundredGig0/0/0/1',
    targetPort: 'HundredGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'UP',
    utilizationPercent: 82,
  },

  // Tier 2 Core Ring
  {
    linkId: 'L-C1-C2',
    sourceDeviceId: 'CORE-01',
    targetDeviceId: 'CORE-02',
    sourcePort: 'HundredGig0/1/0/0',
    targetPort: 'HundredGig0/1/0/0',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'UP',
    utilizationPercent: 30,
    isBackup: true,
  },
  {
    linkId: 'L-C2-C3',
    sourceDeviceId: 'CORE-02',
    targetDeviceId: 'CORE-03',
    sourcePort: 'HundredGig0/1/0/1',
    targetPort: 'HundredGig0/1/0/0',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'UP',
    utilizationPercent: 88,
  },

  // Tier 2 -> Tier 3 (Dual-Homing 100G/40G)
  {
    linkId: 'L-C1-A1',
    sourceDeviceId: 'CORE-01',
    targetDeviceId: 'AGG-01',
    sourcePort: 'HundredGig0/2/0/1',
    targetPort: 'HundredGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'UP',
    utilizationPercent: 75,
  },
  {
    linkId: 'L-C2-A2',
    sourceDeviceId: 'CORE-02',
    targetDeviceId: 'AGG-02',
    sourcePort: 'HundredGig0/2/0/1',
    targetPort: 'HundredGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 40,
    operStatus: 'DEGRADED',
    utilizationPercent: 60,
  },
  {
    linkId: 'L-C2-A3',
    sourceDeviceId: 'CORE-02',
    targetDeviceId: 'AGG-03',
    sourcePort: 'HundredGig0/2/0/2',
    targetPort: 'HundredGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 40,
    operStatus: 'UP',
    utilizationPercent: 45,
  },
  {
    linkId: 'L-C3-A4',
    sourceDeviceId: 'CORE-03',
    targetDeviceId: 'AGG-04',
    sourcePort: 'HundredGig0/2/0/1',
    targetPort: 'HundredGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'UP',
    utilizationPercent: 70,
  },

  // Tier 3 -> Tier 4 (10G/40G Distribution)
  {
    linkId: 'L-A1-E1',
    sourceDeviceId: 'AGG-01',
    targetDeviceId: 'EXCH-01',
    sourcePort: 'TenGig0/1/0/1',
    targetPort: 'TenGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 10,
    operStatus: 'UP',
    utilizationPercent: 80,
  },
  {
    linkId: 'L-A2-E2',
    sourceDeviceId: 'AGG-02',
    targetDeviceId: 'EXCH-02',
    sourcePort: 'TenGig0/1/0/1',
    targetPort: 'TenGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 10,
    operStatus: 'UP',
    utilizationPercent: 55,
  },
  {
    linkId: 'L-A3-E3',
    sourceDeviceId: 'AGG-03',
    targetDeviceId: 'EXCH-03',
    sourcePort: 'TenGig0/1/0/1',
    targetPort: 'TenGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 10,
    operStatus: 'UP',
    utilizationPercent: 62,
  },
  {
    linkId: 'L-A4-E4',
    sourceDeviceId: 'AGG-04',
    targetDeviceId: 'EXCH-04',
    sourcePort: 'TenGig0/1/0/1',
    targetPort: 'TenGig0/0/0/1',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 10,
    operStatus: 'UP',
    utilizationPercent: 72,
  },
]

export const FullConnectedGraphLight: StoryObj<typeof TopologyCanvas> = {
  render: () => (
    <div className="w-full max-w-[1200px] h-[780px] rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <TopologyCanvas
        nodes={sampleNodes}
        links={sampleLinks}
        selectedNodeId="CORE-02"
        focusNodeId="CORE-02"
        selectedLinkId="L-P1-C2"
        blastRadiusLinkIds={['L-C2-A2', 'L-C2-A3']}
        locale="vi"
      />
    </div>
  ),
}

export const FullConnectedGraphDark: StoryObj<typeof TopologyCanvas> = {
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
        nodes={sampleNodes}
        links={sampleLinks}
        selectedNodeId="CORE-02"
        focusNodeId="CORE-02"
        selectedLinkId="L-P1-C2"
        blastRadiusLinkIds={['L-C2-A2', 'L-C2-A3']}
        locale="vi"
      />
    </div>
  ),
}
