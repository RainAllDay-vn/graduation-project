/**
 * Main Application Controller
 * Coordinates Data, Topology, and Inspector components with Tailwind UI.
 * Handles all micro-interactions:
 * - Sidebar collapse/expand
 * - Keyboard shortcuts (ESC, F, 1/2/3)
 * - Toast notifications
 * - Timeline play/pause
 * - In-page Stage Switching for the full user journey
 */

class IncidentApp {
  constructor() {
    this.topology = null;
    this.inspector = null;
    this.activeTheoryId = null;
    this.activeScope = 'sub';
    this.activeLayer = 'l2';
    this.currentStage = 1;

    // Timeline player state
    this.isPlaying = false;
    this.playInterval = null;

    // Sidebar state
    this.isLeftCollapsed = false;
    this.isRightCollapsed = false;
  }

  init(options = {}) {
    this.currentStage = options.stage || 1;

    // Initialize Inspector
    this.inspector = new InspectorPanel('inspector-container');
    window.inspector = this.inspector;

    // Initialize Topology
    this.topology = new TopologyRenderer('topo-viewport', {
      onNodeClick: (nodeId) => this.handleNodeSelect(nodeId),
      onEdgeClick: (edgeId) => this.handleEdgeSelect(edgeId)
    });
    window.topology = this.topology;

    // Bind Global Keyboard Shortcuts
    this.bindKeyboardShortcuts();

    // Initial Stage Rendering
    this.setJourneyStage(this.currentStage);
  }

