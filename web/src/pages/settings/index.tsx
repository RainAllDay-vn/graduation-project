import { useSettings, type UserSettings, type SaveStatus } from '@/context'
import { SettingsBanner } from './components/SettingsBanner'
import { ThemeSettingsCard } from './components/ThemeSettingsCard'
import { DashboardSettingsCard } from './components/DashboardSettingsCard'
import { ResetDefaultsCard } from './components/ResetDefaultsCard'

export interface SettingsViewProps {
  draftSettings: UserSettings
  saveStatus: SaveStatus
  onDraftChange: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => void
  onSave: () => void
  onDiscard: () => void
  onReset: () => void
  onDismissSaved: () => void
}

export function SettingsView({
  draftSettings,
  saveStatus,
  onDraftChange,
  onSave,
  onDiscard,
  onReset,
  onDismissSaved,
}: SettingsViewProps) {
  const isEn = draftSettings.locale === 'en'

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-4 sm:px-6 py-6 sm:py-8">
      <div className="w-full">
        {/* Page Title & Subtitle */}
        <div className="text-center pt-2 pb-1">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] dark:text-[#f8fafc] tracking-tight">
            {isEn ? 'Settings' : 'Cài đặt'}
          </h1>
          <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] mt-1.5">
            {isEn
              ? 'App-wide UI preferences · saved to account, applied on all signed-in devices'
              : 'Tùy chọn giao diện toàn ứng dụng · lưu theo tài khoản, áp dụng mọi thiết bị đăng nhập'}
          </p>
        </div>

        {/* Centered Main Form Column (720px max-width) */}
        <div className="max-w-[720px] w-full mx-auto mt-4 sm:mt-5">
          {/* Status Alert Banner (Unsaved Warning / Saved Confirmation) */}
          <SettingsBanner
            saveStatus={saveStatus}
            locale={draftSettings.locale}
            onSave={onSave}
            onDiscard={onDiscard}
            onDismissSaved={onDismissSaved}
          />

          {/* Theme & Appearance Card */}
          <ThemeSettingsCard
            theme={draftSettings.theme}
            locale={draftSettings.locale}
            onThemeChange={(th) => onDraftChange('theme', th)}
            onLocaleChange={(loc) => onDraftChange('locale', loc)}
          />

          {/* Default Dashboard & Overview Display Settings */}
          <DashboardSettingsCard
            settings={draftSettings}
            locale={draftSettings.locale}
            onToggle={(key, val) => onDraftChange(key, val)}
          />

          {/* Reset to Defaults Card */}
          <ResetDefaultsCard
            locale={draftSettings.locale}
            onReset={onReset}
          />
        </div>
      </div>

      {/* App Footnote */}
      <footer className="text-center font-mono text-[11px] text-[#94a3b8] dark:text-[#64748b] tracking-widest uppercase mt-8 pt-4 pb-2">
        NOC TOPOLOGY v0.4 ·{' '}
        <span className="text-[#64748b] dark:text-[#94a3b8]">
          {isEn ? 'ENVIRONMENT' : 'MÔI TRƯỜNG'}{' '}
          <span className="bg-[#e2e8f0] dark:bg-[#1e293b] px-1 py-0.5 rounded text-[10px] text-[#475569] dark:text-[#cbd5e1] font-bold">
            TEST
          </span>
        </span>{' '}
        · {isEn ? 'SUPPORT: INTERNAL IT' : 'HỖ TRỢ: IT NỘI BỘ'}
      </footer>
    </div>
  )
}

export default function SettingsPage() {
  const {
    draftSettings,
    saveStatus,
    updateDraftSetting,
    saveSettings,
    discardDraft,
    resetToDefaults,
    setSaveStatus,
  } = useSettings()

  return (
    <SettingsView
      draftSettings={draftSettings}
      saveStatus={saveStatus}
      onDraftChange={updateDraftSetting}
      onSave={saveSettings}
      onDiscard={discardDraft}
      onReset={resetToDefaults}
      onDismissSaved={() => setSaveStatus('idle')}
    />
  )
}
