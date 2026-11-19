import type { Meta, StoryObj } from '@storybook/react'
import { SessionExpiryWarningModal } from './SessionExpiryWarningModal'

const meta: Meta<typeof SessionExpiryWarningModal> = {
  title: 'Auth/SessionExpiryWarningModal',
  component: SessionExpiryWarningModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SessionExpiryWarningModal>

export const WarningDarkVi: Story = {
  args: {
    isOpen: true,
    remainingSeconds: 45,
    totalWarningSeconds: 60,
    locale: 'vi',
    onExtend: () => console.log('Extend session clicked'),
    onSignOff: () => console.log('Sign off clicked'),
  },
  render: (args) => (
    <div className="dark min-h-screen bg-[#070a10] p-8 flex items-center justify-center">
      <SessionExpiryWarningModal {...args} />
    </div>
  ),
}

export const WarningUrgentDark: Story = {
  args: {
    isOpen: true,
    remainingSeconds: 12,
    totalWarningSeconds: 60,
    locale: 'vi',
    onExtend: () => console.log('Extend session clicked'),
    onSignOff: () => console.log('Sign off clicked'),
  },
  render: (args) => (
    <div className="dark min-h-screen bg-[#070a10] p-8 flex items-center justify-center">
      <SessionExpiryWarningModal {...args} />
    </div>
  ),
}

export const WarningLightEn: Story = {
  args: {
    isOpen: true,
    remainingSeconds: 30,
    totalWarningSeconds: 60,
    locale: 'en',
    onExtend: () => console.log('Extend session clicked'),
    onSignOff: () => console.log('Sign off clicked'),
  },
  render: (args) => (
    <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center">
      <SessionExpiryWarningModal {...args} />
    </div>
  ),
}
