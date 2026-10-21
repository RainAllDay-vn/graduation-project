/**
 * Modular Contextual Inspector Component
 * Displays glanceable metrics, accordions, sparklines, and CLI verification actions
 */

class InspectorPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  showEmptyState(customMsg) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900 leading-relaxed shadow-sm">
        <div class="flex items-center gap-1.5 font-bold mb-1 text-sky-950">
          <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Bắt đầu phiên điều tra
        </div>
        Hệ thống phát hiện 3 cảnh báo liên quan. AI đã tổng hợp và xếp hạng 3 giả thuyết nguyên nhân ở cột bên trái.
      </div>

      <div class="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-lg gap-3 bg-slate-50/50">
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="text-xs font-bold text-slate-700">Chưa chọn đối tượng điều tra</div>
        <p class="text-[11px] text-slate-500 max-w-[200px] leading-relaxed">
          ${customMsg || "Nhấp vào <b>Giả thuyết #1</b> ở cột bên trái hoặc bấm trực tiếp lên sơ đồ mạng để xem căn cứ kiểm chứng."}
        </p>
      </div>
    `;
  }

  showTheory(theory) {
    if (!this.container) return;
    this.container.innerHTML = `
      <!-- Target Summary Box -->
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-900">${theory.sourceNode} ↔ ${theory.targetNode}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
            ${theory.matchScore}% MATCH
          </span>
        </div>
        <div class="text-[11px] text-slate-500 mt-1">${theory.title}</div>
      </div>

      <!-- Accordion 1: Telemetry & Metrics -->
      <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div class="bg-slate-50 px-3 py-2 flex items-center justify-between cursor-pointer border-b border-slate-100 select-none hover:bg-slate-100/80 transition" onclick="window.inspector.toggleAccordion('acc-telemetry', this)">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Chỉ số tức thời</span>
          <span class="acc-chevron open text-xs text-slate-400">▶</span>
        </div>
        <div id="acc-telemetry" class="p-3 text-[11px] space-y-2">
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Cổng kết nối</span>
            <span class="font-mono font-semibold text-slate-800">${theory.sourcePort} ↔ ${theory.targetPort}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Tốc độ & Giao thức</span>
            <span class="font-mono font-semibold text-slate-800">${theory.telemetry.speed}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Tỷ lệ lỗi (Đỉnh)</span>
            <span class="font-mono font-bold text-rose-600">${theory.telemetry.peakErrorRate}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Mốc thời gian lỗi</span>
            <span class="font-mono font-semibold text-slate-800">${theory.telemetry.peakTime}</span>
          </div>

          <!-- Sparkline Chart -->
          <div class="pt-2">
            <div class="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
              <span>packet-error (${theory.targetPort})</span>
              <span class="text-rose-600 font-bold">Đỉnh ${theory.telemetry.peakErrorRate.split(' ')[0]}</span>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded p-1">
              <svg class="w-full h-11" viewBox="0 0 240 44">
                <polyline fill="none" stroke="#ef4444" stroke-width="2" points="0,40 50,40 100,40 125,5 145,18 175,38 240,40" />
                <circle cx="125" cy="5" r="2.5" fill="#b91c1c" />
                <text x="130" y="11" font-size="8" fill="#64748b" font-family="monospace">14:32</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion 2: Deep Optics Transceiver -->
      <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div class="bg-slate-50 px-3 py-2 flex items-center justify-between cursor-pointer border-b border-slate-100 select-none hover:bg-slate-100/80 transition" onclick="window.inspector.toggleAccordion('acc-optics', this)">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Công suất quang & SFP</span>
          <span class="acc-chevron text-xs text-slate-400">▶</span>
        </div>
        <div id="acc-optics" class="p-3 text-[11px] space-y-2 hidden">
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Rx Power (Thu)</span>
            <span class="font-mono font-bold text-rose-600">${theory.telemetry.rxPower}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Tx Power (Phát)</span>
            <span class="font-mono font-semibold text-slate-800">${theory.telemetry.txPower}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Nhiệt độ SFP</span>
            <span class="font-mono font-bold text-amber-600">${theory.telemetry.sfpTemp}</span>
          </div>
        </div>
      </div>

      <!-- Accordion 3: CLI Verification Action -->
      <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div class="bg-slate-50 px-3 py-2 flex items-center justify-between cursor-pointer border-b border-slate-100 select-none hover:bg-slate-100/80 transition" onclick="window.inspector.toggleAccordion('acc-cli', this)">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Lệnh kiểm tra đề xuất</span>
          <span class="acc-chevron open text-xs text-slate-400">▶</span>
        </div>
        <div id="acc-cli" class="p-3">
          <div class="bg-slate-900 rounded-md p-2.5 shadow-inner">
            <div class="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
              <span>CLI Chẩn đoán</span>
              <button onclick="window.inspector.copyCli('${theory.cliCommand}')" class="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer">
                Sao chép
              </button>
            </div>
            <code class="font-mono text-[10px] text-sky-300 break-all">${theory.cliCommand}</code>
          </div>
        </div>
      </div>

      <!-- Verification Buttons -->
      <div class="flex gap-2 mt-auto pt-2">
        <button onclick="window.app.confirmDiagnosis()" class="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-2 px-3 rounded-md transition shadow-sm">
          Xác nhận nguyên nhân
        </button>
        <button onclick="window.app.dismissDiagnosis()" class="px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 rounded-md transition shadow-sm">
          Bác bỏ
        </button>
      </div>
    `;
  }

  showNode(nodeId) {
    const node = TOPOLOGY_DATA.nodes.find(n => n.id === nodeId);
    if (!node || !this.container) return;

    this.container.innerHTML = `
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-900">${node.label}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${node.status === 'critical' ? 'bg-rose-100 text-rose-700 border border-rose-300' : node.status === 'warning' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'}">
            ${node.status.toUpperCase()}
          </span>
        </div>
        <div class="text-[11px] text-slate-500 mt-1">${node.type} · ${node.model}</div>
      </div>

      <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div class="bg-slate-50 px-3 py-2 border-b border-slate-100">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Tình trạng phần cứng</span>
        </div>
        <div class="p-3 text-[11px] space-y-2">
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Thời gian Uptime</span>
            <span class="font-mono font-semibold text-slate-800">${node.uptime || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Tải CPU / RAM</span>
            <span class="font-mono font-semibold text-slate-800">${node.cpuLoad || '15%'}</span>
          </div>
          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
            <span class="text-slate-500">Cảnh báo đang ghim</span>
            <span class="font-mono font-bold ${node.activeAlarm && node.activeAlarm !== 'Bình thường' ? 'text-rose-600' : 'text-emerald-600'}">
              ${node.activeAlarm || 'Không có'}
            </span>
          </div>
        </div>
      </div>

      <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div class="bg-slate-50 px-3 py-2 border-b border-slate-100">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Lệnh kiểm tra thiết bị</span>
        </div>
        <div class="p-3">
          <div class="bg-slate-900 rounded-md p-2.5 shadow-inner">
            <div class="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
              <span>CLI Lệnh</span>
              <button onclick="window.inspector.copyCli('${node.cli || 'show running-config'}')" class="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer">
                Sao chép
              </button>
            </div>
            <code class="font-mono text-[10px] text-sky-300 break-all">${node.cli || 'show running-config'}</code>
          </div>
        </div>
      </div>
    `;
  }

  toggleAccordion(bodyId, headerEl) {
    const body = document.getElementById(bodyId);
    const chevron = headerEl.querySelector('.acc-chevron');
    if (!body) return;
    if (body.classList.contains('hidden')) {
      body.classList.remove('hidden');
      if (chevron) chevron.classList.add('open');
    } else {
      body.classList.add('hidden');
      if (chevron) chevron.classList.remove('open');
    }
  }

  copyCli(text) {
    navigator.clipboard.writeText(text).then(() => {
      window.app.showToast("✓ Đã sao chép lệnh kiểm tra CLI!");
    }).catch(() => {
      window.app.showToast("Đã sao chép: " + text);
    });
  }
}
