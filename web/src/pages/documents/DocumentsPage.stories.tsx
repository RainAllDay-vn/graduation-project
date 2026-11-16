import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentsView } from './index'
import type { DocumentSummary, DocumentDetails } from '@/api/documents'

const mockDocs: DocumentSummary[] = [
  {
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
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'SOP-OPTICS-02',
    title: 'Sổ tay vận hành quang trạm',
    source: 'CONFLUENCE',
    docType: 'OPERATION_RUNBOOK',
    fileName: 'so-tay-van-hanh-quang.pdf',
    fileFormat: 'PDF',
    fileSizeBytes: 13002342,
    version: 1,
    indexingStatus: 'READY',
    statusReason: null,
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'SOP-BGP-01',
    title: 'Quy trình chẩn đoán BGP Flapping',
    source: 'OPERATIONS_DRIVE',
    docType: 'OPERATION_RUNBOOK',
    fileName: 'bgp-flapping.docx',
    fileFormat: 'DOCX',
    fileSizeBytes: 2306867,
    version: 1,
    indexingStatus: 'INDEXING',
    statusReason: null,
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'DOC-CSV-01',
    title: 'Danh mục thiết bị trạm A',
    source: 'MANUAL',
    docType: 'VENDOR_SPECIFICATION',
    fileName: 'danh-muc-thiet-bi.csv',
    fileFormat: 'CSV',
    fileSizeBytes: 157286400,
    version: 1,
    indexingStatus: 'FAILED',
    statusReason: 'TỆP QUÁ LỚN (VƯỢT QUÁ 50MB)',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

const mockDocDetails: DocumentDetails = {
  ...mockDocs[0],
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

const meta: Meta<typeof DocumentsView> = {
  title: 'Pages/Documents',
  component: DocumentsView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:26px_26px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultSelected: Story = {
  args: {
    documents: mockDocs,
    selectedDoc: mockDocDetails,
    isLoadingDocs: false,
    isLoadingDocDetails: false,
    searchQuery: '',
    selectedStatus: 'ALL',
    selectedSource: 'ALL',
    showToast: false,
    newlyUploadedId: null,
    isUploadOpen: false,
    replaceTarget: null,
    deleteTarget: null,
    isViewerOpen: false,
    viewerDoc: null,
    locale: 'vi',
    onSearchChange: () => {},
    onStatusChange: () => {},
    onSourceChange: () => {},
    onResetFilters: () => {},
    onSelectDocument: () => {},
    onOpenUpload: () => {},
    onCloseUpload: () => {},
    onOpenReplace: () => {},
    onCloseReplace: () => {},
    onOpenDelete: () => {},
    onCloseDelete: () => {},
    onConfirmDelete: () => {},
    onOpenViewer: () => {},
    onCloseViewer: () => {},
    onUploadSubmit: () => {},
    onReplaceSubmit: () => {},
    onDownload: () => {},
    onDismissToast: () => {},
  },
}

export const NoSelection: Story = {
  args: {
    ...DefaultSelected.args,
    selectedDoc: null,
  },
}

export const RecentlyUploaded: Story = {
  args: {
    ...DefaultSelected.args,
    documents: [
      {
        id: 'DOC-NEW-01',
        title: 'Bảo trì hệ thống DSLAM',
        source: 'MANUAL',
        docType: 'OPERATION_RUNBOOK',
        fileName: 'dslam-maintenance.docx',
        fileFormat: 'DOCX',
        fileSizeBytes: 3250585,
        version: 1,
        indexingStatus: 'INDEXING',
        statusReason: null,
        updatedAt: new Date().toISOString(),
      },
      ...mockDocs,
    ],
    selectedDoc: null,
    showToast: true,
    newlyUploadedId: 'DOC-NEW-01',
  },
}

export const FailedDocumentSelected: Story = {
  args: {
    ...DefaultSelected.args,
    selectedDoc: {
      ...mockDocs[3],
      content: null,
      downloadUrl: '/api/documents/DOC-CSV-01/download',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  },
}

export const EnglishLocale: Story = {
  args: {
    ...DefaultSelected.args,
    locale: 'en',
  },
}

export const ViewerModalOpen: Story = {
  args: {
    ...DefaultSelected.args,
    isViewerOpen: true,
    viewerDoc: mockDocDetails,
  },
}
