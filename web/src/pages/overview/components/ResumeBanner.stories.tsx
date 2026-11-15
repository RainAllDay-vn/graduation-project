import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResumeBanner } from './ResumeBanner'

const meta: Meta<typeof ResumeBanner> = {
  title: 'Overview/ResumeBanner',
  component: ResumeBanner,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Vietnamese: Story = {
  args: {
    incidentId: 'INC-2026-0915',
    regionOrSite: 'SITE-2',
    locale: 'vi',
    onResume: () => {},
    onDismiss: () => {},
  },
}

export const English: Story = {
  args: {
    incidentId: 'INC-2026-0915',
    regionOrSite: 'North Region - Hanoi',
    locale: 'en',
    onResume: () => {},
    onDismiss: () => {},
  },
}
