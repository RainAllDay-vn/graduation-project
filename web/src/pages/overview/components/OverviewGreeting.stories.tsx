import type { Meta, StoryObj } from '@storybook/react-vite'
import { OverviewGreeting } from './OverviewGreeting'

const meta: Meta<typeof OverviewGreeting> = {
  title: 'Overview/OverviewGreeting',
  component: OverviewGreeting,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Vietnamese: Story = {
  args: {
    lastUpdatedText: '14:35',
    isRefreshing: false,
    locale: 'vi',
    onRefresh: () => {},
  },
}

export const English: Story = {
  args: {
    lastUpdatedText: '14:35',
    isRefreshing: false,
    locale: 'en',
    onRefresh: () => {},
  },
}

export const Refreshing: Story = {
  args: {
    lastUpdatedText: '14:35',
    isRefreshing: true,
    locale: 'vi',
    onRefresh: () => {},
  },
}
