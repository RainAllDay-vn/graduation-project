import type { Meta, StoryObj } from '@storybook/react-vite'
import { UploadDocumentModal } from './UploadDocumentModal'

const meta: Meta<typeof UploadDocumentModal> = {
  title: 'Documents/UploadDocumentModal',
  component: UploadDocumentModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 520,
      },
    },
  },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    isUploading: false,
    locale: 'vi',
    onClose: () => alert('Modal closed'),
    onSubmit: (params) => alert(`Submitted: ${params.title}`),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultVietnamese: Story = {
  args: {
    isOpen: true,
    isUploading: false,
    locale: 'vi',
    onClose: () => alert('Modal closed'),
    onSubmit: (params) => alert(`Submitted: ${params.title}`),
  },
}

export const English: Story = {
  args: {
    isOpen: true,
    isUploading: false,
    locale: 'en',
    onClose: () => alert('Modal closed'),
    onSubmit: (params) => alert(`Submitted: ${params.title}`),
  },
}

export const UploadingState: Story = {
  args: {
    isOpen: true,
    isUploading: true,
    locale: 'vi',
    onClose: () => {},
    onSubmit: () => {},
  },
}

export const WithError: Story = {
  args: {
    isOpen: true,
    isUploading: false,
    error: 'Định dạng tệp không được hỗ trợ (chỉ chấp nhận .md, .txt).',
    locale: 'vi',
    onClose: () => {},
    onSubmit: () => {},
  },
}
