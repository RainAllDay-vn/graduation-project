export interface TopologySidePanelProps {
  locale?: 'vi' | 'en'
  onLocaleChange?: (locale: 'vi' | 'en') => void
}

export function TopologySidePanel({
  locale = 'vi',
  onLocaleChange,
}: TopologySidePanelProps) {
  return (
    <div className="hidden lg:flex flex-col w-[34%] bg-[#0f172a] border-l border-[#e2e8f0]/10 relative overflow-hidden select-none">
      {/* Embedded SVG keyframe animations for network topology */}
      <style>{`
        @keyframes vp-flow { to { stroke-dashoffset: -28; } }
        @keyframes vp-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.3); }
        }
        @keyframes vp-ping {
          0% { opacity: 0.8; transform: scale(0.4); }
          75%, 100% { opacity: 0; transform: scale(2.6); }
        }
        .anim-line {
          fill: none;
          stroke: #93c5fd;
          stroke-width: 1.5;
          stroke-dasharray: 5 9;
          opacity: 0.28;
          animation: vp-flow 3.2s linear infinite;
        }
        .anim-node {
          transform-box: fill-box;
          transform-origin: center;
          animation: vp-pulse 4.8s ease-in-out infinite;
        }
        .anim-ping {
          fill: none;
          stroke: #10b981;
          stroke-width: 1.5;
          transform-box: fill-box;
          transform-origin: center;
          animation: vp-ping 4.5s ease-out infinite;
        }
      `}</style>

      {/* Language Switcher Badge (Top Right) */}
      <div className="absolute top-6 right-6 inline-flex gap-0.5 p-[3px] border border-white/20 rounded-full z-10 bg-slate-900/60 backdrop-blur">
        <button
          type="button"
          onClick={() => onLocaleChange?.('vi')}
          className={`font-mono font-bold text-[10px] tracking-[0.08em] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
            locale === 'vi'
              ? 'bg-white/20 text-white font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          VI
        </button>
        <button
          type="button"
          onClick={() => onLocaleChange?.('en')}
          className={`font-mono font-bold text-[10px] tracking-[0.08em] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
            locale === 'en'
              ? 'bg-white/20 text-white font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>

      {/* SVG Network Topology Pulse Animation */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 620"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        {/* Animated Links */}
        <line className="anim-line" x1="60" y1="120" x2="200" y2="210" />
        <line className="anim-line" x1="330" y1="110" x2="200" y2="210" style={{ animationDelay: '-1.1s' }} />
        <line className="anim-line" x1="200" y1="210" x2="310" y2="330" style={{ animationDelay: '-2.2s' }} />
        <line className="anim-line" x1="310" y1="330" x2="120" y2="380" style={{ animationDelay: '-0.6s' }} />
        <line className="anim-line" x1="120" y1="380" x2="60" y2="120" style={{ animationDelay: '-1.7s' }} />
        <line className="anim-line" x1="200" y1="210" x2="250" y2="480" style={{ animationDelay: '-2.8s' }} />
        <line className="anim-line" x1="250" y1="480" x2="90" y2="540" style={{ animationDelay: '-1.4s' }} />
        <line className="anim-line" x1="310" y1="330" x2="250" y2="480" style={{ animationDelay: '-2.4s' }} />

        {/* Animated Nodes */}
        <circle className="anim-node" fill="#10b981" cx="60" cy="120" r="5" style={{ animationDelay: '-0.4s' }} />
        <circle className="anim-node" fill="#38bdf8" cx="200" cy="210" r="7" style={{ animationDelay: '-2.1s' }} />
        <circle className="anim-node" fill="#f59e0b" cx="330" cy="110" r="5" style={{ animationDelay: '-3.3s' }} />
        <circle className="anim-node" fill="#10b981" cx="310" cy="330" r="5" style={{ animationDelay: '-1.5s' }} />
        <circle className="anim-node" fill="#38bdf8" cx="120" cy="380" r="5" style={{ animationDelay: '-2.7s' }} />
        <circle className="anim-node" fill="#10b981" cx="250" cy="480" r="5" style={{ animationDelay: '-0.9s' }} />
        <circle className="anim-node" fill="#f59e0b" cx="90" cy="540" r="5" style={{ animationDelay: '-3.8s' }} />

        {/* Radar Center Ping */}
        <circle className="anim-ping" cx="200" cy="210" r="12" />
      </svg>
    </div>
  )
}
