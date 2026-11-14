export interface LandingFooterProps {
  version: string
  environment: string
  supportContact: string
}

export function LandingFooter({
  version,
  environment,
  supportContact,
}: LandingFooterProps) {
  return (
    <footer className="w-full pt-16 pb-6 text-center font-mono text-[11px] font-bold tracking-[0.1em] text-[#94a3b8] flex items-center justify-center gap-2">
      <span>NOC TOPOLOGY {version}</span>
      <span>·</span>
      <span>
        MÔI TRƯỜNG <span className="text-[#f59e0b] font-extrabold">{environment}</span>
      </span>
      <span>·</span>
      <span>HỖ TRỢ: {supportContact}</span>
    </footer>
  )
}
