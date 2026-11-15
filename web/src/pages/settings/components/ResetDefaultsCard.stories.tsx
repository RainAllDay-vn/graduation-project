import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResetDefaultsCard } from './ResetDefaultsCard'

const meta: Meta<typeof ResetDefaultsCard> = {
  title: 'Settings/ResetDefaultsCard',
  component: ResetDefaultsCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Vietnamese: Story = {
  args: {
    locale: 'vi',
    onReset: () => alert('Reset to defaults confirmed'),
  },
}

export const English: Story = {
  args: {
    locale: 'en',
    onReset: () => alert('Reset to defaults confirmed'),
  },
}
