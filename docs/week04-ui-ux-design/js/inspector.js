/**
 * Modular Contextual Inspector Component - Enterprise NOC Dark Palette
 * Displays glanceable metrics, accordions, cyber sparklines, and CLI verification actions
 */

class InspectorPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  showEmptyState(customMsg) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="bg-sky-950/40 border border-sky-800/60 rounded-xl p-3.5 text-xs text-sky-200 leading-relaxed shadow-lg">
        <div class="flex items-center gap-2 font-bold mb-1.5 text-sky-300">
          <svg class="w-4 h-4 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Trung tâm Phân tích Đo lường (Telemetry Radar)
        </div>
        Hệ thống phát hiện 3 cảnh báo liên đới. AI đã tự động phân tích và xếp hạng 3 giả thuyết nguyên nhân ở Navigator bên trái.
      </div>

      <div class="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl gap-3 bg-slate-950/40">
        <div class="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-sky-400 shadow-inner">
          <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="text-xs font-bold text-slate-200">Chưa chọn đối tượng điều tra</div>
        <p class="text-[11px] text-slate-400 max-w-[210px] leading-relaxed">
          ${customMsg || "Nhấp vào <b>Giả thuyết #1</b> ở cột bên trái hoặc bấm trực tiếp lên liên kết/thiết bị trên sơ đồ mạng."}
        </p>
      </div>
    `;
  }

  showTheory(theory) {
    if (!this.container) return;
    this.container.innerHTML = `
      <!-- Target Summary Box -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-lg backdrop-blur-md">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            ${theory.sourceNode} ↔ ${theory.targetNode}
          </span>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-950/90 text-rose-400 border border-rose-800 shadow-sm">
            ${theory.matchScore}% MATCH
          </span>
        </div>
        <div class="text-[11px] text-slate-300 font-medium mt-1.5 leading-snug">${theory.title}</div>
      </div>

      <!-- Accordion 1: Telemetry & Metrics -->
      <div class="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 shadow-md">
        <div class="bg-slate-850 px-3.5 py-2.5 flex items-center justify-between cursor-pointer border-b border-slate-800 select-none hover:bg-slate-800 transition" onclick="window.inspector.toggleAccordion('acc-telemetry', this)">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">Chỉ số tức thời</span>
          </div>
          <span class="acc-chevron open text-xs text-slate-400">▶</span>
        </div>
        <div id="acc-telemetry" class="p-3.5 text-[11px] space-y-2.5">
          <div class="flex justify-between border-b border-dashed border-slate-800 pb-2">
            <span class="text-slate-400">Cổng kết nối</span>
            <span class="font-mono font-semibold text-slate-200">${theory.sourcePort} ↔ ${theory.targetPort}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-800 pb-2">
            <span class="text-slate-400">Tốc độ & Giao thức</span>
            <span class="font-mono font-semibold text-sky-400">${theory.telemetry.speed}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-800 pb-2">
            <span class="text-slate-400">Tỷ lệ lỗi (Đỉnh)</span>
            <span class="font-mono font-bold text-rose-400">${theory.telemetry.peakErrorRate}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-800 pb-2">
            <span class="text-slate-400">Mốc thời gian lỗi</span>
            <span class="font-mono font-semibold text-slate-300">${theory.telemetry.peakTime}</span>
          </div>

          <!-- Elevated Dark Mode Sparkline Chart with Gradient Area & Threshold Alert Line -->
          <div class="pt-2">
            <div class="flex justify-between text-[10.5px] font-semibold text-slate-300 mb-1.5">
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                packet-error (${theory.targetPort})
              </span>
              <span class="font-mono text-rose-400 font-bold">Peak ${theory.telemetry.peakErrorRate.split(' ')[0]}</span>
            </div>
            <div class="bg-slate-950/90 border border-slate-800 rounded-lg p-2 relative overflow-hidden">
              <svg class="w-full h-14" viewBox="0 0 240 50">
                <defs>
                  <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ef4444" stop-opacity="0.5"/>
                    <stop offset="100%" stop-color="#ef4444" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <!-- Grid guide lines -->
                <line x1="0" y1="12" x2="240" y2="12" stroke="#ef4444" stroke-dasharray="3,3" stroke-width="0.8" opacity="0.4" />
                <text x="238" y="10" font-size="7" fill="#f87171" font-family="monospace" text-anchor="end">NGƯỠNG CẢNH BÁO (10^-3)</text>
                
                <!-- Area gradient fill -->
                <polygon fill="url(#spark-grad)" points="0,45 50,45 100,45 125,8 145,22 175,42 240,45" />
                <!-- Polyline sparkline -->
                <polyline fill="none" stroke="#ef4444" stroke-width="2" points="0,45 50,45 100,45 125,8 145,22 175,42 240,45" />
                
                <!-- Critical Peak Marker -->
                <circle cx="125" cy="8" r="3.5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
                <text x="132" y="10" font-size="8.5" fill="#fca5a5" font-family="monospace" font-weight="bold">14:32 (ĐỈNH LỖI)</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion 2: Deep Optics Transceiver -->
      <div class="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 shadow-md">
        <div class="bg-slate-850 px-3.5 py-2.5 flex items-center justify-between cursor-pointer border-b border-slate-800 select-none hover:bg-slate-800 transition" onclick="window.inspector.toggleAccordion('acc-optics', this)">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">Công suất quang & SFP</span>
          </div>
          <span class="acc-chevron text-xs text-slate-400">▶</span>
        </div>
        <div id="acc-optics" class="p-3.5 text-[11px] space-y-2 hidden">
          <div class="flex justify-between border-b border-dashed border-slate-800 pb-1.5">
            <span class="text-slate-400">Loại Module quang</span>
            <span class="font-mono text-slate-200">10G-LR SFP+ (1310nm)</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-800 pb-1.5">
            <span class="text-slate-400">Công suất phát (Tx Power)</span>
            <span class="font-mono text-emerald-400 font-bold">-2.1 dBm (Bình thường)</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-800 pb-1.5">
            <span class="text-slate-400">Công suất thu (Rx Power)</span>
            <span class="font-mono text-rose-400 font-bold">-18.4 dBm (Suy hao vượt ngưỡng)</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-800 pb-1.5">
            <span class="text-slate-400">Ngưỡng chuẩn thiết kế</span>
            <span class="font-mono text-slate-400">-14.0 dBm đến -1.0 dBm</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Độ lệch suy hao (Margin)</span>
            <span class="font-mono text-rose-400 font-bold">-4.4 dB Margin</span>
          </div>
        </div>
      </div>

      <!-- Action Verification Card: 1-Click CLI Execution -->
      <div class="border border-slate-800 rounded-xl p-3.5 bg-slate-900/90 shadow-md">
        <div class="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Hành động xác thực tại thiết bị
          </span>
          <span class="text-[10px] text-cyan-400 font-mono">SSH CLI</span>
        </div>
        
        <!-- Terminal Command Box -->
        <div class="bg-black/80 rounded-lg p-2.5 font-mono text-[10.5px] border border-slate-800 mb-3 text-cyan-300 flex items-center justify-between">
          <span class="truncate mr-2 select-all">${theory.verificationCmd || theory.cliCommand}</span>
          <button onclick="window.app.copyCliCommand('${theory.verificationCmd || theory.cliCommand}')" class="shrink-0 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-sans font-bold transition flex items-center gap-1 border border-slate-700 cursor-pointer" title="Sao chép lệnh vào Clipboard">
            <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
            </svg>
            Copy
          </button>
        </div>

        <div class="flex gap-2">
          <button onclick="window.app.confirmTheory(${theory.id})" class="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer">
            Xác nhận nguyên nhân
          </button>
          <button onclick="window.app.dismissTheory(${theory.id})" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition border border-slate-700 cursor-pointer">
            Bác bỏ
          </button>
        </div>
      </div>
    `;
  }

  showNode(node) {
    if (!this.container) return;
    if (typeof node === 'string') {
      node = (typeof TOPOLOGY_DATA !== 'undefined' && TOPOLOGY_DATA.nodes ? TOPOLOGY_DATA.nodes.find(n => n.id === node) : null) || {
        id: node,
        type: 'Network Device',
        ip: '10.244.1.2',
        model: 'Hardware Core Unit',
        status: 'normal',
        cpuLoad: '22%',
        temp: '40°C',
        activeAlarm: 'Bình thường'
      };
    }
    this.container.innerHTML = `
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-lg backdrop-blur-md">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-100 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${node.status === 'critical' ? 'bg-rose-500 animate-ping' : node.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
            ${node.id}
          </span>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold ${node.status === 'critical' ? 'bg-rose-950/90 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
            ${node.type.toUpperCase()}
          </span>
        </div>
        <div class="text-[11px] text-slate-400 mt-1 font-mono">${node.ip} · ${node.model}</div>
      </div>

      <!-- Node Telemetry Metrics -->
      <div class="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 shadow-md p-3.5 space-y-2.5 text-[11px]">
        <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          Trạng thái phần cứng & Tải CPU
        </div>
        <div class="flex justify-between border-b border-dashed border-slate-800 pb-2">
          <span class="text-slate-400">Tải CPU hiện tại</span>
          <span class="font-mono font-bold text-slate-200">${node.cpuLoad || '18%'}</span>
        </div>
        <div class="flex justify-between border-b border-dashed border-slate-800 pb-2">
          <span class="text-slate-400">Nhiệt độ Chassis</span>
          <span class="font-mono font-bold ${node.status === 'warning' ? 'text-amber-400' : 'text-slate-200'}">${node.temp || '42°C (Bình thường)'}</span>
        </div>
        <div class="flex justify-between border-b border-dashed border-slate-800 pb-2">
          <span class="text-slate-400">Cảnh báo đang mở</span>
          <span class="font-mono font-bold ${node.activeAlarm ? 'text-rose-400' : 'text-emerald-400'}">${node.activeAlarm || 'Không có cảnh báo'}</span>
        </div>
      </div>

      <!-- Quick Action: Terminal Inspect -->
      <div class="border border-slate-800 rounded-xl p-3.5 bg-slate-900/90 shadow-md">
        <div class="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">Truy cập console điều hành</div>
        <div class="bg-black/80 rounded-lg p-2.5 font-mono text-[10.5px] border border-slate-800 mb-3 text-cyan-300 flex items-center justify-between">
          <span>ssh noc-admin@${node.ip}</span>
          <button onclick="window.app.copyCliCommand('ssh noc-admin@${node.ip}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-sans font-bold border border-slate-700 cursor-pointer">
            Copy
          </button>
        </div>
        <button onclick="window.app.resetInspect()" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition border border-slate-700 cursor-pointer">
          Quay lại tổng quan
        </button>
      </div>
    `;
  }

  toggleAccordion(id, headerEl) {
    const content = document.getElementById(id);
    if (!content) return;
    const chevron = headerEl.querySelector('.acc-chevron');
    
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      if (chevron) chevron.classList.add('open');
    } else {
      content.classList.add('hidden');
      if (chevron) chevron.classList.remove('open');
    }
  }
}
