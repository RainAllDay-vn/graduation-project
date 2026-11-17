import type { Meta, StoryObj } from '@storybook/react'
import { TopologyCanvas } from './TopologyCanvas'
import { sampleNodes, sampleLinks } from './mockTopologyData'

const meta: Meta<typeof TopologyCanvas> = {
  title: 'Topology/Canvas/TopologyCanvas',
  component: TopologyCanvas,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TopologyCanvas>

/**
 * Story 1: LayerHierarchyDark
 * Validates the complete 5-layer stacking architecture in Dark Mode:
 * Layer 1: TierBands (Guidelines, dashed enclosures, monospace bilingual titles)
 * Layer 2: TopologyEdge (Curved Bézier trunk links & port anchor dots)
 * Layer 3: TopologyBeacon (Concentric animated beacon rings beneath node cards)
 * Layer 4: TopologyNode (Node cards, status backgrounds, site borders, access leaf badges)
 * Floating HTML Overlays:
 * - Top-Right: ViewportControls (+, −, FIT)
 * - Bottom-Left: SiteLegend (SITE-1 to SITE-4 swatches with quick-focus chips)
 */
export const LayerHierarchyDark: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    focusNodeId: 'CORE-02',
    blastRadiusLinkIds: ['L-I2-C2', 'L-C2-A2', 'L-C2-A3'],
    selectedLinkId: 'L-P1-C2',
    showLegend: true,
    showControls: true,
    zoom: 1.0,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 2: LayerHierarchyLight
 * Validates the complete 5-layer visual hierarchy under Light Mode NOC tokens:
 * Ensures contrast on white/slate-50 background, dark borders, and legible typography.
 */
export const LayerHierarchyLight: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    focusNodeId: 'CORE-02',
    blastRadiusLinkIds: ['L-I2-C2', 'L-C2-A2', 'L-C2-A3'],
    selectedLinkId: 'L-P1-C2',
    showLegend: true,
    showControls: true,
    zoom: 1.0,
  },
  render: (args) => (
    <div className="w-full h-[680px] bg-slate-100 p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-300 rounded-xl overflow-hidden shadow-xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 3: SiteQuickFocus
 * Demonstrates Stylebook §4.4 quick-focus interaction:
 * When SITE-2 is selected, routers from SITE-1, SITE-3, and SITE-4 are dimmed to 20% opacity,
 * highlighting the physical failure and redundancy boundary within SITE-2.
 */
export const SiteQuickFocus: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    selectedSite: 'SITE-2',
    focusNodeId: 'CORE-02',
    showLegend: true,
    showControls: true,
    zoom: 1.0,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 4: MultiBeaconLayers
 * Demonstrates multiple nodes with beacon rings rendered on Layer 3 (e.g. CORE-02 and AGG-01).
 * Validates that beacon rings cleanly pass beneath both node bodies while hovering above edge paths.
 */
export const MultiBeaconLayers: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    focusedNodeIds: ['CORE-01', 'CORE-02'],
    showLegend: true,
    showControls: true,
    zoom: 1.15,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 5: InteractivePanZoom (Step 5.1)
 * Full interactive pan & zoom playground:
 * - Mouse drag on empty canvas background: Smooth continuous panning with grab/grabbing cursor.
 * - Mouse wheel: Smooth zoom centered precisely around the mouse cursor position.
 * - Viewport controls (+, −, FIT): Zoom in (+20%), zoom out (-20%), and reset to fit.
 * - Double click canvas: Automatically centers and fits the canvas to view.
 */
export const InteractivePanZoom: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    focusNodeId: 'CORE-02',
    showLegend: true,
    showControls: true,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 6: ZoomedInState (Step 5.1)
 * Validates canvas at 1.6x zoom level with pan offset focused on Tier 2 Core Backbones.
 */
export const ZoomedInState: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    focusNodeId: 'CORE-02',
    showLegend: true,
    showControls: true,
    zoom: 1.6,
    pan: { x: -250, y: -120 },
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 7: ZoomedOutState (Step 5.1)
 * Validates canvas zoomed out to 0.6x (60%) overview perspective.
 */
export const ZoomedOutState: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    showLegend: true,
    showControls: true,
    zoom: 0.6,
    pan: { x: 80, y: 40 },
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 8: NodeSelectionAndBeacon (Step 5.2)
 * Demonstrates interactive node selection and double concentric radar beacon animations:
 * - Single click node: Toggles node selection with outer halo and Layer 3 radar beacon rings.
 * - Double click node: Centers viewport (`panToPoint`) and activates beacon focus reticle.
 */
export const NodeSelectionAndBeacon: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    selectedNodeId: 'CORE-01',
    showLegend: true,
    showControls: true,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 9: KHop1HopGhost (Step 5.3)
 * Demonstrates 1-Hop BFS Ego-Network around epicenter CORE-02:
 * - Direct 1-hop neighbors (PEER-01, IGW-02, AGG-02, AGG-03) and connecting links remain at 100% opacity.
 * - All devices and links beyond distance 1 are dimmed to 0.15 ghost opacity.
 */
export const KHop1HopGhost: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    focusNodeId: 'CORE-02',
    kHop: 1,
    filterMode: 'ghost',
    showLegend: true,
    showControls: true,
    showKHopControls: true,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 10: KHop2HopGhost (Step 5.3)
 * Demonstrates 2-Hop BFS Ego-Network around epicenter CORE-02:
 * - Expands visible perimeter to include 2nd-degree neighbors (CORE-01, IGW-01, AGG-01, EXCH-02, EXCH-03).
 */
export const KHop2HopGhost: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    focusNodeId: 'CORE-02',
    kHop: 2,
    filterMode: 'ghost',
    showLegend: true,
    showControls: true,
    showKHopControls: true,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 11: KHop1HopPrune (Step 5.3)
 * Demonstrates 1-Hop Prune Mode:
 * - Fully hides devices and links beyond 1-hop distance from the SVG canvas (display: 'none').
 */
export const KHop1HopPrune: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    focusNodeId: 'CORE-02',
    kHop: 1,
    filterMode: 'prune',
    showLegend: true,
    showControls: true,
    showKHopControls: true,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}

/**
 * Story 12: EdgeSelectionAndTooltip (Step 5.4)
 * Demonstrates link selection (highlighted with #1d4ed8 stroke and pulsing #38bdf8 halo)
 * along with rich contextual floating tooltips.
 */
export const EdgeSelectionAndTooltip: Story = {
  args: {
    nodes: sampleNodes,
    links: sampleLinks,
    width: 1200,
    height: 680,
    locale: 'vi',
    selectedLinkId: 'L-P1-C2',
    showLegend: true,
    showControls: true,
    showTooltip: true,
  },
  render: (args) => (
    <div className="dark w-full h-[680px] bg-[#0b0f19] p-4 flex items-center justify-center">
      <div className="w-[1200px] h-[680px] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <TopologyCanvas {...args} />
      </div>
    </div>
  ),
}
