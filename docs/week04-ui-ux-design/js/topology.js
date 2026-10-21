/**
 * Modular Topology Component with Full Graph Navigation:
 * - Pan & Zoom (Mouse drag & scroll wheel)
 * - Node Dragging & Repositioning
 * - Hover Tooltip for Nodes & Edges
 * - Scope & Layer Filtering
 */

class TopologyRenderer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.currentLayer = 'l2';
    this.currentScope = 'sub';
    this.selectedNodeId = null;
    this.selectedEdgeId = null;

    // ViewBox state for pan & zoom
    this.baseWidth = 760;
    this.baseHeight = 690;
    this.viewBox = { x: 0, y: 0, w: 760, h: 690 };
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };

    // Node dragging state
    this.draggedNode = null;
    this.dragStart = { x: 0, y: 0 };
    this.nodePositions = {};

    this.onNodeClick = options.onNodeClick || (() => {});
    this.onEdgeClick = options.onEdgeClick || (() => {});

    this.init();
  }

  init() {
    this.svg = document.getElementById('topo-svg');
    this.tooltip = document.getElementById('topo-tooltip');
    if (!this.tooltip) {
      this.createTooltip();
    }

    // Initialize node positions cache from data
    TOPOLOGY_DATA.nodes.forEach(n => {
      this.nodePositions[n.id] = { x: n.x, y: n.y };
    });

    this.bindEvents();
    this.bindNavigation();
    this.bindTooltips();
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'topo-tooltip';
    document.body.appendChild(this.tooltip);
  }

  bindNavigation() {
    if (!this.svg) return;

    // Mouse Wheel Zoom
    this.svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
      this.zoomAtPoint(e.clientX, e.clientY, zoomFactor);
    }, { passive: false });

    // Pan Canvas
    this.svg.addEventListener('mousedown', (e) => {
      // Don't pan if clicking directly on a node
      if (e.target.closest('.topo-node')) return;
      this.isPanning = true;
      this.panStart = { x: e.clientX, y: e.clientY };
      this.svg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        const dx = (e.clientX - this.panStart.x) * (this.viewBox.w / this.svg.clientWidth);
        const dy = (e.clientY - this.panStart.y) * (this.viewBox.h / this.svg.clientHeight);
        this.viewBox.x -= dx;
        this.viewBox.y -= dy;
        this.panStart = { x: e.clientX, y: e.clientY };
        this.updateViewBox();
      } else if (this.draggedNode) {
        this.handleNodeDrag(e);
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        if (this.svg) this.svg.style.cursor = 'grab';
      }
      if (this.draggedNode) {
        this.draggedNode = null;
      }
    });
  }

  zoomAtPoint(clientX, clientY, factor) {
    const rect = this.svg.getBoundingClientRect();
    const svgX = this.viewBox.x + (clientX - rect.left) * (this.viewBox.w / rect.width);
    const svgY = this.viewBox.y + (clientY - rect.top) * (this.viewBox.h / rect.height);

    const newW = Math.max(300, Math.min(1800, this.viewBox.w * factor));
    const newH = Math.max(270, Math.min(1600, this.viewBox.h * factor));

    this.viewBox.x = svgX - (svgX - this.viewBox.x) * (newW / this.viewBox.w);
    this.viewBox.y = svgY - (svgY - this.viewBox.y) * (newH / this.viewBox.h);
    this.viewBox.w = newW;
    this.viewBox.h = newH;

    this.updateViewBox();
  }

  updateViewBox() {
    if (this.svg) {
      this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.w} ${this.viewBox.h}`);
    }
  }

  bindEvents() {
    // Edge clicks
    const edgeFault = document.getElementById('edge-fault');
    const edgeImpact = document.getElementById('edge-impact');
    const faultBadge = document.getElementById('fault-badge');
    const impactBadge = document.getElementById('impact-badge');

    if (edgeFault) edgeFault.addEventListener('click', () => this.onEdgeClick('edge-fault'));
    if (faultBadge) faultBadge.addEventListener('click', () => this.onEdgeClick('edge-fault'));
    if (edgeImpact) edgeImpact.addEventListener('click', () => this.onEdgeClick('edge-impact'));
    if (impactBadge) impactBadge.addEventListener('click', () => this.onEdgeClick('edge-impact'));

    // Node clicks & Drag setup
    TOPOLOGY_DATA.nodes.forEach(node => {
      const cleanId = node.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nodeEl = document.getElementById(`node-${cleanId}`);
      if (nodeEl) {
        nodeEl.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          this.draggedNode = node.id;
          const rect = this.svg.getBoundingClientRect();
          this.dragStart = {
            clientX: e.clientX,
            clientY: e.clientY,
            nodeX: this.nodePositions[node.id].x,
            nodeY: this.nodePositions[node.id].y
          };
        });

        nodeEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectNode(node.id);
        });
      }
    });
  }

  handleNodeDrag(e) {
    if (!this.draggedNode) return;
    const rect = this.svg.getBoundingClientRect();
    const dx = (e.clientX - this.dragStart.clientX) * (this.viewBox.w / rect.width);
    const dy = (e.clientY - this.dragStart.clientY) * (this.viewBox.h / rect.height);

    const newX = Math.round(this.dragStart.nodeX + dx);
    const newY = Math.round(this.dragStart.nodeY + dy);

    this.nodePositions[this.draggedNode] = { x: newX, y: newY };

    // Move SVG group
    const cleanId = this.draggedNode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nodeEl = document.getElementById(`node-${cleanId}`);
    if (nodeEl) {
      nodeEl.setAttribute('transform', `translate(${newX}, ${newY})`);
    }

    // Update connected edges
    this.updateConnectedEdges(this.draggedNode, newX, newY);
  }

  updateConnectedEdges(nodeId, x, y) {
    if (nodeId === 'SW-HN-02') {
      document.getElementById('edge-fault')?.setAttribute('x1', x);
      document.getElementById('edge-fault')?.setAttribute('y1', y);
      document.getElementById('edge-hosta')?.setAttribute('x1', x);
      document.getElementById('edge-hosta')?.setAttribute('y1', y);
      document.getElementById('edge-hostb')?.setAttribute('x1', x);
      document.getElementById('edge-hostb')?.setAttribute('y1', y);
    } else if (nodeId === 'R-HN-01') {
      document.getElementById('edge-fault')?.setAttribute('x2', x);
      document.getElementById('edge-fault')?.setAttribute('y2', y);
      document.getElementById('edge-impact')?.setAttribute('x1', x);
      document.getElementById('edge-impact')?.setAttribute('y1', y);
      document.getElementById('edge-dist03')?.setAttribute('x1', x);
      document.getElementById('edge-dist03')?.setAttribute('y1', y);
    } else if (nodeId === 'R-HN-07') {
      document.getElementById('edge-impact')?.setAttribute('x2', x);
      document.getElementById('edge-impact')?.setAttribute('y2', y);
    } else if (nodeId === 'Dist-03') {
      document.getElementById('edge-dist03')?.setAttribute('x2', x);
      document.getElementById('edge-dist03')?.setAttribute('y2', y);
    }
  }

  bindTooltips() {
    // Node hover tooltips
    TOPOLOGY_DATA.nodes.forEach(node => {
      const cleanId = node.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nodeEl = document.getElementById(`node-${cleanId}`);
      if (nodeEl) {
        nodeEl.addEventListener('mouseenter', (e) => {
          this.showTooltip(e, `
            <div class="font-bold text-white text-xs mb-1 flex items-center justify-between">
              <span>${node.id}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded font-semibold ${node.status === 'critical' ? 'bg-rose-500' : node.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'} text-white">
                ${node.status.toUpperCase()}
              </span>
            </div>
            <div class="text-slate-300 text-[10px] space-y-0.5">
              <div>Loại: <b class="text-white">${node.type}</b></div>
              <div>Model: <b class="text-white">${node.model}</b></div>
              <div>Tải CPU: <b class="text-white">${node.cpuLoad || '18%'}</b></div>
              <div>Cảnh báo: <b class="text-rose-300">${node.activeAlarm || 'Không'}</b></div>
            </div>
            <div class="mt-1 text-[9px] text-sky-400 italic">💡 Nhấp chuột để soi chi tiết · Kéo để dịch chuyển</div>
          `);
        });

        nodeEl.addEventListener('mousemove', (e) => this.moveTooltip(e));
        nodeEl.addEventListener('mouseleave', () => this.hideTooltip());
      }
    });

    // Edge hover tooltips
    const edgeFault = document.getElementById('edge-fault');
    if (edgeFault) {
      edgeFault.addEventListener('mouseenter', (e) => {
        this.showTooltip(e, `
          <div class="font-bold text-white text-xs mb-1 flex items-center justify-between">
            <span>UPLINK-03 ↔ WAN-01</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">LỖI CRC</span>
          </div>
          <div class="text-slate-300 text-[10px] space-y-0.5">
            <div>Đường truyền: <b class="text-white">10G Quang Single-mode</b></div>
            <div>Tỷ lệ lỗi bit: <b class="text-rose-400">1.250 lỗi/phút (Đỉnh)</b></div>
            <div>Công suất thu Rx: <b class="text-rose-400">-18.4 dBm (Suy hao)</b></div>
          </div>
          <div class="mt-1 text-[9px] text-sky-400 italic">💡 Nhấp chuột để mở Giả thuyết #1</div>
        `);
      });
      edgeFault.addEventListener('mousemove', (e) => this.moveTooltip(e));
      edgeFault.addEventListener('mouseleave', () => this.hideTooltip());
    }

    const edgeImpact = document.getElementById('edge-impact');
    if (edgeImpact) {
      edgeImpact.addEventListener('mouseenter', (e) => {
        this.showTooltip(e, `
          <div class="font-bold text-white text-xs mb-1 flex items-center justify-between">
            <span>WAN-02 ↔ EGRESS-01</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-white font-bold">RỚT GÓI 1.8%</span>
          </div>
          <div class="text-slate-300 text-[10px] space-y-0.5">
            <div>Đường truyền: <b class="text-white">Tuyến rẽ tiếp thay thế L3</b></div>
            <div>Băng thông tải: <b class="text-amber-300">9.4 Gbps / 10 Gbps (94%)</b></div>
          </div>
          <div class="mt-1 text-[9px] text-sky-400 italic">💡 Nhấp chuột để mở Giả thuyết #2</div>
        `);
      });
      edgeImpact.addEventListener('mousemove', (e) => this.moveTooltip(e));
      edgeImpact.addEventListener('mouseleave', () => this.hideTooltip());
    }
  }

  showTooltip(e, html) {
    if (!this.tooltip) return;
    this.tooltip.innerHTML = html;
    this.tooltip.style.display = 'block';
    this.moveTooltip(e);
  }

  moveTooltip(e) {
    if (!this.tooltip) return;
    const offset = 14;
    this.tooltip.style.left = `${e.clientX + offset}px`;
    this.tooltip.style.top = `${e.clientY + offset}px`;
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.selectedEdgeId = null;
    this.clearSelections();

    const cleanId = nodeId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const circle = document.getElementById(`circle-${cleanId}`);
    if (circle) circle.classList.add('node-active-ring');

    this.onNodeClick(nodeId);
  }

  highlightTheory(theoryId) {
    this.clearSelections();
    const theory = THEORIES_DATA.find(t => t.id === theoryId);
    if (!theory) return;

    const edgeFault = document.getElementById('edge-fault');
    const edgeImpact = document.getElementById('edge-impact');
    const faultBadge = document.getElementById('fault-badge');
    const impactBadge = document.getElementById('impact-badge');

    if (theoryId === 1) {
      if (edgeFault) {
        edgeFault.setAttribute('stroke', '#ef4444');
        edgeFault.setAttribute('stroke-width', '4');
        edgeFault.classList.add('pulsing-fault-line');
      }
      if (edgeImpact) {
        edgeImpact.setAttribute('stroke', '#f59e0b');
        edgeImpact.setAttribute('stroke-width', '2.5');
        edgeImpact.style.opacity = '1';
      }
      if (faultBadge) faultBadge.style.display = 'block';
      if (impactBadge) impactBadge.style.display = 'block';
    } else if (theoryId === 2) {
      if (edgeFault) {
        edgeFault.classList.remove('pulsing-fault-line');
        edgeFault.setAttribute('stroke', '#cbd5e1');
        edgeFault.setAttribute('stroke-width', '2');
      }
      if (edgeImpact) {
        edgeImpact.setAttribute('stroke', '#ef4444');
        edgeImpact.setAttribute('stroke-width', '4');
        edgeImpact.style.opacity = '1';
      }
      if (faultBadge) faultBadge.style.display = 'none';
      if (impactBadge) impactBadge.style.display = 'block';
    } else if (theoryId === 3) {
      if (edgeFault) {
        edgeFault.classList.remove('pulsing-fault-line');
        edgeFault.setAttribute('stroke', '#cbd5e1');
        edgeFault.setAttribute('stroke-width', '2');
      }
      if (edgeImpact) {
        edgeImpact.style.opacity = '0.3';
      }
      if (faultBadge) faultBadge.style.display = 'none';
      if (impactBadge) impactBadge.style.display = 'none';
      this.selectNode('SW-HN-02');
    }
  }

  setLayer(layer) {
    this.currentLayer = layer;
    const servicePath = document.getElementById('service-path');
    const l2Labels = document.getElementById('l2-labels');
    const l3Labels = document.getElementById('l3-labels');

    if (layer === 'l3') {
      if (servicePath) servicePath.style.display = 'block';
      if (l2Labels) l2Labels.style.display = 'none';
      if (l3Labels) l3Labels.style.display = 'block';
    } else {
      if (servicePath) servicePath.style.display = 'none';
      if (l2Labels) l2Labels.style.display = 'block';
      if (l3Labels) l3Labels.style.display = 'none';
    }
  }

  setScope(scope) {
    this.currentScope = scope;
    const dist03 = document.getElementById('node-dist03');
    const edgeDist = document.getElementById('edge-dist03');
    const hostA = document.getElementById('node-srva');
    const hostB = document.getElementById('node-srvb');

    let opacity = '0.2';
    if (scope === '1hop') opacity = '0.55';
    if (scope === 'ring') opacity = '1.0';

    [dist03, edgeDist, hostA, hostB].forEach(el => {
      if (el) el.style.opacity = opacity;
    });
  }

  clearSelections() {
    document.querySelectorAll('.node-active-ring').forEach(el => {
      el.classList.remove('node-active-ring');
    });
  }

  zoom(factor) {
    const center = {
      x: this.viewBox.x + this.viewBox.w / 2,
      y: this.viewBox.y + this.viewBox.h / 2
    };
    const newW = Math.max(300, Math.min(1800, this.viewBox.w * factor));
    const newH = Math.max(270, Math.min(1600, this.viewBox.h * factor));

    this.viewBox.x = center.x - newW / 2;
    this.viewBox.y = center.y - newH / 2;
    this.viewBox.w = newW;
    this.viewBox.h = newH;

    this.updateViewBox();
  }

  resetView() {
    this.viewBox = { x: 0, y: 0, w: this.baseWidth, h: this.baseHeight };
    this.updateViewBox();
  }
}
