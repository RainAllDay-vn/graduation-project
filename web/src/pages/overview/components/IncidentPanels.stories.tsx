import type { Meta, StoryObj } from '@storybook/react-vite'
import { IncidentPanels } from './IncidentPanels'
import type { IncidentSummary } from '@/api/incidents'

const mockOpen: IncidentSummary[] = [
  {
    id: 'INC-2026-0915',
    title: 'Suy hao quang học và BGP Flapping',
    status: 'INVESTIGATING',
    severity: 'CRITICAL',
    region: 'Miền Bắc - Hà Nội',
    primaryDeviceId: 'SW-HN-02',
    openedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    alarmCount: 3,
  },
  {
    id: 'INC-2026-0916',
    title: 'Nghẽn băng thông uplink Core Đà Nẵng',
    status: 'OPEN',
    severity: 'ERROR',
    region: 'Miền Trung - Đà Nẵng',
    primaryDeviceId: 'CORE-DN-01',
    openedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    alarmCount: 1,
  },
]

const mockRecent: IncidentSummary[] = [
  {
    id: 'INC-2026-0910',
    title: 'Mất nguồn thứ cấp PSU 2 tại POP Sài Gòn',
    status: 'RESOLVED',
    severity: 'WARNING',
    region: 'Miền Nam - TP. Hồ Chí Minh',
    primaryDeviceId: 'AGG-HCM-01',
    openedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    alarmCount: 1,
  },
]

const meta: Meta<typeof IncidentPanels> = {
  title: 'Overview/IncidentPanels',
  component: IncidentPanels,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    openIncidents: mockOpen,
    recentIncidents: mockRecent,
    isLoading: false,
    locale: 'vi',
    onOpenDashboard: () => {},
  },
}

export const English: Story = {
  args: {
    openIncidents: mockOpen,
    recentIncidents: mockRecent,
    isLoading: false,
    locale: 'en',
    onOpenDashboard: () => {},
  },
}

export const Empty: Story = {
  args: {
    openIncidents: [],
    recentIncidents: [],
    isLoading: false,
    locale: 'vi',
    onOpenDashboard: () => {},
  },
}

export const Loading: Story = {
  args: {
    openIncidents: [],
    recentIncidents: [],
    isLoading: true,
    locale: 'vi',
    onOpenDashboard: () => {},
  },
}