  // --- STAGE SWITCHING WITHIN PAGE 1 ---
  setJourneyStage(stageNum) {
    this.currentStage = stageNum;

    // Update Stage Breadcrumb UI
    for (let i = 1; i <= 5; i++) {
      const stepEl = document.getElementById(`journey-step-${i}`);
      if (stepEl) {
        if (i === stageNum) {
          stepEl.className = "px-2.5 py-1 rounded-md bg-sky-600 text-white font-bold shadow-sm flex items-center gap-1.5 transition";
          stepEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>${i}. ${this.getStageName(i)}`;
        } else {
          stepEl.className = "px-2 py-1 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer";
          stepEl.innerHTML = `${i}. ${this.getStageName(i)}`;
        }
      }
    }

    // Update Tip message
    const tipEl = document.getElementById('journey-tip-text');
    if (tipEl) {
      tipEl.innerHTML = this.getStageTip(stageNum);
    }

    // Apply Stage Behaviors
    if (stageNum === 1) { // Landing Overview
      this.inspector.showEmptyState();
      this.topology.resetView();
      this.setLayer('l2');
      this.updateBanner("Chế độ: <b>Tổng quan khu vực sự cố (Chưa chọn đối tượng khoanh vùng)</b>");
      this.setTimelineProgress('10%');
    } else if (stageNum === 2) { // Theory 1 Focus
      this.selectTheory(1);
      this.setTimelineProgress('62%');
    } else if (stageNum === 3) { // Node SW-HN-02 Inspect
      this.handleNodeSelect('SW-HN-02');
      this.setTimelineProgress('10%');
    } else if (stageNum === 4) { // L3 Service Impact
      this.selectTheory(2);
      this.setLayer('l3');
      this.setTimelineProgress('72%');
    } else if (stageNum === 5) { // Resolved
      this.showResolvedState();
      this.setTimelineProgress('100%');
    }
  }

  getStageName(num) {
    switch (num) {
      case 1: return "Tiếp nhận sự cố (Landing)";
      case 2: return "Giả thuyết #1 Focus";
      case 3: return "Soi thiết bị & Cổng";
      case 4: return "Đánh giá L3 Impact";
      case 5: return "Khắc phục (Resolved)";
    }
  }

  getStageTip(num) {
    switch (num) {
      case 1: return "💡 Bước tiếp theo: Bấm vào <b>Giả thuyết #1</b> ở cột trái để bắt đầu khoanh vùng lỗi";
      case 2: return "💡 Bước tiếp theo: Bấm vào <b>Node SW-HN-02</b> trên sơ đồ để soi cổng quang và module SFP";
      case 3: return "💡 Bước tiếp theo: Bấm vào <b>L3 Luồng dịch vụ</b> trên thanh công cụ để xem đường rẽ tiếp";
      case 4: return "💡 Bước tiếp theo: Bấm nút <b>Xác nhận nguyên nhân</b> ở cột bên phải để đóng quy trình điều tra";
      case 5: return "✓ Hoàn thành phiên điều tra: Đã lưu biên bản sự cố và lập phiếu thay thế module SFP";
    }
  }

  // --- SELECTION & INTERACTION ---
  selectTheory(theoryId) {
    this.activeTheoryId = theoryId;

    document.querySelectorAll('.theory-card').forEach(card => {
      card.className = "theory-card p-3 rounded-xl border border-slate-800 bg-slate-850 hover:border-slate-700 hover:bg-slate-800 transition cursor-pointer shadow-sm";
    });

    const activeCard = document.getElementById(`theory-card-${theoryId}`);
    if (activeCard) {
      activeCard.className = "theory-card block p-3.5 rounded-xl border border-sky-500/80 bg-gradient-to-br from-sky-950/60 to-slate-900/90 hover:from-sky-900/60 hover:to-slate-850 transition shadow-lg shadow-sky-950/40 cursor-pointer active";
    }

    const theory = THEORIES_DATA.find(t => t.id === theoryId);
    if (!theory) return;

    this.updateBanner(`Tiêu điểm: <b>Giả thuyết ${theory.rank} — ${theory.shortTitle}</b>`);
    this.topology.highlightTheory(theoryId);
    this.inspector.showTheory(theory);

    // If Left Sidebar was collapsed, open Right Sidebar to inspect
    if (this.isRightCollapsed) {
      this.toggleRightSidebar();
    }
  }

  handleNodeSelect(nodeId) {
    this.updateBanner(`Đang kiểm tra thiết bị: <b>${nodeId}</b>`);
    this.topology.selectNode(nodeId);
    const nodeObj = typeof TOPOLOGY_DATA !== 'undefined' ? TOPOLOGY_DATA.nodes.find(n => n.id === nodeId) : null;
    this.inspector.showNode(nodeObj || nodeId);

    if (this.isRightCollapsed) {
      this.toggleRightSidebar();
    }
  }

  handleEdgeSelect(edgeId) {
    if (edgeId === 'edge-fault') {
      this.selectTheory(1);
    } else if (edgeId === 'edge-impact') {
      this.selectTheory(2);
    }
  }

  updateBanner(html) {
    const bannerText = document.getElementById('canvas-banner-text');
    if (bannerText) bannerText.innerHTML = html;
  }

  // --- SIDEBAR COLLAPSE TOGGLES ---
  toggleLeftSidebar() {
    this.isLeftCollapsed = !this.isLeftCollapsed;
    const sidebar = document.getElementById('sidebar-left');
    const btn = document.getElementById('toggle-left-btn');

    if (sidebar) {
      sidebar.classList.toggle('collapsed', this.isLeftCollapsed);
    }
    if (btn) {
      btn.innerHTML = this.isLeftCollapsed ? '▶' : '◀';
      btn.title = this.isLeftCollapsed ? 'Mở rộng Sidebar Trái' : 'Thu gọn Sidebar Trái';
    }
    this.showToast(this.isLeftCollapsed ? "Đã thu gọn Sidebar Trái (Mở rộng Topology)" : "Đã mở Sidebar Trái");
  }

  toggleRightSidebar() {
    this.isRightCollapsed = !this.isRightCollapsed;
    const sidebar = document.getElementById('sidebar-right');
    const btn = document.getElementById('toggle-right-btn');

    if (sidebar) {
      sidebar.classList.toggle('collapsed', this.isRightCollapsed);
    }
    if (btn) {
      btn.innerHTML = this.isRightCollapsed ? '◀' : '▶';
      btn.title = this.isRightCollapsed ? 'Mở rộng Inspector' : 'Thu gọn Inspector';
    }
    this.showToast(this.isRightCollapsed ? "Đã thu gọn Sidebar Phải (Mở rộng Topology)" : "Đã mở Sidebar Phải");
  }

  // --- TOAST NOTIFICATION ---
  showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>${message}</span>
    `;
    toast.classList.add('show');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // --- KEYBOARD SHORTCUTS ---
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        this.topology.resetView();
        this.showToast("Căn giữa sơ đồ (Fit to View)");
      } else if (e.key === 'Escape') {
        this.topology.clearSelections();
        this.inspector.showEmptyState();
        this.updateBanner("Chế độ: <b>Tổng quan khu vực sự cố</b>");
        this.showToast("Đã hủy chọn đối tượng");
      } else if (e.key === '1') {
        this.selectTheory(1);
      } else if (e.key === '2') {
        this.selectTheory(2);
      } else if (e.key === '3') {
        this.selectTheory(3);
      } else if (e.key === '[' || e.key === '{') {
        this.toggleLeftSidebar();
      } else if (e.key === ']' || e.key === '}') {
        this.toggleRightSidebar();
      }
    });
  }

