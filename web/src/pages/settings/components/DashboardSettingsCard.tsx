import type { UserSettings } from '@/context'

export interface DashboardSettingsCardProps {
  settings: Pick<
    UserSettings,
    | 'showDeviceLabels'
    | 'autoSelectOnAlarm'
    | 'blastRadiusBeacon'
    | 'showIpInPicker'
    | 'promptResumeInvestigation'
  >
  locale?: 'vi' | 'en'
  onToggle: (
    key: keyof Pick<
      UserSettings,
      | 'showDeviceLabels'
      | 'autoSelectOnAlarm'
      | 'blastRadiusBeacon'
      | 'showIpInPicker'
      | 'promptResumeInvestigation'
    >,
    value: boolean
  ) => void
}

interface ToggleItem {
  id: keyof Pick<
    UserSettings,
    | 'showDeviceLabels'
    | 'autoSelectOnAlarm'
    | 'blastRadiusBeacon'
    | 'showIpInPicker'
    | 'promptResumeInvestigation'
  >
  titleVi: string
  titleEn: string
  descVi: string
  descEn: string
}

export function DashboardSettingsCard({
  settings,
  locale = 'vi',
  onToggle,
}: DashboardSettingsCardProps) {
  const isEn = locale === 'en'

  const items: ToggleItem[] = [
    {
      id: 'showDeviceLabels',
      titleVi: 'Hiện nhãn thiết bị trên topology',
      titleEn: 'Show device labels on topology',
      descVi: 'Tên thiết bị hiện cạnh nút trên canvas',
      descEn: 'Device names displayed next to nodes on canvas',
    },
    {
      id: 'autoSelectOnAlarm',
      titleVi: 'Tự động chọn đối tượng khi bấm cảnh báo',
      titleEn: 'Auto-select entity when clicking alarm',
      descVi: 'Bấm cảnh báo trong timeline chọn luôn thiết bị liên quan',
      descEn: 'Clicking alarm in timeline selects the associated device',
    },
    {
      id: 'blastRadiusBeacon',
      titleVi: 'Hiệu ứng beacon khi khoanh vùng ảnh hưởng',
      titleEn: 'Beacon pulse effect for blast radius',
      descVi: 'Vòng sóng nhấp nháy trên thiết bị thuộc vùng ảnh hưởng',
      descEn: 'Pulsing wave rings on devices within blast radius',
    },
    {
      id: 'showIpInPicker',
      titleVi: 'Hiện địa chỉ IP cạnh tên thiết bị',
      titleEn: 'Show IP address next to device name',
      descVi: 'Trong bảng chọn thiết bị và tooltip',
      descEn: 'Displayed in device selector and tooltips',
    },
    {
      id: 'promptResumeInvestigation',
      titleVi: 'Hỏi tiếp tục phiên điều tra dở khi đăng nhập',
      titleEn: 'Prompt to resume ongoing investigation',
      descVi: 'Điều khiển băng thông báo tiếp tục điều tra ở Tổng quan',
      descEn: 'Controls the resume investigation banner on the Overview page',
    },
  ]

  return (
    <section className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl px-5 py-3 mb-3.5 shadow-xs transition-colors">
      <div className="font-mono text-[11px] font-extrabold tracking-[0.14em] text-[#64748b] dark:text-[#94a3b8] uppercase py-2">
        {isEn ? 'DEFAULT DISPLAY (DASHBOARD)' : 'HIỂN THỊ MẶC ĐỊNH (DASHBOARD)'}
      </div>

      <div className="text-[12px] text-[#64748b] dark:text-[#94a3b8] pb-2.5">
        {isEn
          ? 'Initial values when opening Dashboard — quick toggles in section 4.4 only affect current session.'
          : 'Giá trị ban đầu khi mở Dashboard — phím chỉnh nhanh ở mục 4.4 chỉ tác động phiên đang mở.'}
      </div>

      <div className="divide-y divide-[#f1f5f9] dark:divide-[#1e293b]">
        {items.map((item) => {
          const isChecked = !!settings[item.id]

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-[13.5px] font-bold text-[#0f172a] dark:text-[#f8fafc]">
                  {isEn ? item.titleEn : item.titleVi}
                </div>
                <div className="text-[12px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 truncate sm:text-wrap">
                  {isEn ? item.descEn : item.descVi}
                </div>
              </div>

              {/* Accessible Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                aria-label={isEn ? item.titleEn : item.titleVi}
                onClick={() => onToggle(item.id, !isChecked)}
                className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8] focus-visible:ring-offset-2 ${
                  isChecked
                    ? 'bg-[#1d4ed8] border-[#1d4ed8]'
                    : 'bg-[#e2e8f0] dark:bg-[#334155] border-[#cbd5e1] dark:border-[#475569]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-[2px] ${
                    isChecked ? 'translate-x-[20px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
