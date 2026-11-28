import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getDocumentById,
  getDocuments,
  type DocType,
  type DocumentDetails,
} from '@/api/documents'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  ExternalLink,
  FileText,
  FileWarning,
  X,
} from 'lucide-react'

export interface FaultDocDrawerProps {
  /** Active fault code being looked up (null closes the drawer) */
  faultCode: string | null
  /** Callback invoked when closing via × button or Esc key */
  onClose: () => void
  /** Optional mocked documents strictly for Storybook/tests */
  mockDocuments?: DocumentDetails[]
  /** Locale code */
  locale?: 'vi' | 'en'
  className?: string
}

function getDocTypeLabel(docType: DocType, isEn: boolean): string {
  switch (docType) {
    case 'OPERATION_RUNBOOK':
      return isEn ? 'RUNBOOK' : 'QUY TRÌNH SOP'
    case 'VENDOR_SPECIFICATION':
      return isEn ? 'VENDOR SPEC' : 'TÀI LIỆU HÃNG'
    case 'POST_MORTEM_REPORT':
      return isEn ? 'POST-MORTEM' : 'BÁO CÁO SỰ CỐ'
    default:
      return docType
  }
}

export const FaultDocDrawer: React.FC<FaultDocDrawerProps> = ({
  faultCode,
  onClose,
  mockDocuments,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'
  const [selectedDocIdOverride, setSelectedDocIdOverride] = useState<string | null>(null)

  // Close drawer on Escape key (§Step 3.4b)
  useEffect(() => {
    if (!faultCode) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [faultCode, onClose])

  const searchQuery = useQuery({
    queryKey: ['documents', 'fault-lookup', faultCode],
    queryFn: () => getDocuments({ q: faultCode as string }),
    enabled: Boolean(faultCode && !mockDocuments),
    staleTime: 30000,
  })

  const matchedSummaries = useMemo(() => {
    if (mockDocuments) return mockDocuments
    return searchQuery.data ?? []
  }, [mockDocuments, searchQuery.data])

  const activeSummary = useMemo(() => {
    if (matchedSummaries.length === 0) return null
    if (selectedDocIdOverride) {
      const found = matchedSummaries.find((d) => d.id === selectedDocIdOverride)
      if (found) return found
    }
    return (
      matchedSummaries.find((d) => d.indexingStatus === 'READY') ??
      matchedSummaries[0]
    )
  }, [matchedSummaries, selectedDocIdOverride])

  const detailQuery = useQuery({
    queryKey: ['document', 'detail', activeSummary?.id],
    queryFn: () => getDocumentById(activeSummary!.id),
    enabled: Boolean(faultCode && activeSummary?.id && !mockDocuments),
    staleTime: 60000,
  })

  const activeDetails: DocumentDetails | null = useMemo(() => {
    if (!activeSummary) return null
    if (mockDocuments) {
      return mockDocuments.find((d) => d.id === activeSummary.id) ?? null
    }
    return detailQuery.data ?? null
  }, [activeSummary, mockDocuments, detailQuery.data])

  if (!faultCode) return null

  const documentsPageHref = activeSummary
    ? `/documents?docId=${encodeURIComponent(activeSummary.id)}`
    : '/documents'

  const isLoading = !mockDocuments && (searchQuery.isLoading || (Boolean(activeSummary) && detailQuery.isLoading))

  return (
    <aside
      role="dialog"
      aria-label={isEn ? `Fault documentation for ${faultCode}` : `Tra cứu tài liệu lỗi ${faultCode}`}
      data-testid="fault-doc-drawer"
      className={cn(
        'absolute inset-y-0 left-0 z-30 w-[390px] max-w-[calc(100%-16px)] flex flex-col',
        'bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md',
        'border-r border-slate-200 dark:border-slate-800 shadow-2xl',
        'animate-in slide-in-from-left duration-200 select-text',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-sky-500" />
            <span>{isEn ? 'FAULT KNOWLEDGE BASE' : 'TRA CỨU TÀI LIỆU LỖI'}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              data-testid="fault-doc-drawer-code"
              className="px-2 py-0.5 rounded border border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-extrabold tracking-tight"
            >
              {faultCode}
            </span>
            <span className="font-mono text-[9.5px] text-slate-400 dark:text-slate-500">
              ESC {isEn ? 'to close' : 'để đóng'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          data-testid="fault-doc-drawer-close"
          title={isEn ? 'Close drawer (Esc)' : 'Đóng panel (Esc)'}
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Multiple matching docs switcher */}
      {matchedSummaries.length > 1 && (
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {matchedSummaries.map((doc) => {
            const isSelected = activeSummary?.id === doc.id
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocIdOverride(doc.id)}
                className={cn(
                  'px-2 py-1 rounded font-mono text-[9.5px] font-bold whitespace-nowrap border transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                {doc.id}
              </button>
            )
          })}
        </div>
      )}

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
            <div className="h-32 w-full rounded-lg bg-slate-100 dark:bg-slate-900 animate-pulse" />
          </div>
        ) : searchQuery.isError && !mockDocuments ? (
          <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs space-y-1">
            <div className="font-mono font-bold uppercase text-[10px]">
              {isEn ? 'Lookup failed' : 'Không thể tải tài liệu'}
            </div>
            <p className="text-[11px] opacity-90">
              {isEn
                ? 'Unable to query document knowledge base.'
                : 'Không thể kết nối kho tài liệu kỹ thuật.'}
            </p>
          </div>
        ) : !activeSummary ? (
          <div
            data-testid="fault-doc-empty"
            className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
              <FileWarning className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {isEn
                ? `No matching runbook found for ${faultCode}`
                : `Chưa tìm thấy SOP khớp mã lỗi ${faultCode}`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isEn
                ? 'Open the Documents library to browse or upload troubleshooting guides.'
                : 'Bạn có thể mở trang Tài liệu để tìm kiếm hoặc tải lên quy trình xử lý.'}
            </p>
          </div>
        ) : (
          <>
            {/* Document Meta Card */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-mono text-[9px] font-bold">
                  {getDocTypeLabel(activeSummary.docType, isEn)}
                </span>
                <span className="font-mono text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">
                  {activeSummary.id} · v{activeSummary.version}
                </span>
              </div>

              <h3
                data-testid="fault-doc-title"
                className="text-[13px] font-bold leading-snug text-slate-900 dark:text-slate-100"
              >
                {activeSummary.title}
              </h3>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{activeSummary.fileName}</span>
                <span>·</span>
                <span>{activeSummary.source}</span>
              </div>
            </div>

            {/* Extracted Runbook Content */}
            <div
              data-testid="fault-doc-content"
              className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-1.5"
            >
              {(activeDetails?.content || '')
                .split('\n')
                .map((line, index) => {
                  const trimmed = line.trim()
                  if (!trimmed) return <div key={index} className="h-1" />
                  if (trimmed.startsWith('# ')) {
                    return (
                      <div
                        key={index}
                        className="text-[12.5px] font-extrabold text-slate-900 dark:text-white pt-1"
                      >
                        {trimmed.slice(2)}
                      </div>
                    )
                  }
                  if (trimmed.startsWith('## ')) {
                    return (
                      <div
                        key={index}
                        className="font-mono text-[10.5px] font-extrabold uppercase tracking-wide text-sky-700 dark:text-sky-400 pt-2"
                      >
                        {trimmed.slice(3)}
                      </div>
                    )
                  }
                  if (trimmed.startsWith('- ')) {
                    return (
                      <div key={index} className="flex items-start gap-2 pl-1">
                        <span className="text-sky-500 font-bold leading-relaxed">•</span>
                        <span>{trimmed.slice(2)}</span>
                      </div>
                    )
                  }
                  return <p key={index}>{trimmed}</p>
                })}
            </div>
          </>
        )}
      </div>

      {/* Footer Link to /documents in New Tab (§Step 3.4b) */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2 shrink-0">
        <a
          href={documentsPageHref}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="fault-doc-open-page-link"
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-mono text-[10.5px] font-bold transition-colors no-underline shadow-xs"
        >
          <span>{isEn ? 'Open Full Documents Page' : 'Mở ở trang Tài liệu'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  )
}
