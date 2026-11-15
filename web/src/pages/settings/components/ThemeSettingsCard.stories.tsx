import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeSettingsCard } from './ThemeSettingsCard'

const meta: Meta<typeof ThemeSettingsCard> = {
  title: 'Settings/ThemeSettingsCard',
  component: ThemeSettingsCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const LightThemeVietnamese: Story = {
  args: {
    theme: 'light',
    locale: 'vi',
    onThemeChange: () => {},
    onLocaleChange: () => {},
  },
}

export const DarkThemeVietnamese: Story = {
  args: {
    theme: 'dark',
    locale: 'vi',
    onThemeChange: () => {},
    onLocaleChange: () => {},
  },
}

export const SystemThemeEnglish: Story = {
  args: {
    theme: 'system',
    locale: 'en',
    onThemeChange: () => {},
    onLocaleChange: () => {},
  },
}
