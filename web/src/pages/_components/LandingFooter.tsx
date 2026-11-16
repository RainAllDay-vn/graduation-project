export interface LandingFooterProps {
  version: string
  environment: string
  supportContact: string
  locale?: 'vi' | 'en'
}

export function LandingFooter({
  version,
  environment,
  supportContact,
  locale = 'vi',
}: LandingFooterProps) {
  const isEn = locale === 'en'

  return (
    <footer className="w-full pt-16 pb-6 text-center font-mono text-[11px] font-bold tracking-[0.1em] text-[#94a3b8] dark:text-[#64748b] flex items-center justify-center gap-2">
      <span>NOC TOPOLOGY {version}</span>
      <span>·</span>
      <span>
        {isEn ? 'ENVIRONMENT' : 'MÔI TRƯỜNG'}{' '}
        <span className="text-[#f59e0b] font-extrabold">{environment}</span>
      </span>
      <span>·</span>
      <span>{isEn ? 'SUPPORT' : 'HỖ TRỢ'}: {supportContact}</span>
    </footer>
  )
}
