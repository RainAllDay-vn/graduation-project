import type { DocumentSummary } from '@/api/documents'
import {
  formatBytes,
  formatRelativeTime,
  getSourceLabel,
  getStatusChipConfig,
} from './documentUtils'
import { FileText, Inbox } from 'lucide-react'

export interface DocumentTableProps {
  documents: DocumentSummary[]
  selectedId?: string | null
  newlyUploadedId?: string | null
  isLoading?: boolean
  locale?: 'vi' | 'en'
  onSelectDocument: (doc: DocumentSummary) => void
}

export function DocumentTable({
  documents,
  selectedId,
  newlyUploadedId,
  isLoading = false,
  locale = 'vi',
  onSelectDocument,
}: DocumentTableProps) {
  const isEn = locale === 'en'

  if (isLoading) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-xs">
        <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-4 flex items-center">
          <div className="h-3.5 bg-slate-200 rounded w-1/4 animate-pulse" />
        </div>
        <div className="divide-y divide-[#f1f5f9] p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
              </div>
              <div className="h-5 bg-slate-100 rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <div className="font-bold text-[14px] text-[#0f172a] mt-3">
          {isEn ? 'No documents found' : 'Không tìm thấy tài liệu nào'}
        </div>
        <div className="text-[12.5px] text-[#64748b] mt-1">
          {isEn
            ? 'Try adjusting your search keywords or filter criteria.'
            : 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc.'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header Row */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] font-mono text-[10.5px] font-extrabold tracking-[0.1em] text-[#64748b] uppercase">
            <span className="flex-[2.2] min-w-0">
              {isEn ? 'DOCUMENT' : 'TÀI LIỆU'}
            </span>
            <span className="flex-1 min-w-0">
              {isEn ? 'SOURCE' : 'NGUỒN'}
            </span>
            <span className="w-16 shrink-0">
              {isEn ? 'FORMAT' : 'LOẠI'}
            </span>
            <span className="flex-1 min-w-0">
              {isEn ? 'UPDATED' : 'CẬP NHẬT'}
            </span>
            <span className="w-36 shrink-0 text-right">
              {isEn ? 'INDEXING' : 'LẬP CHỈ MỤC'}
            </span>
          </div>

          {/* Document Rows */}
          <div className="divide-y divide-[#f1f5f9]">
            {documents.map((doc) => {
              const isSelected = selectedId === doc.id
              const isNew = newlyUploadedId === doc.id
              const chip = getStatusChipConfig(
                doc.indexingStatus,
                doc.statusReason,
                locale
              )
              const formatLabel = doc.fileFormat || 'MD'
              const sizeLabel = formatBytes(doc.fileSizeBytes)

              return (
                <div
                  key={doc.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectDocument(doc)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectDocument(doc)
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d4ed8] ${
                    isSelected
                      ? 'bg-[#eff6ff] shadow-[inset_3px_0_0_#1d4ed8]'
                      : isNew
                      ? 'bg-[#f0fdf4]/70 hover:bg-[#f0fdf4]'
                      : 'hover:bg-[#f8fafc]'
                  }`}
                >
                  {/* Column 1: Document Name & File Metadata */}
                  <div className="flex-[2.2] min-w-0 pr-2">
                    <div className="font-bold text-[13px] text-[#0f172a] truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                    <div className="text-[11.5px] text-[#64748b] mt-0.5 truncate pl-5">
                      {formatLabel} · {sizeLabel}
                    </div>
                  </div>

                  {/* Column 2: Source */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-[#334155] truncate block">
                      {getSourceLabel(doc.source, locale)}
                    </span>
                  </div>

                  {/* Column 3: Format */}
                  <div className="w-16 shrink-0">
                    <span className="font-mono text-[11px] font-bold text-[#475569] uppercase">
                      {formatLabel}
                    </span>
                  </div>

                  {/* Column 4: Updated */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-[#64748b] truncate block">
                      {formatRelativeTime(doc.updatedAt, locale)}
                    </span>
                  </div>

                  {/* Column 5: Indexing Status Chip */}
                  <div className="w-36 shrink-0 flex justify-end">
                    <span
                      title={doc.statusReason || chip.label}
                      className={`inline-block font-mono text-[9.5px] font-extrabold tracking-[0.07em] rounded px-2 py-0.5 max-w-full truncate ${chip.className}`}
                    >
                      {chip.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