  // --- LAYER & SCOPE SWITCHING ---
  setLayer(layer) {
    this.activeLayer = layer;
    const btnL2 = document.getElementById('btn-layer-l2');
    const btnL3 = document.getElementById('btn-layer-l3');

    if (btnL2) {
      btnL2.className = layer === 'l2'
        ? "px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-600 text-white shadow-sm transition cursor-pointer"
        : "px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white transition cursor-pointer";
    }

    if (btnL3) {
      btnL3.className = layer === 'l3'
        ? "px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-600 text-white shadow-sm transition cursor-pointer"
        : "px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white transition cursor-pointer";
    }

    this.topology.setLayer(layer);
    this.showToast(layer === 'l3' ? "Đã bật tầng L3 Luồng dịch vụ" : "Đã bật tầng L2 Cáp quang vật lý");
  }

  setScope(scope) {
    this.activeScope = scope;
    ['sub', '1hop', 'ring'].forEach(s => {
      const btn = document.getElementById(`btn-scope-${s}`);
      const isActive = s === scope;
      if (btn) {
        btn.className = isActive
          ? "px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-cyan-300 shadow-sm transition cursor-pointer"
          : "px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white transition cursor-pointer";
      }
    });

    this.topology.setScope(scope);
    const scopeNames = { sub: "Khu vực ảnh hưởng", "1hop": "Mở rộng +1 Hop", ring: "Toàn bộ Ring mạng" };
    this.showToast(`Phạm vi hiển thị: ${scopeNames[scope]}`);
  }

  // --- TIMELINE CONTROLS ---
  replayTimeline(stepIndex) {
    ['pin-1', 'pin-2', 'pin-3', 'pin-4'].forEach((id, idx) => {
      const pin = document.getElementById(id);
      if (pin) pin.classList.toggle('ring-4', idx + 1 === stepIndex);
    });

    const step = TIMELINE_STEPS.find(s => s.step === stepIndex);
    if (step) {
      this.setTimelineProgress(step.percent);
      this.showToast(`Mốc thời gian: ${step.time} — ${step.desc}`);
    }

    if (stepIndex === 1) {
      this.handleNodeSelect('SW-HN-02');
    } else if (stepIndex === 2) {
      this.selectTheory(1);
    } else if (stepIndex === 3) {
      this.selectTheory(2);
    } else {
      this.selectTheory(1);
    }
  }

  setTimelineProgress(widthPercent) {
    const progress = document.getElementById('timeline-progress');
    if (progress) progress.style.width = widthPercent;
  }

  togglePlayTimeline() {
    this.isPlaying = !this.isPlaying;
    const playBtn = document.getElementById('timeline-play-btn');
    if (playBtn) {
      playBtn.innerHTML = this.isPlaying ? '❚❚' : '▶';
      playBtn.title = this.isPlaying ? 'Tạm dừng' : 'Tự động phát tua diễn tiến';
    }

    if (this.isPlaying) {
      let currentStep = 1;
      this.replayTimeline(currentStep);
      this.playInterval = setInterval(() => {
        currentStep = currentStep >= 4 ? 1 : currentStep + 1;
        this.replayTimeline(currentStep);
      }, 2500);
      this.showToast("Bắt đầu tự động tua diễn biến sự cố");
    } else {
      clearInterval(this.playInterval);
      this.showToast("Đã dừng tự động tua");
    }
  }

