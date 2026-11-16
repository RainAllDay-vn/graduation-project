import type { DocumentDetails, DocumentSummary } from '@/api/documents'
import {
  formatBytes,
  formatRelativeTime,
  getSourceLabel,
  getStatusChipConfig,
} from './documentUtils'
import {
  Download,
  RefreshCw,
  Trash2,
  FileQuestion,
  ExternalLink,
  Eye,
} from 'lucide-react'

export interface DocumentPreviewPanelProps {
  document?: DocumentDetails | DocumentSummary | null
  isLoadingDetails?: boolean
  locale?: 'vi' | 'en'
  onReplaceFile: (doc: DocumentSummary | DocumentDetails) => void
  onDownload: (doc: DocumentSummary | DocumentDetails) => void
  onDelete: (doc: DocumentSummary | DocumentDetails) => void
  onOpenViewer?: (doc: DocumentSummary | DocumentDetails) => void
}

export function DocumentPreviewPanel({
  document: doc,
  isLoadingDetails = false,
  locale = 'vi',
  onReplaceFile,
  onDownload,
  onDelete,
  onOpenViewer,
}: DocumentPreviewPanelProps) {
  const isEn = locale === 'en'

  return (
    <aside
      aria-label={isEn ? 'Document Preview' : 'Xem trước tài liệu'}
      className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs flex flex-col transition-colors"
    >
      {/* Panel Header */}
      <div className="font-mono text-[11px] font-extrabold tracking-[0.14em] text-[#64748b] dark:text-[#94a3b8] uppercase px-4 py-3 border-b border-[#e2e8f0] dark:border-[#1e293b] bg-[#f8fafc]/50 dark:bg-[#0b0f19]/50 flex items-center justify-between">
        <span>{isEn ? 'PREVIEW' : 'XEM TRƯỚC'}</span>
        {doc && (
          <div className="flex items-center gap-2.5">
            {onOpenViewer && (
              <button
                type="button"
                onClick={() => onOpenViewer(doc)}
                className="font-sans font-bold text-[11px] text-[#1d4ed8] dark:text-[#60a5fa] hover:text-[#1e40af] dark:hover:text-[#93c5fd] hover:underline flex items-center gap-1 cursor-pointer tracking-normal normal-case"
              >
                <Eye className="w-3 h-3" />
                <span>{isEn ? 'View' : 'Xem'}</span>
              </button>
            )}
            <span className="font-mono text-[10px] text-[#94a3b8] dark:text-[#64748b]">
              ID: {doc.id}
            </span>
          </div>
        )}
      </div>

      {!doc ? (
        /* Empty State */
        <div className="p-10 text-center flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div className="font-bold text-[13.5px] text-[#0f172a] dark:text-[#f8fafc]">
            {isEn ? 'No document selected' : 'Chưa chọn tài liệu nào'}
          </div>
          <p className="text-[12px] text-[#64748b] dark:text-[#94a3b8] mt-1 max-w-[240px] leading-relaxed">
            {isEn
              ? 'Click a row in the table to preview its metadata and text content.'
              : 'Bấm một dòng trong bảng để xem trước nội dung.'}
          </p>
        </div>
      ) : (
        /* Document Content Preview */
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Status Chip */}
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[15px] sm:text-[16px] font-extrabold text-[#0f172a] dark:text-[#f8fafc] leading-snug">
                {doc.title}
              </h2>
              {(() => {
                const chip = getStatusChipConfig(
                  doc.indexingStatus,
                  doc.statusReason,
                  locale
                )
                return (
                  <span
                    className={`font-mono text-[9.5px] font-extrabold tracking-[0.07em] rounded px-2 py-0.5 shrink-0 ${chip.className}`}
                  >
                    {chip.label}
                  </span>
                )
              })()}
            </div>

            {/* Properties Box */}
            <div className="mt-3.5 border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg divide-y divide-[#f1f5f9] dark:divide-[#1e293b] overflow-hidden text-[12px]">
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#0f172a]">
                <span className="font-mono text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] tracking-wider uppercase">
                  {isEn ? 'SOURCE' : 'NGUỒN'}
                </span>
                <span className="font-bold text-[#334155] dark:text-[#cbd5e1]">
                  {getSourceLabel(doc.source, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#0f172a]">
                <span className="font-mono text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] tracking-wider uppercase">
                  {isEn ? 'FILE' : 'LOẠI'}
                </span>
                <span className="font-bold text-[#334155] dark:text-[#cbd5e1]">
                  {doc.fileFormat || 'MD'} · {formatBytes(doc.fileSizeBytes)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#0f172a]">
                <span className="font-mono text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] tracking-wider uppercase">
                  {isEn ? 'UPDATED' : 'CẬP NHẬT'}
                </span>
                <span className="font-bold text-[#334155] dark:text-[#cbd5e1]">
                  {formatRelativeTime(doc.updatedAt, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#0f172a]">
                <span className="font-mono text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] tracking-wider uppercase">
                  {isEn ? 'VERSION' : 'PHIÊN BẢN'}
                </span>
                <span className="font-bold text-[#334155] dark:text-[#cbd5e1]">
                  v{doc.version || 1} ·{' '}
                  <span className="text-[#64748b] dark:text-[#94a3b8] font-normal">
                    {isEn ? 'previous kept' : 'bản cũ giữ lại'}
                  </span>
                </span>
              </div>
            </div>

            {/* Snippet / Content Preview Area */}
            <div className="mt-3.5">
              <div className="font-mono text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] tracking-wider uppercase mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>{isEn ? 'CONTENT SNIPPET' : 'TRÍCH ĐOẠN NỘI DUNG'}</span>
                  {isLoadingDetails && (
                    <span className="text-[10px] text-[#1d4ed8] dark:text-[#60a5fa] animate-pulse">
                      {isEn ? 'Loading snippet...' : 'Đang tải nội dung...'}
                    </span>
                  )}
                </div>
                {onOpenViewer && (
                  <button
                    type="button"
                    onClick={() => onOpenViewer(doc)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1d4ed8] dark:text-[#60a5fa] hover:text-[#1e40af] dark:hover:text-[#93c5fd] hover:underline cursor-pointer tracking-normal normal-case"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{isEn ? 'View full' : 'Xem toàn bộ'}</span>
                  </button>
                )}
              </div>

              <div
                onClick={() => onOpenViewer && onOpenViewer(doc)}
                role={onOpenViewer ? 'button' : undefined}
                tabIndex={onOpenViewer ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onOpenViewer && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onOpenViewer(doc)
                  }
                }}
                title={
                  onOpenViewer
                    ? isEn
                      ? 'Click to open full document reader'
                      : 'Bấm để đọc toàn bộ tài liệu'
                    : undefined
                }
                className={`bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg p-3 text-[12px] text-[#334155] dark:text-[#cbd5e1] leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap font-sans transition-colors ${
                  onOpenViewer ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-[#0b0f19]/90' : ''
                }`}
              >
                {'content' in doc && doc.content ? (
                  doc.content
                ) : isLoadingDetails ? (
                  <div className="space-y-2 py-1">
                    <div className="h-3 bg-slate-200 dark:bg-[#1e293b] rounded w-full animate-pulse" />
                    <div className="h-3 bg-slate-200 dark:bg-[#1e293b] rounded w-5/6 animate-pulse" />
                    <div className="h-3 bg-slate-200 dark:bg-[#1e293b] rounded w-4/6 animate-pulse" />
                  </div>
                ) : (
                  <span className="text-[#94a3b8] dark:text-[#64748b] italic">
                    {isEn
                      ? 'No extracted text content available for this document.'
                      : 'Chưa có nội dung văn bản trích xuất cho tài liệu này.'}
                  </span>
                )}
              </div>
            </div>

            {/* AI Citation Notice */}
            <div className="mt-2.5 text-[11.5px] text-[#64748b] dark:text-[#94a3b8] leading-normal flex items-start gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#1d4ed8] dark:text-[#60a5fa] shrink-0 mt-0.5" />
              <span>
                {isEn
                  ? 'AI can cite this document during incident analysis — evidence links back here.'
                  : 'AI có thể trích dẫn tài liệu này khi điều tra — dẫn chứng luôn kèm link về đây.'}
              </span>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="mt-5 pt-3 border-t border-[#f1f5f9] dark:border-[#1e293b] flex flex-col gap-2">
            {onOpenViewer && (
              <button
                type="button"
                onClick={() => onOpenViewer(doc)}
                className="w-full h-8.5 px-3 text-xs font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isEn ? 'View Document' : 'Xem tài liệu'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onReplaceFile(doc)}
              className="w-full h-8 px-3 text-xs font-bold text-[#1d4ed8] dark:text-[#60a5fa] hover:text-[#1e40af] dark:hover:text-[#93c5fd] bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Replace File' : 'Thay thế tệp'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDownload(doc)}
                className="flex-1 h-8 px-3 text-xs font-bold text-[#475569] dark:text-[#cbd5e1] hover:text-[#0f172a] dark:hover:text-white bg-white dark:bg-[#1e293b] hover:bg-[#f8fafc] dark:hover:bg-[#334155] border border-[#cbd5e1] dark:border-[#334155] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#64748b] dark:text-[#94a3b8]" />
                <span>{isEn ? 'Download' : 'Tải xuống'}</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(doc)}
                aria-label={isEn ? 'Delete document' : 'Xóa tài liệu'}
                className="h-8 px-3 text-xs font-bold text-[#dc2626] dark:text-[#f87171] hover:text-[#b91c1c] dark:hover:text-[#ef4444] bg-white dark:bg-[#1e293b] hover:bg-[#fef2f2] dark:hover:bg-red-950/40 border border-[#fca5a5] dark:border-red-900/60 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Delete' : 'Xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
