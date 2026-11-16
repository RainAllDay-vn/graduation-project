import { useState, useMemo } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useTheme } from '@/context'
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  replaceDocumentFile,
  deleteDocument,
  getDocumentDownloadUrl,
  type DocumentSummary,
  type DocumentDetails,
  type IndexingStatus,
  type DocumentSource,
  type UploadDocumentParams,
} from '@/api/documents'
import { DocumentTable } from './components/DocumentTable'
import { DocumentPreviewPanel } from './components/DocumentPreviewPanel'
import { DocumentFilterBar } from './components/DocumentFilterBar'
import { UploadDocumentModal } from './components/UploadDocumentModal'
import { ReplaceFileModal } from './components/ReplaceFileModal'
import { DocumentViewerModal } from './components/DocumentViewerModal'
import { UploadCloud, CheckCircle2, X, AlertTriangle } from 'lucide-react'

export interface DocumentsViewProps {
  documents: DocumentSummary[]
  selectedDoc?: DocumentSummary | DocumentDetails | null
  isLoadingDocs?: boolean
  isLoadingDocDetails?: boolean
  searchQuery: string
  selectedStatus: IndexingStatus | 'ALL'
  selectedSource: DocumentSource | 'ALL'
  showToast?: boolean
  newlyUploadedId?: string | null
  isUploadOpen: boolean
  replaceTarget?: DocumentSummary | DocumentDetails | null
  deleteTarget?: DocumentSummary | DocumentDetails | null
  isViewerOpen?: boolean
  viewerDoc?: DocumentDetails | DocumentSummary | null
  isUploading?: boolean
  isReplacing?: boolean
  uploadError?: string | null
  replaceError?: string | null
  locale?: 'vi' | 'en'
  onSearchChange: (q: string) => void
  onStatusChange: (status: IndexingStatus | 'ALL') => void
  onSourceChange: (source: DocumentSource | 'ALL') => void
  onResetFilters: () => void
  onSelectDocument: (doc: DocumentSummary) => void
  onOpenUpload: () => void
  onCloseUpload: () => void
  onOpenReplace: (doc: DocumentSummary | DocumentDetails) => void
  onCloseReplace: () => void
  onOpenDelete: (doc: DocumentSummary | DocumentDetails) => void
  onCloseDelete: () => void
  onConfirmDelete: () => void
  onOpenViewer?: (doc: DocumentSummary | DocumentDetails) => void
  onCloseViewer?: () => void
  onUploadSubmit: (params: UploadDocumentParams) => void
  onReplaceSubmit: (file: File) => void
  onDownload: (doc: DocumentSummary | DocumentDetails) => void
  onDismissToast?: () => void
}

