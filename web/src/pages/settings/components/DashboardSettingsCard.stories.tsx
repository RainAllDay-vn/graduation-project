import type { Meta, StoryObj } from '@storybook/react-vite'
import { DashboardSettingsCard } from './DashboardSettingsCard'

const meta: Meta<typeof DashboardSettingsCard> = {
  title: 'Settings/DashboardSettingsCard',
  component: DashboardSettingsCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultVietnamese: Story = {
  args: {
    settings: {
      showDeviceLabels: true,
      autoSelectOnAlarm: true,
      blastRadiusBeacon: true,
      showIpInPicker: false,
      promptResumeInvestigation: true,
    },
    locale: 'vi',
    onToggle: (key, val) => console.log('Toggled', key, val),
  },
}

export const AllEnabledEnglish: Story = {
  args: {
    settings: {
      showDeviceLabels: true,
      autoSelectOnAlarm: true,
      blastRadiusBeacon: true,
      showIpInPicker: true,
      promptResumeInvestigation: true,
    },
    locale: 'en',
    onToggle: (key, val) => console.log('Toggled', key, val),
  },
}

export const AllDisabledVietnamese: Story = {
  args: {
    settings: {
      showDeviceLabels: false,
      autoSelectOnAlarm: false,
      blastRadiusBeacon: false,
      showIpInPicker: false,
      promptResumeInvestigation: false,
    },
    locale: 'vi',
    onToggle: (key, val) => console.log('Toggled', key, val),
  },
}
