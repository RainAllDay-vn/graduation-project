import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './index'
import PublicLayout from '@/components/layout/PublicLayout'
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
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="*" element={<Story />} />
            </Route>
          </Routes>
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
