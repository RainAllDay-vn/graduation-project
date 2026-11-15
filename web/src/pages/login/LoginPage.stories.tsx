import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './index'
import { AppProviders } from '@/context'

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/Login',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AppProviders>
          <Story />
        </AppProviders>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultVietnamese: Story = {
  play: async () => {
    localStorage.setItem('noc_locale', 'vi')
    localStorage.removeItem('noc_remember_email')
  },
}

export const English: Story = {
  play: async () => {
    localStorage.setItem('noc_locale', 'en')
    localStorage.removeItem('noc_remember_email')
  },
}

export const WithRememberedEmail: Story = {
  play: async () => {
    localStorage.setItem('noc_locale', 'vi')
    localStorage.setItem('noc_remember_email', 'engineer@noc.local')
  },
}
