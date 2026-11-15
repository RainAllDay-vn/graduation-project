import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import DocumentsPage from './index'
import { AppProviders } from '@/context'

const meta: Meta<typeof DocumentsPage> = {
  title: 'Pages/Documents',
  component: DocumentsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AppProviders>
          <div className="p-8 font-sans">
            <Story />
          </div>
        </AppProviders>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
