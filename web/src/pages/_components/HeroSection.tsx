import { Button } from '@/components/ui/button'

export interface HeroSectionProps {
  title: string
  description: string
  hasActiveSession?: boolean
  primaryCtaText: string
  secondaryCtaText?: string
  noteText?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
}

export function HeroSection({
  title,
  description,
  primaryCtaText,
  secondaryCtaText,
  noteText,
  onPrimaryClick,
  onSecondaryClick,
}: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center text-center max-w-3xl mx-auto pt-6 pb-2 px-4">
      <h1 className="text-[36px] sm:text-[42px] md:text-[46px] font-extrabold tracking-[-0.02em] text-[#0f172a] dark:text-[#f8fafc] leading-[1.15] m-0">
        {title}
      </h1>

      <p className="text-[15px] md:text-[16px] text-[#64748b] dark:text-[#94a3b8] max-w-[680px] leading-[1.6] mt-3.5 mb-8">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3.5">
        <Button
          size="lg"
          onClick={onPrimaryClick}
          className="h-11 px-[22px] bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {primaryCtaText}
        </Button>

        {secondaryCtaText && (
          <Button
            variant="outline"
            size="lg"
            onClick={onSecondaryClick}
            className="h-11 px-[22px] bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] hover:border-[#94a3b8] dark:hover:border-[#64748b] text-[#334155] dark:text-[#cbd5e1] font-bold text-sm rounded-lg shadow-none transition-colors cursor-pointer"
          >
            {secondaryCtaText}
          </Button>
        )}
      </div>

      {noteText && (
        <p className="text-[12px] text-[#94a3b8] dark:text-[#64748b] font-sans mt-3.5 leading-normal">
          {noteText}
        </p>
      )}
    </section>
  )
}
