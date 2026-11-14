export interface CapabilityItem {
  numberTag: string // e.g. "01 · TOPOLOGY"
  description: string
}

export interface CapabilityGridProps {
  items: CapabilityItem[]
}

export function CapabilityGrid({ items }: CapabilityGridProps) {
  return (
    <section className="w-full max-w-[1080px] mx-auto px-6 mt-12 md:mt-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.numberTag}
            className="bg-white border border-[#e2e8f0] rounded-xl p-[20px_22px] shadow-[0_4px_14px_rgba(15,23,42,0.05)] text-left flex flex-col"
          >
            <div className="font-mono font-extrabold text-[11px] tracking-[0.16em] text-[#1d4ed8] uppercase">
              {item.numberTag}
            </div>
            <p className="mt-2 text-[13.5px] text-[#334155] leading-[1.6]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
