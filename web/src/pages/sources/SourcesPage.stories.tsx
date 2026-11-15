import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import SourcesPage from './index'
import { AppProviders } from '@/context'

const meta: Meta<typeof SourcesPage> = {
  title: 'Pages/Sources',
  component: SourcesPage,
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
