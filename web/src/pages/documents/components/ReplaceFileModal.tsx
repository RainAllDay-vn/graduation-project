import { useState, useRef } from 'react'
import type { DocumentDetails, DocumentSummary } from '@/api/documents'
import { RefreshCw, X, FileText, AlertCircle, Loader2 } from 'lucide-react'

export interface ReplaceFileModalProps {
  isOpen: boolean
  document?: DocumentDetails | DocumentSummary | null
  isReplacing?: boolean
  error?: string | null
  locale?: 'vi' | 'en'
  onClose: () => void
  onSubmit: (file: File) => void
}

export function ReplaceFileModal({
  isOpen,
  document: doc,
  isReplacing = false,
  error = null,
  locale = 'vi',
  onClose,
  onSubmit,
}: ReplaceFileModalProps) {
  const isEn = locale === 'en'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!isOpen || !doc) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValidationError(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValidationError(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setValidationError(
        isEn
          ? 'Please select a replacement file.'
          : 'Vui lòng chọn tệp mới để thay thế.'
      )
      return
    }

    setValidationError(null)
    onSubmit(selectedFile)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="replace-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1d4ed8] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h3 id="replace-modal-title" className="text-base font-bold text-[#0f172a]">
              {isEn ? 'Replace Document File' : 'Thay thế tệp tài liệu'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isReplacing}
            className="p-1 rounded-md text-[#94a3b8] hover:text-[#475569] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target Document Info Box */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-xs">
            <span className="font-mono text-[10px] text-[#64748b] tracking-wider uppercase block">
              {isEn ? 'TARGET DOCUMENT' : 'TÀI LIỆU ĐƯỢC CHỌN'}
            </span>
            <div className="font-bold text-[#0f172a] mt-0.5 truncate">{doc.title}</div>
            <div className="text-[11px] text-[#64748b] mt-0.5">
              {isEn ? 'Current Version:' : 'Phiên bản hiện tại:'}{' '}
              <strong className="text-[#334155]">v{doc.version || 1}</strong>
            </div>
          </div>

          {/* Error Message */}
          {(error || validationError) && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Replacement File Dropzone */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
              {isEn ? 'Select Revised File' : 'Chọn tệp thay thế'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#cbd5e1] hover:border-[#1d4ed8] rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#f8fafc]/50 hover:bg-blue-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".md,.txt,.docx,.pdf,.csv"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1d4ed8]">
                  <FileText className="w-5 h-5" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="text-[#64748b] font-normal">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <RefreshCw className="w-6 h-6 text-[#94a3b8] mx-auto" />
                  <p className="text-xs font-bold text-[#334155]">
                    {isEn ? 'Choose new version file' : 'Bấm để chọn tệp phiên bản mới'}
                  </p>
                  <p className="text-[11px] text-[#94a3b8]">
                    {isEn ? 'Old version will be kept' : 'Phiên bản cũ sẽ được giữ lại'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Information Notice */}
          <p className="text-[11px] text-[#64748b] leading-relaxed">
            {isEn
              ? 'Replacing the file creates a new version (v' +
                ((doc.version || 1) + 1) +
                ') and immediately restarts AI vector indexing.'
              : 'Nạp tệp mới sẽ tạo phiên bản v' +
                ((doc.version || 1) + 1) +
                ' và kích hoạt lại quá trình lập chỉ mục vector cho AI.'}
          </p>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isReplacing}
              className="h-8 px-4 text-xs font-bold text-[#475569] hover:text-[#0f172a] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Hủy'}
            </button>
            <button
              type="submit"
              disabled={isReplacing}
              className="h-8 px-4 text-xs font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-60 rounded-lg transition-colors cursor-pointer shadow-xs border-0 flex items-center gap-1.5"
            >
              {isReplacing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Replacing...' : 'Đang thay thế...'}</span>
                </>
              ) : (
                <span>{isEn ? 'Update Version' : 'Cập nhật phiên bản'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
