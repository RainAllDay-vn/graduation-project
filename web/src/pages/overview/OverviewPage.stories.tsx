import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OverviewPage from './index'
import { AppProviders } from '@/context'
import type { IncidentSummary } from '@/api/incidents'
import type { TopologyGraph, DeviceSummary, LinkSummary } from '@/api/topology'

const mockIncidents: IncidentSummary[] = [
  {
    id: 'INC-2026-0915',
    title: 'BGP Flap & Optical Rx Power Degradation',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    primaryDeviceId: 'SW-HN-02',
    region: 'Miền Bắc (Hà Nội)',
    alarmCount: 3,
    openedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'INC-2026-0882',
    title: 'High Memory Threshold Exceeded',
    severity: 'ERROR',
    status: 'OPEN',
    primaryDeviceId: 'CORE-SG-01',
    region: 'Miền Nam (TP.HCM)',
    alarmCount: 1,
    openedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'INC-2026-0740',
    title: 'OSPF Neighbor Loss on Backup Ring',
    severity: 'WARNING',
    status: 'RESOLVED',
    primaryDeviceId: 'AGG-DN-02',
    region: 'Miền Trung (Đà Nẵng)',
    alarmCount: 0,
    openedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

const mockNodes: DeviceSummary[] = [
  {
    id: 'SW-HN-02',
    name: 'SW-HN-02',
    layer: 'ACCESS',
    region: 'Hà Nội',
    site: 'HN-DC1',
    ipAddress: '10.10.1.2',
    model: 'Cisco Nexus 9300',
    status: 'DEGRADED',
    accessDeviceCount: 24,
    accessErrorCount: 2,
  },
  {
    id: 'CORE-DN-01',
    name: 'CORE-DN-01',
    layer: 'CORE',
    region: 'Đà Nẵng',
    site: 'DN-POP',
    ipAddress: '10.10.1.1',
    model: 'Juniper MX960',
    status: 'ACTIVE',
    accessDeviceCount: 48,
    accessErrorCount: 0,
  },
  {
    id: 'CORE-SG-01',
    name: 'CORE-SG-01',
    layer: 'CORE',
    region: 'TP.HCM',
    site: 'SG-DC2',
    ipAddress: '10.10.2.1',
    model: 'Juniper MX960',
    status: 'ACTIVE',
    accessDeviceCount: 32,
    accessErrorCount: 0,
  },
  {
    id: 'AGG-DN-02',
    name: 'AGG-DN-02',
    layer: 'AGGREGATION',
    region: 'Đà Nẵng',
    site: 'DN-POP',
    ipAddress: '10.10.3.1',
    model: 'Cisco ASR 9000',
    status: 'ACTIVE',
    accessDeviceCount: 16,
    accessErrorCount: 0,
  },
]

const mockLinks: LinkSummary[] = [
  {
    linkId: 'L1',
    sourceDeviceId: 'SW-HN-02',
    targetDeviceId: 'CORE-DN-01',
    sourcePort: 'TenGigE0/0/0/1',
    targetPort: 'TenGigE0/0/0/2',
    linkType: 'PHYSICAL_FIBER',
    operStatus: 'DEGRADED',
    rxPowerDbm: -22.4,
    txPowerDbm: -2.1,
  },
  {
    linkId: 'L2',
    sourceDeviceId: 'CORE-DN-01',
    targetDeviceId: 'CORE-SG-01',
    sourcePort: 'HundredGigE0/1/0/0',
    targetPort: 'HundredGigE0/1/0/0',
    linkType: 'PHYSICAL_FIBER',
    operStatus: 'UP',
    rxPowerDbm: -12.0,
    txPowerDbm: -2.0,
  },
]

const mockTopology: TopologyGraph = {
  nodes: mockNodes,
  links: mockLinks,
}

function createStoryQueryClient(incidents: IncidentSummary[], topology: TopologyGraph) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })
  qc.setQueryData(['incidents'], incidents)
  qc.setQueryData(['topology'], topology)
  return qc
}

const meta: Meta<typeof OverviewPage> = {
  title: 'Pages/Overview',
  component: OverviewPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const ActiveInvestigationVietnamese: Story = {
  render: () => {
    localStorage.setItem('noc_locale', 'vi')
    const qc = createStoryQueryClient(mockIncidents, mockTopology)

    return (
      <MemoryRouter>
        <QueryClientProvider client={qc}>
          <AppProviders>
            <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:26px_26px]">
              <OverviewPage />
            </div>
          </AppProviders>
        </QueryClientProvider>
      </MemoryRouter>
    )
  },
}

export const ActiveInvestigationEnglish: Story = {
  render: () => {
    localStorage.setItem('noc_locale', 'en')
    const qc = createStoryQueryClient(mockIncidents, mockTopology)

    return (
      <MemoryRouter>
        <QueryClientProvider client={qc}>
          <AppProviders>
            <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:26px_26px]">
              <OverviewPage />
            </div>
          </AppProviders>
        </QueryClientProvider>
      </MemoryRouter>
    )
  },
}

export const AllSystemsNormal: Story = {
  render: () => {
    localStorage.setItem('noc_locale', 'vi')
    const resolvedOnly = mockIncidents.map((i) => ({ ...i, status: 'RESOLVED' as const }))
    const healthyTopology: TopologyGraph = {
      nodes: mockTopology.nodes.map((n) => ({ ...n, status: 'ACTIVE' as const })),
      links: mockTopology.links.map((l) => ({ ...l, operStatus: 'UP' as const, rxPowerDbm: -11.5 })),
    }
    const qc = createStoryQueryClient(resolvedOnly, healthyTopology)

    return (
      <MemoryRouter>
        <QueryClientProvider client={qc}>
          <AppProviders>
            <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:26px_26px]">
              <OverviewPage />
            </div>
          </AppProviders>
        </QueryClientProvider>
      </MemoryRouter>
    )
  },
}