  // --- CLI EXECUTION & ACTION HANDLERS ---
  copyCliCommand(cmd) {
    if (!cmd) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(() => {
        this.showToast(`✓ Đã sao chép: ${cmd}`);
      }).catch(() => {
        this.fallbackCopy(cmd);
      });
    } else {
      this.fallbackCopy(cmd);
    }
  }

  fallbackCopy(cmd) {
    const textarea = document.createElement('textarea');
    textarea.value = cmd;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.showToast(`✓ Đã sao chép: ${cmd}`);
    } catch (e) {
      this.showToast(`Lệnh: ${cmd}`);
    }
    document.body.removeChild(textarea);
  }

  confirmTheory(theoryId) {
    this.confirmDiagnosis();
  }

  dismissTheory(theoryId) {
    this.dismissDiagnosis();
  }

  resetInspect() {
    this.setJourneyStage(1);
    this.showToast("Đã quay lại chế độ tổng quan");
  }

  confirmDiagnosis() {
    this.setJourneyStage(5);
    this.showToast("✓ Đã xác nhận nguyên nhân gốc và lập phiếu khắc phục!");
  }

  dismissDiagnosis() {
    this.showToast("Đã bác bỏ giả thuyết. Tiếp tục kiểm tra các hướng tiếp theo.");
  }

  showResolvedState() {
    this.updateBanner("Trạng thái: <b>Đã cô lập đường truyền lỗi, lưu lượng định tuyến an toàn</b>");
    const edgeFault = document.getElementById('edge-fault');
    if (edgeFault) {
      edgeFault.classList.remove('pulsing-fault-line');
      edgeFault.setAttribute('stroke', '#94a3b8');
      edgeFault.setAttribute('stroke-width', '2');
      edgeFault.setAttribute('stroke-dasharray', '4 4');
    }
    const faultBadge = document.getElementById('fault-badge');
    if (faultBadge) {
      faultBadge.querySelector('text').textContent = 'ADMIN SHUTDOWN';
      faultBadge.querySelector('rect').setAttribute('stroke', '#94a3b8');
    }

    const container = document.getElementById('inspector-container');
    if (container) {
      container.innerHTML = `
        <div class="bg-emerald-950/40 border border-emerald-800 rounded-xl p-3.5 shadow-lg">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Biên bản khắc phục sự cố
            </span>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-900 text-emerald-300 border border-emerald-700 font-mono">HOÀN TẤT</span>
          </div>
          <div class="text-[11px] text-emerald-400/90 mt-1.5">Mã phiếu điều tra: <b class="font-mono text-emerald-300">#TKT-2026-0915-01</b></div>
        </div>

        <div class="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 shadow-md">
          <div class="bg-slate-850 px-3.5 py-2.5 border-b border-slate-800">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">Nhật ký hành động (Actions Taken)</span>
          </div>
          <div class="p-3.5 text-[11px] space-y-2.5">
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold">✓</span>
              <div><b class="text-slate-200">14:48:</b> Cô lập cổng <code>UPLINK-03</code> tại switch <code>SW-HN-02</code>.</div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold">✓</span>
              <div><b class="text-slate-200">14:50:</b> Chuyển tiếp sạch lưu lượng sang luồng phụ qua <code>WAN-02</code>.</div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold">✓</span>
              <div><b class="text-slate-200">14:52:</b> Đã lập ticket bảo trì tại chỗ thay module SFP và đo suy hao cáp quang.</div>
            </div>
          </div>
        </div>

        <div class="mt-auto pt-2">
          <button onclick="window.app.setJourneyStage(1)" class="w-full bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl transition border border-slate-700 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer">
            <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Tua lại từ đầu (Reset Journey)
          </button>
        </div>
      `;
    }
  }
}

// Global App Instance
window.app = new IncidentApp();
