import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReplaceFileModal } from './ReplaceFileModal'
import type { DocumentSummary } from '@/api/documents'

const mockDoc: DocumentSummary = {
  id: 'SOP-OPTICS-01',
  title: 'Quy trình xử lý sự cố cáp quang và mất tín hiệu RX',
  source: 'INTERNAL_WIKI',
  docType: 'OPERATION_RUNBOOK',
  fileName: 'quy-trinh-xu-ly-su-co-cap-quang.md',
  fileFormat: 'MD',
  fileSizeBytes: 1843200,
  version: 2,
  indexingStatus: 'READY',
  statusReason: null,
  updatedAt: new Date().toISOString(),
}

const meta: Meta<typeof ReplaceFileModal> = {
  title: 'Documents/ReplaceFileModal',
  component: ReplaceFileModal,
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
    document: mockDoc,
    isReplacing: false,
    locale: 'vi',
    onClose: () => alert('Modal closed'),
    onSubmit: (file) => alert(`Replaced with: ${file.name}`),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultVietnamese: Story = {
  args: {
    isOpen: true,
    document: mockDoc,
    isReplacing: false,
    locale: 'vi',
    onClose: () => alert('Modal closed'),
    onSubmit: (file) => alert(`Replaced with: ${file.name}`),
  },
}

export const English: Story = {
  args: {
    isOpen: true,
    document: mockDoc,
    isReplacing: false,
    locale: 'en',
    onClose: () => alert('Modal closed'),
    onSubmit: (file) => alert(`Replaced with: ${file.name}`),
  },
}

export const ReplacingState: Story = {
  args: {
    isOpen: true,
    document: mockDoc,
    isReplacing: true,
    locale: 'vi',
    onClose: () => {},
    onSubmit: () => {},
  },
}
