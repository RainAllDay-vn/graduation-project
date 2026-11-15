import type { Meta, StoryObj } from '@storybook/react-vite'
import { SettingsView } from './index'
import { DEFAULT_SETTINGS } from '@/context'

const meta: Meta<typeof SettingsView> = {
  title: 'Pages/Settings',
  component: SettingsView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultState: Story = {
  args: {
    draftSettings: {
      ...DEFAULT_SETTINGS,
      theme: 'light',
      locale: 'vi',
    },
    saveStatus: 'idle',
    onDraftChange: () => {},
    onSave: () => alert('Save changes clicked'),
    onDiscard: () => alert('Discard clicked'),
    onReset: () => alert('Reset to defaults clicked'),
    onDismissSaved: () => {},
  },
}

export const DarkModeState: Story = {
  render: (args) => (
    <div className="min-h-screen bg-[#0a1120] text-[#e2e8f0]">
      <SettingsView {...args} />
    </div>
  ),
  args: {
    draftSettings: {
      ...DEFAULT_SETTINGS,
      theme: 'dark',
      locale: 'vi',
    },
    saveStatus: 'idle',
    onDraftChange: () => {},
    onSave: () => {},
    onDiscard: () => {},
    onReset: () => {},
    onDismissSaved: () => {},
  },
}

export const UnsavedChangesState: Story = {
  args: {
    draftSettings: {
      ...DEFAULT_SETTINGS,
      theme: 'dark',
      showIpInPicker: true,
      promptResumeInvestigation: false,
    },
    saveStatus: 'unsaved',
    onDraftChange: () => {},
    onSave: () => alert('Saved!'),
    onDiscard: () => alert('Changes discarded'),
    onReset: () => {},
    onDismissSaved: () => {},
  },
}

export const SavedConfirmationState: Story = {
  args: {
    draftSettings: {
      ...DEFAULT_SETTINGS,
      showIpInPicker: true,
    },
    saveStatus: 'saved',
    onDraftChange: () => {},
    onSave: () => {},
    onDiscard: () => {},
    onReset: () => {},
    onDismissSaved: () => alert('Banner dismissed'),
  },
}

export const EnglishLocale: Story = {
  args: {
    draftSettings: {
      ...DEFAULT_SETTINGS,
      locale: 'en',
    },
    saveStatus: 'idle',
    onDraftChange: () => {},
    onSave: () => {},
    onDiscard: () => {},
    onReset: () => {},
    onDismissSaved: () => {},
  },
}
