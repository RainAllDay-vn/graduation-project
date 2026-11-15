import { useState, useRef } from 'react'
import type { DocType, DocumentSource, UploadDocumentParams } from '@/api/documents'
import { UploadCloud, X, FileText, AlertCircle, Loader2 } from 'lucide-react'

export interface UploadDocumentModalProps {
  isOpen: boolean
  isUploading?: boolean
  error?: string | null
  locale?: 'vi' | 'en'
  onClose: () => void
  onSubmit: (params: UploadDocumentParams) => void
}

export function UploadDocumentModal({
  isOpen,
  isUploading = false,
  error = null,
  locale = 'vi',
  onClose,
  onSubmit,
}: UploadDocumentModalProps) {
  const isEn = locale === 'en'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState<DocType>('OPERATION_RUNBOOK')
  const [source, setSource] = useState<DocumentSource>('MANUAL')
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValidationError(null)
      // Auto-populate title if empty
      if (!title.trim()) {
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        setTitle(baseName)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValidationError(null)
      if (!title.trim()) {
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        setTitle(baseName)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setValidationError(
        isEn ? 'Please choose a document file to upload.' : 'Vui lòng chọn tệp tài liệu để tải lên.'
      )
      return
    }
    if (!title.trim()) {
      setValidationError(
        isEn ? 'Document title is required.' : 'Vui lòng nhập tên tài liệu.'
      )
      return
    }

    setValidationError(null)
    onSubmit({
      title: title.trim(),
      docType,
      source,
      file: selectedFile,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1d4ed8] flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h3 id="upload-modal-title" className="text-base font-bold text-[#0f172a]">
              {isEn ? 'Upload Technical Document' : 'Tải lên tài liệu kỹ thuật'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-md text-[#94a3b8] hover:text-[#475569] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Error Banner */}
          {(error || validationError) && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* File Dropzone Area */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
              {isEn ? 'Choose File' : 'Chọn tệp tài liệu'} <span className="text-red-500">*</span>
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
                  <span className="truncate max-w-[260px]">{selectedFile.name}</span>
                  <span className="text-[#64748b] font-normal">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-8 h-8 text-[#94a3b8] mx-auto" />
                  <p className="text-xs font-bold text-[#334155]">
                    {isEn ? 'Click to select or drag and drop file here' : 'Bấm để chọn tệp hoặc kéo thả vào đây'}
                  </p>
                  <p className="text-[11px] text-[#94a3b8]">
                    {isEn ? 'Supported: .md, .txt, .docx, .pdf, .csv' : 'Định dạng hỗ trợ: .md, .txt, .docx, .pdf, .csv'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
              {isEn ? 'Document Title' : 'Tên tài liệu'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEn ? 'e.g., Optical Cable Incident Handling SOP' : 'Ví dụ: Quy trình xử lý đứt cáp quang'}
              className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition"
            />
          </div>

          {/* DocType & Source Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
                {isEn ? 'Document Type' : 'Loại tài liệu'}
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType)}
                className="w-full h-9 px-2.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              >
                <option value="OPERATION_RUNBOOK">
                  {isEn ? 'Operation Runbook (SOP)' : 'Quy trình vận hành (SOP)'}
                </option>
                <option value="VENDOR_SPECIFICATION">
                  {isEn ? 'Vendor Specification' : 'Tài liệu kỹ thuật hãng'}
                </option>
                <option value="POST_MORTEM_REPORT">
                  {isEn ? 'Post-Mortem Report' : 'Báo cáo sự cố cũ'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
                {isEn ? 'Source' : 'Nguồn gốc'}
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as DocumentSource)}
                className="w-full h-9 px-2.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              >
                <option value="MANUAL">{isEn ? 'Direct Upload' : 'Tải lên trực tiếp'}</option>
                <option value="INTERNAL_WIKI">{isEn ? 'Internal Wiki' : 'Wiki nội bộ'}</option>
                <option value="CONFLUENCE">Confluence</option>
                <option value="OPERATIONS_DRIVE">{isEn ? 'Operations Drive' : 'Drive vận hành'}</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="h-8 px-4 text-xs font-bold text-[#475569] hover:text-[#0f172a] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Hủy'}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="h-8 px-4 text-xs font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-60 rounded-lg transition-colors cursor-pointer shadow-xs border-0 flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Uploading...' : 'Đang tải lên...'}</span>
                </>
              ) : (
                <span>{isEn ? 'Start Upload' : 'Bắt đầu tải lên'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
