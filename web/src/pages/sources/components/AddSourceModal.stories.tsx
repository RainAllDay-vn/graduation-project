import type { Meta, StoryObj } from '@storybook/react-vite'
import { AddSourceModal } from './AddSourceModal'

const meta: Meta<typeof AddSourceModal> = {
  title: 'Sources/AddSourceModal',
  component: AddSourceModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 620,
      },
    },
  },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    isLoading: false,
    locale: 'vi',
    onClose: () => alert('Modal closed'),
    onSubmit: (data) => alert(`Submitted: ${data.name} (${data.type})`),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    locale: 'vi',
  },
}

export const LoadingState: Story = {
  args: {
    isOpen: true,
    isLoading: true,
    locale: 'vi',
  },
}

export const EnglishLocale: Story = {
  args: {
    isOpen: true,
    locale: 'en',
  },
}
