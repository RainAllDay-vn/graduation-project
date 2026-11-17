import type { Meta, StoryObj } from '@storybook/react'
import { TopologyHeader } from './TopologyHeader'

const meta: Meta<typeof TopologyHeader> = {
  title: 'Topology/TopologyHeader',
  component: TopologyHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TopologyHeader>

/** Story 1: Free infrastructure exploration in dark mode */
export const OverviewModeDark: Story = {
  args: {
    totalNodes: 78,
    totalLinks: 152,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800">
      <TopologyHeader {...args} />
    </div>
  ),
}

/** Story 2: Free infrastructure exploration in light mode */
export const OverviewModeLight: Story = {
  args: {
    totalNodes: 78,
    totalLinks: 152,
    locale: 'vi',
  },
  render: (args) => (
    <div className="bg-slate-100 p-6 rounded-xl border border-slate-300">
      <TopologyHeader {...args} />
    </div>
  ),
}

/** Story 3: Contextual incident elevation with pulsing amber badge */
export const IncidentElevationDark: Story = {
  args: {
    incidentId: 'INC-2026-0915',
    incidentTitle: 'Mất liên lạc Core BGP giữa Core-02 và Agg-02',
    incidentStatus: 'ĐANG XỬ LÝ',
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800">
      <TopologyHeader {...args} />
    </div>
  ),
}

/** Story 4: Contextual incident elevation in light mode */
export const IncidentElevationLight: Story = {
  args: {
    incidentId: 'INC-2026-0915',
    incidentTitle: 'Mất liên lạc Core BGP giữa Core-02 và Agg-02',
    incidentStatus: 'ĐANG XỬ LÝ',
    locale: 'vi',
  },
  render: (args) => (
    <div className="bg-slate-100 p-6 rounded-xl border border-slate-300">
      <TopologyHeader {...args} />
    </div>
  ),
}

/** Story 5: Ego-Network focused router mode */
export const FocusedNodeMode: Story = {
  args: {
    focusNodeId: 'CORE-02',
    focusHop: 2,
    locale: 'vi',
  },
  render: (args) => (
    <div className="dark bg-[#070a10] p-6 rounded-xl border border-slate-800">
      <TopologyHeader {...args} />
    </div>
  ),
}
