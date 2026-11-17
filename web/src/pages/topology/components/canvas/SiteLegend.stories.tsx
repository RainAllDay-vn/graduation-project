import type { Meta, StoryObj } from '@storybook/react'
import { SiteLegend } from './SiteLegend'

const meta: Meta<typeof SiteLegend> = {
  title: 'Topology/Canvas/SiteLegend',
  component: SiteLegend,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SiteLegend>

export const Default: Story = {
  args: {
    className: 'relative bottom-auto left-auto',
  },
  render: (args) => (
    <div className="dark p-8 bg-[#0b0f19] rounded-xl flex items-center justify-center">
      <SiteLegend {...args} />
    </div>
  ),
}

export const WithCounts: Story = {
  args: {
    className: 'relative bottom-auto left-auto',
    siteCounts: {
      'SITE-1': 18,
      'SITE-2': 24,
      'SITE-3': 16,
      'SITE-4': 20,
    },
  },
  render: (args) => (
    <div className="dark p-8 bg-[#0b0f19] rounded-xl flex items-center justify-center">
      <SiteLegend {...args} />
    </div>
  ),
}

export const ActiveSiteSelected: Story = {
  args: {
    className: 'relative bottom-auto left-auto',
    selectedSite: 'SITE-1',
    siteCounts: {
      'SITE-1': 18,
      'SITE-2': 24,
      'SITE-3': 16,
      'SITE-4': 20,
    },
  },
  render: (args) => (
    <div className="dark p-8 bg-[#0b0f19] rounded-xl flex items-center justify-center">
      <SiteLegend {...args} />
    </div>
  ),
}

export const LightMode: Story = {
  args: {
    className: 'relative bottom-auto left-auto',
    selectedSite: 'SITE-2',
    siteCounts: {
      'SITE-1': 18,
      'SITE-2': 24,
      'SITE-3': 16,
      'SITE-4': 20,
    },
  },
  render: (args) => (
    <div className="p-8 bg-[#f8fafc] border border-slate-200 rounded-xl flex items-center justify-center">
      <SiteLegend {...args} />
    </div>
  ),
}
