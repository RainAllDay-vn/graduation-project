import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentTable } from './DocumentTable'
import type { DocumentSummary } from '@/api/documents'

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
    statusReason: 'TỆP QUÁ LỚN',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

const meta: Meta<typeof DocumentTable> = {
  title: 'Documents/DocumentTable',
  component: DocumentTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultVietnamese: Story = {
  args: {
    documents: mockDocs,
    selectedId: 'SOP-OPTICS-01',
    locale: 'vi',
    onSelectDocument: (doc) => console.log('Selected', doc),
  },
}

export const English: Story = {
  args: {
    documents: mockDocs,
    selectedId: 'SOP-OPTICS-01',
    locale: 'en',
    onSelectDocument: (doc) => console.log('Selected', doc),
  },
}

export const WithNewlyUploaded: Story = {
  args: {
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
    selectedId: null,
    newlyUploadedId: 'DOC-NEW-01',
    locale: 'vi',
    onSelectDocument: (doc) => console.log('Selected', doc),
  },
}

export const LoadingState: Story = {
  args: {
    documents: [],
    isLoading: true,
    locale: 'vi',
    onSelectDocument: () => {},
  },
}

export const EmptyState: Story = {
  args: {
    documents: [],
    locale: 'vi',
    onSelectDocument: () => {},
  },
}
