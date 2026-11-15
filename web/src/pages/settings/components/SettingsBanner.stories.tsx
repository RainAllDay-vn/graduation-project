import type { Meta, StoryObj } from '@storybook/react-vite'
import { SettingsBanner } from './SettingsBanner'

const meta: Meta<typeof SettingsBanner> = {
  title: 'Settings/SettingsBanner',
  component: SettingsBanner,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const UnsavedVietnamese: Story = {
  args: {
    saveStatus: 'unsaved',
    locale: 'vi',
    onSave: () => alert('Save clicked'),
    onDiscard: () => alert('Discard clicked'),
  },
}

export const UnsavedEnglish: Story = {
  args: {
    saveStatus: 'unsaved',
    locale: 'en',
    onSave: () => alert('Save clicked'),
    onDiscard: () => alert('Discard clicked'),
  },
}

export const SavedVietnamese: Story = {
  args: {
    saveStatus: 'saved',
    locale: 'vi',
    onSave: () => {},
    onDiscard: () => {},
    onDismissSaved: () => alert('Dismiss clicked'),
  },
}

export const SavedEnglish: Story = {
  args: {
    saveStatus: 'saved',
    locale: 'en',
    onSave: () => {},
    onDiscard: () => {},
    onDismissSaved: () => alert('Dismiss clicked'),
  },
}

export const Idle: Story = {
  args: {
    saveStatus: 'idle',
    locale: 'vi',
    onSave: () => {},
    onDiscard: () => {},
  },
}
