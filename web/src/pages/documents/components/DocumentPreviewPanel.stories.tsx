import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentPreviewPanel } from './DocumentPreviewPanel'
import type { DocumentDetails } from '@/api/documents'

const mockDetails: DocumentDetails = {
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
  content: `### 1. Phạm vi áp dụng
Quy trình này áp dụng cho toàn bộ kỹ sư NOC khi phát hiện suy hao công suất quang Rx vượt ngưỡng (-20 dBm) trên các liên kết quang DWDM/IP backbone.

### 2. Các bước xử lý
1. Xác định điểm đứt qua OTDR, ghi lại khoảng cách từ trạm A.
2. Điều động đội ứng cứu tới hầm cáp gần nhất, chuẩn bị máy hàn quang.
3. Kiểm tra công suất phát Tx tại đầu đối diện để loại trừ lỗi module SFP.
4. Báo cáo sau xử lý trong 24 giờ, kèm ảnh đo kiểm trước và sau.`,
  downloadUrl: '/api/documents/SOP-OPTICS-01/download',
  createdAt: new Date(Date.now() - 604800000).toISOString(),
  updatedAt: new Date(Date.now() - 172800000).toISOString(),
}

const meta: Meta<typeof DocumentPreviewPanel> = {
  title: 'Documents/DocumentPreviewPanel',
  component: DocumentPreviewPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const ReadyDocumentSelected: Story = {
  render: (args) => (
    <div className="max-w-[420px]">
      <DocumentPreviewPanel {...args} />
    </div>
  ),
  args: {
    document: mockDetails,
    isLoadingDetails: false,
    locale: 'vi',
    onReplaceFile: (doc) => alert(`Replace file for ${doc.title}`),
    onDownload: (doc) => alert(`Download ${doc.fileName}`),
    onDelete: (doc) => alert(`Delete ${doc.title}`),
  },
}

export const English: Story = {
  render: (args) => (
    <div className="max-w-[420px]">
      <DocumentPreviewPanel {...args} />
    </div>
  ),
  args: {
    document: mockDetails,
    isLoadingDetails: false,
    locale: 'en',
    onReplaceFile: (doc) => alert(`Replace file for ${doc.title}`),
    onDownload: (doc) => alert(`Download ${doc.fileName}`),
    onDelete: (doc) => alert(`Delete ${doc.title}`),
  },
}

export const FailedDocument: Story = {
  render: (args) => (
    <div className="max-w-[420px]">
      <DocumentPreviewPanel {...args} />
    </div>
  ),
  args: {
    document: {
      ...mockDetails,
      id: 'DOC-CSV-01',
      title: 'Danh mục thiết bị trạm A',
      source: 'MANUAL',
      docType: 'VENDOR_SPECIFICATION',
      fileName: 'danh-muc.csv',
      fileFormat: 'CSV',
      indexingStatus: 'FAILED',
      statusReason: 'TỆP QUÁ LỚN (VƯỢT QUÁ 50MB)',
      content: null,
    },
    isLoadingDetails: false,
    locale: 'vi',
    onReplaceFile: () => {},
    onDownload: () => {},
    onDelete: () => {},
  },
}

export const LoadingSnippet: Story = {
  render: (args) => (
    <div className="max-w-[420px]">
      <DocumentPreviewPanel {...args} />
    </div>
  ),
  args: {
    document: {
      ...mockDetails,
      content: null,
    },
    isLoadingDetails: true,
    locale: 'vi',
    onReplaceFile: () => {},
    onDownload: () => {},
    onDelete: () => {},
  },
}

export const EmptyState: Story = {
  render: (args) => (
    <div className="max-w-[420px]">
      <DocumentPreviewPanel {...args} />
    </div>
  ),
  args: {
    document: null,
    locale: 'vi',
    onReplaceFile: () => {},
    onDownload: () => {},
    onDelete: () => {},
  },
}
