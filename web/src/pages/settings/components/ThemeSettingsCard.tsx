import type { Theme, Locale } from '@/context'
import { Sun, Moon, Laptop, Globe } from 'lucide-react'

export interface ThemeSettingsCardProps {
  theme: Theme
  locale: Locale
  onThemeChange: (theme: Theme) => void
  onLocaleChange: (locale: Locale) => void
}

export function ThemeSettingsCard({
  theme,
  locale,
  onThemeChange,
  onLocaleChange,
}: ThemeSettingsCardProps) {
  const isEn = locale === 'en'

  const themeOptions: { value: Theme; labelVi: string; labelEn: string; icon: React.ReactNode }[] = [
    { value: 'light', labelVi: 'Sáng', labelEn: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'dark', labelVi: 'Tối', labelEn: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { value: 'system', labelVi: 'Theo hệ thống', labelEn: 'System', icon: <Laptop className="w-3.5 h-3.5" /> },
  ]

  const localeOptions: { value: Locale; label: string }[] = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
  ]

  return (
    <section className="bg-white border border-[#e2e8f0] rounded-xl px-5 py-3 mb-3.5 shadow-xs">
      <div className="font-mono text-[11px] font-extrabold tracking-[0.14em] text-[#64748b] uppercase py-2">
        {isEn ? 'APPEARANCE' : 'GIAO DIỆN'}
      </div>

      {/* Theme Selection Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-[#f1f5f9]">
        <div className="flex-1">
          <div className="text-[13.5px] font-bold text-[#0f172a]">
            {isEn ? 'Theme' : 'Chủ đề'}
          </div>
          <div className="text-[12px] text-[#64748b] mt-0.5">
            {isEn
              ? 'Applied immediately across all pages upon change'
              : 'Áp dụng ngay trên mọi trang sau khi đổi'}
          </div>
        </div>

        {/* Segmented Theme Pills */}
        <div
          role="radiogroup"
          aria-label={isEn ? 'Select Theme' : 'Chọn chủ đề'}
          className="inline-flex bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-0.5 gap-1 shrink-0 self-start sm:self-auto"
        >
          {themeOptions.map((opt) => {
            const isActive = theme === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onThemeChange(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a] hover:bg-slate-200/50'
                }`}
              >
                {opt.icon}
                <span>{isEn ? opt.labelEn : opt.labelVi}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Language Selection Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-[#f1f5f9]">
        <div className="flex-1">
          <div className="text-[13.5px] font-bold text-[#0f172a] flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#64748b]" />
            <span>{isEn ? 'Language' : 'Ngôn ngữ'}</span>
          </div>
          <div className="text-[12px] text-[#64748b] mt-0.5">
            {isEn ? 'Interface display language' : 'Ngôn ngữ hiển thị toàn ứng dụng'}
          </div>
        </div>

        {/* Segmented Locale Pills */}
        <div
          role="radiogroup"
          aria-label={isEn ? 'Select Language' : 'Chọn ngôn ngữ'}
          className="inline-flex bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-0.5 gap-1 shrink-0 self-start sm:self-auto"
        >
          {localeOptions.map((opt) => {
            const isActive = locale === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onLocaleChange(opt.value)}
                className={`px-3 py-1.5 rounded-md text-[12.5px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a] hover:bg-slate-200/50'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
