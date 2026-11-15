import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from './index'
import { AppProviders } from '@/context'

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/Landing',
  component: LandingPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AppProviders>
          <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:26px_26px]">
            <Story />
          </div>
        </AppProviders>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const VietnameseGuest: Story = {
  play: async () => {
    localStorage.setItem('noc_locale', 'vi')
    localStorage.removeItem('noc_user')
  },
}

export const VietnameseAuthenticated: Story = {
  play: async () => {
    localStorage.setItem('noc_locale', 'vi')
    localStorage.setItem(
      'noc_user',
      JSON.stringify({
        id: 1,
        fullName: 'Nguyễn Văn An',
        email: 'engineer@noc.local',
        role: 'ENGINEER',
      })
    )
  },
}

export const EnglishGuest: Story = {
  play: async () => {
    localStorage.setItem('noc_locale', 'en')
    localStorage.removeItem('noc_user')
  },
}

export const EnglishAuthenticated: Story = {
  play: async () => {
    localStorage.setItem('noc_locale', 'en')
    localStorage.setItem(
      'noc_user',
      JSON.stringify({
        id: 1,
        fullName: 'Nguyen Van An',
        email: 'engineer@noc.local',
        role: 'ENGINEER',
      })
    )
  },
}
