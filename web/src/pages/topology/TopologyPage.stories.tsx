import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProviders } from '@/context'
import { TopologyPage } from './index'
import { sampleNodes, sampleLinks } from './components/canvas/mockTopologyData'

function createStoryQueryClient() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })
  qc.setQueryData(['topology', 'subgraph', undefined, undefined, 2], {
    nodes: sampleNodes,
    links: sampleLinks,
  })
  return qc
}

const meta: Meta<typeof TopologyPage> = {
  title: 'Topology/TopologyPage',
  component: TopologyPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TopologyPage>

/**
 * Story 1: DefaultDark
 * Standard free infrastructure exploration in dark mode:
 * - 3-column workspace (Left sidebar, Center Stratified Canvas, Right Inspector)
 * - Topbar showing full network stats (78 devices, 152 trunk links)
 * - Left sidebar showing Devices and Display tabs with search and wireframes
 * - Central canvas displaying 5 tiers with site colors and Bézier curves
 * - Right sidebar showing general network health cards
 */
export const DefaultDark: Story = {
  render: () => {
    const qc = createStoryQueryClient()
    return (
      <MemoryRouter initialEntries={['/topology']}>
        <QueryClientProvider client={qc}>
          <AppProviders>
            <div className="dark w-full h-screen bg-[#070a10]">
              <TopologyPage
                mockData={{
                  nodes: sampleNodes,
                  links: sampleLinks,
                }}
              />
            </div>
          </AppProviders>
        </QueryClientProvider>
      </MemoryRouter>
    )
  },
}

/**
 * Story 2: DefaultLight
 * Free infrastructure exploration in light mode:
 * Validates light-mode contrast, borders, and sidebar backgrounds.
 */
export const DefaultLight: Story = {
  render: () => {
    const qc = createStoryQueryClient()
    return (
      <MemoryRouter initialEntries={['/topology']}>
        <QueryClientProvider client={qc}>
          <AppProviders>
            <div className="w-full h-screen bg-slate-100">
              <TopologyPage
                mockData={{
                  nodes: sampleNodes,
                  links: sampleLinks,
                }}
              />
            </div>
          </AppProviders>
        </QueryClientProvider>
      </MemoryRouter>
    )
  },
}

/**
 * Story 3: IncidentElevationDark
 * Single Topology Engine in Incident Investigation Context:
 * - URL: `/topology?incidentId=INC-2026-0915`
 * - Thin header elevates with pulsing amber chip `INC-2026-0915 · ĐANG XỬ LÝ`
 * - Left sidebar unlocks 4 tabs (`Timeline`, `Giả thuyết`, `Thiết bị`, `Hiển thị`)
 * - Canvas auto-focuses on epicenter router `CORE-02` with dedicated Layer 3 beacon rings
 * - Downstream degraded links rendered with amber blast radius stroke
 */
export const IncidentElevationDark: Story = {
  render: () => {
    const qc = createStoryQueryClient()
    return (
      <MemoryRouter initialEntries={['/topology?incidentId=INC-2026-0915']}>
        <QueryClientProvider client={qc}>
          <AppProviders>
            <div className="dark w-full h-screen bg-[#070a10]">
              <TopologyPage
                initialIncidentId="INC-2026-0915"
                mockData={{
                  nodes: sampleNodes,
                  links: sampleLinks,
                }}
              />
            </div>
          </AppProviders>
        </QueryClientProvider>
      </MemoryRouter>
    )
  },
}

/**
 * Story 4: FocusedRouterMode
 * Ego-Network 2-hop radius inspection on CORE-01:
 * - Header indicates `TIÊU ĐIỂM: CORE-01 · 2-HOP LÂN CẬN`
 * - Canvas highlights `CORE-01` with animated beacon rings
 */
export const FocusedRouterMode: Story = {
  render: () => {
    const qc = createStoryQueryClient()
    return (
      <MemoryRouter initialEntries={['/topology?focusNodeId=CORE-01&kHop=2']}>
        <QueryClientProvider client={qc}>
          <AppProviders>
            <div className="dark w-full h-screen bg-[#070a10]">
              <TopologyPage
                initialFocusNodeId="CORE-01"
                mockData={{
                  nodes: sampleNodes,
                  links: sampleLinks,
                }}
              />
            </div>
          </AppProviders>
        </QueryClientProvider>
      </MemoryRouter>
    )
  },
}
