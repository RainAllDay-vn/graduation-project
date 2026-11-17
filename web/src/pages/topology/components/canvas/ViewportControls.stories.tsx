import type { Meta, StoryObj } from '@storybook/react'
import { ViewportControls } from './ViewportControls'

const meta: Meta<typeof ViewportControls> = {
  title: 'Topology/Canvas/ViewportControls',
  component: ViewportControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ViewportControls>

export const Default: Story = {
  args: {
    className: 'relative top-auto right-auto',
  },
  render: (args) => (
    <div className="dark p-8 bg-[#0b0f19] rounded-xl flex items-center justify-center">
      <ViewportControls {...args} />
    </div>
  ),
}

export const WithZoomLevel: Story = {
  args: {
    className: 'relative top-auto right-auto',
    zoom: 1.25,
  },
  render: (args) => (
    <div className="dark p-8 bg-[#0b0f19] rounded-xl flex items-center justify-center">
      <ViewportControls {...args} />
    </div>
  ),
}

export const LimitsDisabled: Story = {
  args: {
    className: 'relative top-auto right-auto',
    zoom: 2.5,
    disableZoomIn: true,
  },
  render: (args) => (
    <div className="dark p-8 bg-[#0b0f19] rounded-xl flex items-center justify-center">
      <ViewportControls {...args} />
    </div>
  ),
}

export const LightMode: Story = {
  args: {
    className: 'relative top-auto right-auto',
    zoom: 1.0,
  },
  render: (args) => (
    <div className="p-8 bg-[#f8fafc] border border-slate-200 rounded-xl flex items-center justify-center">
      <ViewportControls {...args} />
    </div>
  ),
}
