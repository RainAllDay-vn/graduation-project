import { useState } from 'react'
import type { DocumentDetails, DocumentSummary } from '@/api/documents'
import {
  formatBytes,
  formatRelativeTime,
  getSourceLabel,
  getStatusChipConfig,
} from './documentUtils'
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
  BookOpen,
} from 'lucide-react'

export interface DocumentViewerModalProps {
  isOpen: boolean
  document?: DocumentDetails | DocumentSummary | null
  isLoadingContent?: boolean
  locale?: 'vi' | 'en'
  onClose: () => void
  onDownload?: (doc: DocumentSummary | DocumentDetails) => void
}

export function DocumentViewerModal({
  isOpen,
  document: doc,
  isLoadingContent = false,
  locale = 'vi',
  onClose,
  onDownload,
}: DocumentViewerModalProps) {
  const isEn = locale === 'en'
  const [copied, setCopied] = useState(false)

  if (!isOpen || !doc) return null

  const content = 'content' in doc && doc.content ? doc.content : null

  const handleCopy = async () => {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.warn('Failed to copy to clipboard', e)
    }
  }

  const chip = getStatusChipConfig(
    doc.indexingStatus,
    doc.statusReason,
    locale
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-viewer-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl max-w-4xl w-full h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <header className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="doc-viewer-title"
                  className="text-base sm:text-lg font-extrabold text-[#0f172a] truncate leading-tight"
                >
                  {doc.title}
                </h2>
                <span
                  className={`font-mono text-[9px] font-extrabold tracking-wider rounded px-2 py-0.5 shrink-0 ${chip.className}`}
                >
                  {chip.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748b] mt-1 font-sans">
                <span>
                  {isEn ? 'Source:' : 'Nguồn:'}{' '}
                  <strong className="text-[#334155]">
                    {getSourceLabel(doc.source, locale)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  {doc.fileFormat || 'MD'} · {formatBytes(doc.fileSizeBytes)}
                </span>
                <span>•</span>
                <span>
                  {isEn ? 'Version:' : 'Phiên bản:'}{' '}
                  <strong className="text-[#334155]">v{doc.version || 1}</strong>
                </span>
                <span>•</span>
                <span>
                  {isEn ? 'Updated:' : 'Cập nhật:'}{' '}
                  {formatRelativeTime(doc.updatedAt, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {content && (
              <button
                type="button"
                onClick={handleCopy}
                className="h-8 px-3 text-xs font-bold text-[#334155] hover:text-[#0f172a] bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-700">
                      {isEn ? 'Copied!' : 'Đã sao chép!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>{isEn ? 'Copy Text' : 'Sao chép văn bản'}</span>
                  </>
                )}
              </button>
            )}

            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(doc)}
                className="h-8 px-3 text-xs font-bold text-[#1d4ed8] hover:text-[#1e40af] bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isEn ? 'Download' : 'Tải xuống'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={isEn ? 'Close document reader' : 'Đóng cửa sổ xem tài liệu'}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Reader Content */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 sm:py-8 bg-white font-sans">
          {isLoadingContent ? (
            <div className="space-y-4 max-w-2xl mx-auto py-8">
              <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-4/6 animate-pulse" />
              <div className="h-20 bg-slate-50 border border-slate-200 rounded-lg animate-pulse mt-4" />
            </div>
          ) : content ? (
            <div className="max-w-3xl mx-auto text-[#1e293b] leading-relaxed text-[13.5px] whitespace-pre-wrap font-sans selection:bg-blue-100">
              {content}
            </div>
          ) : (
            <div className="p-12 text-center max-w-md mx-auto my-12">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[14px] text-[#0f172a]">
                {isEn ? 'No text preview available' : 'Chưa có nội dung văn bản trích xuất'}
              </h3>
              <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                {isEn
                  ? 'This file type might be binary or indexing has not yet finished extracting readable text. You can download the original file to view it.'
                  : 'Định dạng tệp này có thể là dạng nhị phân hoặc quá trình lập chỉ mục chưa trích xuất được văn bản đọc được. Bạn có thể tải tệp gốc về máy để xem.'}
              </p>
              {onDownload && (
                <button
                  type="button"
                  onClick={() => onDownload(doc)}
                  className="mt-4 h-8 px-4 text-xs font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Download Original File' : 'Tải tệp gốc'}</span>
                </button>
              )}
            </div>
          )}
        </main>

        {/* Modal Bottom Status Footer */}
        <footer className="px-6 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between text-xs text-[#64748b] shrink-0">
          <div className="font-mono text-[11px] text-[#94a3b8]">
            {doc.fileName} · {doc.id}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-7 px-4 text-xs font-bold text-[#475569] hover:text-[#0f172a] bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
          >
            {isEn ? 'Close' : 'Đóng'}
          </button>
        </footer>
      </div>
    </div>
  )
}