export function DocumentsView({
  documents,
  selectedDoc,
  isLoadingDocs = false,
  isLoadingDocDetails = false,
  searchQuery,
  selectedStatus,
  selectedSource,
  showToast = false,
  newlyUploadedId = null,
  isUploadOpen,
  replaceTarget = null,
  deleteTarget = null,
  isViewerOpen = false,
  viewerDoc = null,
  isUploading = false,
  isReplacing = false,
  uploadError = null,
  replaceError = null,
  locale = 'vi',
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onResetFilters,
  onSelectDocument,
  onOpenUpload,
  onCloseUpload,
  onOpenReplace,
  onCloseReplace,
  onOpenDelete,
  onCloseDelete,
  onConfirmDelete,
  onOpenViewer,
  onCloseViewer,
  onUploadSubmit,
  onReplaceSubmit,
  onDownload,
  onDismissToast,
}: DocumentsViewProps) {
  const isEn = locale === 'en'

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-4 sm:px-8 md:px-12 py-6 sm:py-8">
      <div className="w-full">
        {/* Page Top Heading + Upload Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
              {isEn ? 'Document Management' : 'Quản lý tài liệu'}
            </h1>
            <p className="text-[13px] text-[#64748b] mt-1">
              {isEn
                ? 'Reference knowledge base for AI citations during incident investigations'
                : 'Nguồn tham khảo cho AI trích dẫn khi điều tra sự cố'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenUpload}
            className="h-9 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs border-0 flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isEn ? 'Upload Document' : 'Tải lên tài liệu'}</span>
          </button>
        </div>

        {/* Upload Success Toast Banner */}
        {showToast && (
          <div
            role="status"
            aria-live="polite"
            className="w-full flex items-center justify-between gap-3 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] rounded-xl px-4 py-2.5 text-[13px] font-semibold my-4 shadow-xs animate-in fade-in"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
              <span className="truncate">
                {isEn
                  ? 'Uploaded — indexing in progress, AI will be able to query once complete.'
                  : 'Đã tải lên — đang lập chỉ mục, AI sẽ tra cứu được khi hoàn tất.'}
              </span>
            </div>

            {onDismissToast && (
              <button
                type="button"
                onClick={onDismissToast}
                aria-label={isEn ? 'Close notification' : 'Đóng thông báo'}
                className="p-1 text-[#15803d]/70 hover:text-[#15803d] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mt-4">
          <DocumentFilterBar
            searchQuery={searchQuery}
            selectedStatus={selectedStatus}
            selectedSource={selectedSource}
            locale={locale}
            onSearchChange={onSearchChange}
            onStatusChange={onStatusChange}
            onSourceChange={onSourceChange}
            onResetFilters={onResetFilters}
          />
        </div>

        {/* Master-Detail Split Grid (Left: Table, Right: 400px Preview Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start">
          <DocumentTable
            documents={documents}
            selectedId={selectedDoc?.id}
            newlyUploadedId={newlyUploadedId}
            isLoading={isLoadingDocs}
            locale={locale}
            onSelectDocument={onSelectDocument}
          />

          <DocumentPreviewPanel
            document={selectedDoc}
            isLoadingDetails={isLoadingDocDetails}
            locale={locale}
            onReplaceFile={onOpenReplace}
            onDownload={onDownload}
            onDelete={onOpenDelete}
            onOpenViewer={onOpenViewer}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fef2f2] border border-[#fee2e2] flex items-center justify-center text-[#dc2626] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={onCloseDelete}
                className="text-[#94a3b8] hover:text-[#475569] p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3.5">
              <h3 id="delete-modal-title" className="text-base font-bold text-[#0f172a]">
                {isEn ? 'Delete Document?' : 'Xóa tài liệu này?'}
              </h3>
              <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                {isEn
                  ? `Are you sure you want to delete "${deleteTarget.title}"? All stored file versions and vector embeddings will be permanently removed.`
                  : `Bạn có chắc muốn xóa "${deleteTarget.title}"? Toàn bộ các phiên bản tệp và vector embeddings sẽ bị xóa vĩnh viễn khỏi hệ thống.`}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onCloseDelete}
                className="h-8 px-4 text-xs font-bold text-[#475569] hover:text-[#0f172a] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Hủy'}
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                className="h-8 px-4 text-xs font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg transition-colors cursor-pointer shadow-xs border-0"
              >
                {isEn ? 'Confirm Delete' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Dialog */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        isUploading={isUploading}
        error={uploadError}
        locale={locale}
        onClose={onCloseUpload}
        onSubmit={onUploadSubmit}
      />

      {/* Replace File Modal Dialog */}
      <ReplaceFileModal
        isOpen={!!replaceTarget}
        document={replaceTarget}
        isReplacing={isReplacing}
        error={replaceError}
        locale={locale}
        onClose={onCloseReplace}
        onSubmit={onReplaceSubmit}
      />

      {/* Document Content Reader / Viewer Modal */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        document={viewerDoc || selectedDoc}
        isLoadingContent={isLoadingDocDetails}
        locale={locale}
        onClose={onCloseViewer || (() => {})}
        onDownload={onDownload}
      />

      {/* Standard App Monospace Footer */}
      <footer className="text-center font-mono text-[11px] text-[#94a3b8] tracking-widest uppercase mt-10 pt-4 pb-2">
        NOC TOPOLOGY v0.4 ·{' '}
        <span className="text-[#64748b]">
          {isEn ? 'ENVIRONMENT' : 'MÔI TRƯỜNG'}{' '}
          <span className="bg-[#e2e8f0] px-1 py-0.5 rounded text-[10px] text-[#475569] font-bold">
            TEST
          </span>
        </span>{' '}
        · {isEn ? 'SUPPORT: INTERNAL IT' : 'HỖ TRỢ: IT NỘI BỘ'}
      </footer>
    </div>
  )
}

export default function DocumentsPage() {
  const queryClient = useQueryClient()
  const { locale } = useTheme()

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<IndexingStatus | 'ALL'>('ALL')
  const [selectedSource, setSelectedSource] = useState<DocumentSource | 'ALL'>('ALL')

  // Selection & UI States
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [newlyUploadedId, setNewlyUploadedId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  // Modals & Active Targets
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [viewerDoc, setViewerDoc] = useState<DocumentDetails | DocumentSummary | null>(null)
  const [replaceTarget, setReplaceTarget] = useState<DocumentSummary | DocumentDetails | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentSummary | DocumentDetails | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [replaceError, setReplaceError] = useState<string | null>(null)

  // 1. Fetch document list with polling (every 15s to capture indexing transitions)
  const { data: rawDocuments = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ['documents', { q: searchQuery, status: selectedStatus, source: selectedSource }],
    queryFn: () =>
      getDocuments({
        q: searchQuery.trim() || undefined,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        source: selectedSource === 'ALL' ? undefined : selectedSource,
      }),
    refetchInterval: 15000,
  })

  // Ensure initial selection defaults to first document if available
  const documents = rawDocuments
  const effectiveSelectedId = selectedDocId || (documents.length > 0 ? documents[0].id : null)

  // 2. Fetch full document details (extracted content) for selected document
  const { data: selectedDocDetails, isLoading: isLoadingDocDetails } = useQuery({
    queryKey: ['document', effectiveSelectedId],
    queryFn: () => (effectiveSelectedId ? getDocumentById(effectiveSelectedId) : null),
    enabled: !!effectiveSelectedId,
    staleTime: 1000 * 60,
  })

  const selectedDoc = useMemo(() => {
    if (selectedDocDetails) return selectedDocDetails
    return documents.find((d) => d.id === effectiveSelectedId) || null
  }, [selectedDocDetails, documents, effectiveSelectedId])

  // 3. Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (params: UploadDocumentParams) => uploadDocument(params),
    onSuccess: (newDoc) => {
      setUploadError(null)
      setIsUploadOpen(false)
      setShowToast(true)
      setNewlyUploadedId(newDoc.id)
      setSelectedDocId(newDoc.id)
      queryClient.invalidateQueries({ queryKey: ['documents'] })

      // Auto-dismiss toast after 6s
      setTimeout(() => {
        setShowToast(false)
      }, 6000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Upload failed'
      setUploadError(msg)
    },
  })

  // 4. Replace File Mutation
  const replaceMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      replaceDocumentFile({ id, file }),
    onSuccess: (updatedDoc) => {
      setReplaceError(null)
      setReplaceTarget(null)
      setSelectedDocId(updatedDoc.id)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['document', updatedDoc.id] })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'File replacement failed'
      setReplaceError(msg)
    },
  })

  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: (_, deletedId) => {
      setDeleteTarget(null)
      if (selectedDocId === deletedId) {
        setSelectedDocId(null)
      }
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const handleDownload = (doc: DocumentSummary | DocumentDetails) => {
    const url = getDocumentDownloadUrl(doc.id)
    window.open(url, '_blank')
  }

  const handleOpenViewer = (doc: DocumentSummary | DocumentDetails) => {
    setSelectedDocId(doc.id)
    setViewerDoc(doc)
    setIsViewerOpen(true)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedStatus('ALL')
    setSelectedSource('ALL')
  }

  return (
    <DocumentsView
      documents={documents}
      selectedDoc={selectedDoc}
      isLoadingDocs={isLoadingDocs}
      isLoadingDocDetails={isLoadingDocDetails}
      searchQuery={searchQuery}
      selectedStatus={selectedStatus}
      selectedSource={selectedSource}
      showToast={showToast}
      newlyUploadedId={newlyUploadedId}
      isUploadOpen={isUploadOpen}
      replaceTarget={replaceTarget}
      deleteTarget={deleteTarget}
      isViewerOpen={isViewerOpen}
      viewerDoc={viewerDoc?.id === selectedDoc?.id ? selectedDoc : viewerDoc}
      isUploading={uploadMutation.isPending}
      isReplacing={replaceMutation.isPending}
      uploadError={uploadError}
      replaceError={replaceError}
      locale={locale}
      onSearchChange={setSearchQuery}
      onStatusChange={setSelectedStatus}
      onSourceChange={setSelectedSource}
      onResetFilters={handleResetFilters}
      onSelectDocument={(doc) => setSelectedDocId(doc.id)}
      onOpenViewer={handleOpenViewer}
      onCloseViewer={() => setIsViewerOpen(false)}
      onOpenUpload={() => {
        setUploadError(null)
        setIsUploadOpen(true)
      }}
      onCloseUpload={() => setIsUploadOpen(false)}
      onOpenReplace={(doc) => {
        setReplaceError(null)
        setReplaceTarget(doc)
      }}
      onCloseReplace={() => setReplaceTarget(null)}
      onOpenDelete={(doc) => setDeleteTarget(doc)}
      onCloseDelete={() => setDeleteTarget(null)}
      onConfirmDelete={() => {
        if (deleteTarget) {
          deleteMutation.mutate(deleteTarget.id)
        }
      }}
      onUploadSubmit={(params) => uploadMutation.mutate(params)}
      onReplaceSubmit={(file) => {
        if (replaceTarget) {
          replaceMutation.mutate({ id: replaceTarget.id, file })
        }
      }}
      onDownload={handleDownload}
      onDismissToast={() => setShowToast(false)}
    />
  )
}
