import type { Meta, StoryObj } from '@storybook/react'
import { TopologyLeftSidebar } from './TopologyLeftSidebar'

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

/** Story 1: Standard infrastructure overview mode (2 tabs: Devices & Display) */
export const OverviewModeDark: Story = {
  args: {
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

/** Story 3: Contextual incident mode (Unlocks 4 tabs: Timeline, Hypotheses, Devices, Display) */
export const IncidentElevationDark: Story = {
  args: {
    incidentId: 'INC-2026-0915',
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

/** Story 4: English locale typography */
export const EnglishLocale: Story = {
  args: {
    incidentId: 'INC-2026-0915',
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
