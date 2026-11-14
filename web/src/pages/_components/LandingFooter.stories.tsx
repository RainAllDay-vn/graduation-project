import type { Meta, StoryObj } from '@storybook/react-vite'
import { LandingFooter } from './LandingFooter'

const meta: Meta<typeof LandingFooter> = {
  title: 'Landing/LandingFooter',
  component: LandingFooter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Vietnamese: Story = {
  args: {
    version: 'v0.4',
    environment: 'TEST',
    supportContact: 'IT NỘI BỘ',
    locale: 'vi',
  },
}

export const English: Story = {
  args: {
    version: 'v0.4',
    environment: 'TEST',
    supportContact: 'INTERNAL IT',
    locale: 'en',
  },
}
