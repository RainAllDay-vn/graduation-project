import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import SignupPage from './index'
import { AppProviders } from '@/context'

const meta: Meta<typeof SignupPage> = {
  title: 'Pages/Signup',
  component: SignupPage,
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
  },
}

export const English: Story = {
  play: async () => {
    localStorage.setItem('noc_locale', 'en')
  },
}
