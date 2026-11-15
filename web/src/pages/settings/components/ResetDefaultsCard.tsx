import { useState } from 'react'
import { RotateCcw, AlertTriangle, X } from 'lucide-react'

export interface ResetDefaultsCardProps {
  locale?: 'vi' | 'en'
  onReset: () => void
}

export function ResetDefaultsCard({
  locale = 'vi',
  onReset,
}: ResetDefaultsCardProps) {
  const isEn = locale === 'en'
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleConfirm = () => {
    setShowConfirmModal(false)
    onReset()
  }

  return (
    <>
      <section className="bg-white border border-[#e2e8f0] rounded-xl px-5 py-3 mb-3.5 shadow-xs">
        <div className="font-mono text-[11px] font-extrabold tracking-[0.14em] text-[#64748b] uppercase py-2">
          {isEn ? 'RESET DEFAULTS' : 'KHÔI PHỤC MẶC ĐỊNH'}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-[#f1f5f9]">
          <div className="flex-1">
            <div className="text-[13.5px] font-bold text-[#0f172a]">
              {isEn ? 'Reset all options to default values' : 'Đưa mọi tùy chọn về giá trị ban đầu'}
            </div>
            <div className="text-[12px] text-[#64748b] mt-0.5">
              {isEn
                ? 'Theme back to Light, display settings to system defaults'
                : 'Chủ đề về Sáng, các tùy chọn hiển thị về mặc định của hệ thống'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center justify-center gap-1.5 h-8 px-3.5 text-xs font-bold text-[#dc2626] hover:text-[#b91c1c] bg-white hover:bg-[#fef2f2] border border-[#fca5a5] hover:border-[#f87171] rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEn ? 'Reset to defaults' : 'Khôi phục mặc định'}</span>
          </button>
        </div>
      </section>

      {/* Confirmation Modal Dialog */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
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
                onClick={() => setShowConfirmModal(false)}
                className="text-[#94a3b8] hover:text-[#475569] p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3.5">
              <h3 id="reset-modal-title" className="text-base font-bold text-[#0f172a]">
                {isEn ? 'Reset to default settings?' : 'Khôi phục cài đặt mặc định?'}
              </h3>
              <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                {isEn
                  ? 'All theme preferences, display options, and dashboard configurations will be restored to their factory defaults. This action will be saved immediately.'
                  : 'Mọi tùy chọn giao diện, hiển thị Dashboard và điều tra sẽ được đưa về giá trị gốc của hệ thống. Tùy chọn sẽ được lưu ngay lập tức.'}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="h-8 px-4 text-xs font-bold text-[#475569] hover:text-[#0f172a] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Hủy'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="h-8 px-4 text-xs font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg transition-colors cursor-pointer shadow-xs border-0"
              >
                {isEn ? 'Confirm Reset' : 'Xác nhận khôi phục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
