import type { LookupTab } from './lookupUtils'
import { Server, Network, Layers } from 'lucide-react'

export interface LookupTabsProps {
  activeTab: LookupTab
  counts: {
    devices: number
    links: number
    services: number
  }
  locale?: 'vi' | 'en'
  onTabChange: (tab: LookupTab) => void
}

export function LookupTabs({
  activeTab,
  counts,
  locale = 'vi',
  onTabChange,
}: LookupTabsProps) {
  const isEn = locale === 'en'

  const tabs: {
    id: LookupTab
    label: string
    count: number
    icon: typeof Server
  }[] = [
    {
      id: 'devices',
      label: isEn ? 'Devices' : 'Thiết bị',
      count: counts.devices,
      icon: Server,
    },
    {
      id: 'links',
      label: isEn ? 'Links' : 'Liên kết',
      count: counts.links,
      icon: Network,
    },
    {
      id: 'services',
      label: isEn ? 'Services' : 'Dịch vụ',
      count: counts.services,
      icon: Layers,
    },
  ]

  return (
    <div
      role="tablist"
      aria-label={isEn ? 'Resource type tabs' : 'Các tab loại tài nguyên'}
      className="flex items-center gap-6 border-b border-[#e2e8f0] dark:border-[#1e293b] px-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`group inline-flex items-center gap-2 pb-3 pt-2 text-[13px] font-bold border-b-2 transition-all cursor-pointer select-none -mb-px ${
              isActive
                ? 'border-[#1d4ed8] text-[#1d4ed8] dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-[#f8fafc] hover:border-[#cbd5e1] dark:hover:border-[#334155]'
            }`}
          >
            <Icon
              className={`w-4 h-4 transition-colors ${
                isActive
                  ? 'text-[#1d4ed8] dark:text-blue-400'
                  : 'text-[#94a3b8] dark:text-[#64748b] group-hover:text-[#64748b] dark:group-hover:text-[#94a3b8]'
              }`}
            />
            <span>{tab.label}</span>
            <span
              className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-full transition-colors ${
                isActive
                  ? 'bg-blue-50 text-[#1d4ed8] dark:bg-blue-950/60 dark:text-blue-300'
                  : 'bg-[#f1f5f9] text-[#64748b] dark:bg-[#1e293b] dark:text-[#94a3b8] group-hover:bg-[#e2e8f0] dark:group-hover:bg-[#334155]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
