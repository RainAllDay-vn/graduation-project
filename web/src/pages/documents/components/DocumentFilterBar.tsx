import type { DocumentSource, IndexingStatus } from '@/api/documents'
import { Search, X } from 'lucide-react'

export interface DocumentFilterBarProps {
  searchQuery: string
  selectedStatus?: IndexingStatus | 'ALL'
  selectedSource?: DocumentSource | 'ALL'
  locale?: 'vi' | 'en'
  onSearchChange: (q: string) => void
  onStatusChange: (status: IndexingStatus | 'ALL') => void
  onSourceChange: (source: DocumentSource | 'ALL') => void
  onResetFilters: () => void
}

export function DocumentFilterBar({
  searchQuery,
  selectedStatus = 'ALL',
  selectedSource = 'ALL',
  locale = 'vi',
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onResetFilters,
}: DocumentFilterBarProps) {
  const isEn = locale === 'en'

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedSource !== 'ALL'

  const statusOptions: { value: IndexingStatus | 'ALL'; labelVi: string; labelEn: string }[] = [
    { value: 'ALL', labelVi: 'Tất cả trạng thái', labelEn: 'All Statuses' },
    { value: 'READY', labelVi: 'Sẵn sàng', labelEn: 'Ready' },
    { value: 'INDEXING', labelVi: 'Đang lập chỉ mục', labelEn: 'Indexing' },
    { value: 'FAILED', labelVi: 'Lỗi', labelEn: 'Failed' },
  ]

  const sourceOptions: { value: DocumentSource | 'ALL'; labelVi: string; labelEn: string }[] = [
    { value: 'ALL', labelVi: 'Tất cả nguồn', labelEn: 'All Sources' },
    { value: 'MANUAL', labelVi: 'Tải lên trực tiếp', labelEn: 'Direct Upload' },
    { value: 'INTERNAL_WIKI', labelVi: 'Wiki nội bộ', labelEn: 'Internal Wiki' },
    { value: 'CONFLUENCE', labelVi: 'Confluence', labelEn: 'Confluence' },
    { value: 'OPERATIONS_DRIVE', labelVi: 'Drive vận hành', labelEn: 'Operations Drive' },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            isEn ? 'Search documents by title...' : 'Tìm kiếm theo tên tài liệu...'
          }
          className="w-full h-9 pl-9 pr-8 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-xs text-[#0f172a] dark:text-[#f8fafc] placeholder-[#94a3b8] dark:placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] dark:hover:text-[#cbd5e1] p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Select Filter Dropdowns */}
      <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0">
        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) =>
            onStatusChange(e.target.value as IndexingStatus | 'ALL')
          }
          className="h-9 px-2.5 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-xs font-medium text-[#334155] dark:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] shadow-xs cursor-pointer"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="dark:bg-[#0f172a] dark:text-[#f8fafc]">
              {isEn ? opt.labelEn : opt.labelVi}
            </option>
          ))}
        </select>

        {/* Source Dropdown */}
        <select
          value={selectedSource}
          onChange={(e) =>
            onSourceChange(e.target.value as DocumentSource | 'ALL')
          }
          className="h-9 px-2.5 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-xs font-medium text-[#334155] dark:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] shadow-xs cursor-pointer"
        >
          {sourceOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="dark:bg-[#0f172a] dark:text-[#f8fafc]">
              {isEn ? opt.labelEn : opt.labelVi}
            </option>
          ))}
        </select>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="h-9 px-2.5 text-xs text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-[#f8fafc] hover:bg-slate-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors cursor-pointer shrink-0"
          >
            {isEn ? 'Reset' : 'Đặt lại'}
          </button>
        )}
      </div>
    </div>
  )
}
