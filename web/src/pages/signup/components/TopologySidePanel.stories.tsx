import type { Meta, StoryObj } from '@storybook/react-vite'
import { TopologySidePanel } from './TopologySidePanel'

const meta: Meta<typeof TopologySidePanel> = {
  title: 'Auth/TopologySidePanel',
  component: TopologySidePanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Vietnamese: Story = {
  render: (args) => (
    <div className="flex h-screen w-full">
      <div className="flex-1 bg-white flex items-center justify-center text-slate-400 font-mono text-sm">
        Main Form Pane (Left)
      </div>
      <TopologySidePanel {...args} />
    </div>
  ),
  args: {
    locale: 'vi',
  },
}

export const English: Story = {
  render: (args) => (
    <div className="flex h-screen w-full">
      <div className="flex-1 bg-white flex items-center justify-center text-slate-400 font-mono text-sm">
        Main Form Pane (Left)
      </div>
      <TopologySidePanel {...args} />
    </div>
  ),
  args: {
    locale: 'en',
  },
}
