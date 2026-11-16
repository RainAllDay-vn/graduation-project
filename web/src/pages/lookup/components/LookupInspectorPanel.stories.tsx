import type { Meta, StoryObj } from '@storybook/react-vite'
import { LookupInspectorPanel } from './LookupInspectorPanel'
import type { DeviceDetails, LinkSummary } from '@/api/topology'
import type { NetworkServiceDetails, ServiceImpactReport } from '@/api/services'
import type { IncidentSummary } from '@/api/incidents'

const mockDeviceDetails: DeviceDetails = {
  id: 'AGG-02',
  name: 'AGG-02',
  layer: 'AGGREGATION',
  region: 'Miền Bắc',
  site: 'Hà Nội POP 2',
  ipAddress: '10.0.1.2',
  model: 'Juniper MX480',
  status: 'DEGRADED',
  accessDeviceCount: 18,
  accessErrorCount: 2,
  links: [
    {
      linkId: 'LINK-01',
      sourceDeviceId: 'AGG-02',
      targetDeviceId: 'CORE-1',
      sourcePort: 'TenGig0/0/0/0',
      targetPort: 'TenGig0/0/0/1',
      linkType: 'PHYSICAL_FIBER',
      capacityGbps: 100,
      operStatus: 'UP',
      rxPowerDbm: -14.2,
      txPowerDbm: 1.5,
      utilizationPercent: 62.4,
    },
    {
      linkId: 'LINK-02',
      sourceDeviceId: 'AGG-02',
      targetDeviceId: 'SITE-2',
      sourcePort: 'TenGig0/1/0/2',
      targetPort: 'TenGig0/0/0/1',
      linkType: 'PHYSICAL_FIBER',
      capacityGbps: 10,
      operStatus: 'DOWN',
      rxPowerDbm: -26.5,
      txPowerDbm: -3.0,
      utilizationPercent: 0,
    },
  ],
}

const mockLink: LinkSummary = {
  linkId: 'LINK-02',
  sourceDeviceId: 'AGG-02',
  targetDeviceId: 'SITE-2',
  sourcePort: 'TenGig0/1/0/2',
  targetPort: 'TenGig0/0/0/1',
  linkType: 'PHYSICAL_FIBER',
  capacityGbps: 10,
  operStatus: 'DEGRADED',
  rxPowerDbm: -21.8,
  txPowerDbm: 0.8,
  utilizationPercent: 78.5,
  isBackup: false,
}

const mockServiceDetails: NetworkServiceDetails = {
  id: 'SVC-01',
  name: 'Internet Transit Tier-1',
  description: 'Cổng kết nối Internet quốc tế cho khách hàng doanh nghiệp và các ISP cấp 2',
  type: 'INTERNET_TRANSIT',
  region: 'Toàn quốc',
  status: 'DEGRADED',
  subscriberCount: 45000,
  dependentDevices: [
    {
      id: 'CORE-1',
      name: 'CORE-1',
      layer: 'CORE',
      region: 'Miền Bắc',
      site: 'Hà Nội POP 1',
      ipAddress: '10.0.0.1',
      model: 'Cisco ASR 9904',
      status: 'ACTIVE',
      accessDeviceCount: 24,
      accessErrorCount: 0,
    },
    {
      id: 'AGG-02',
      name: 'AGG-02',
      layer: 'AGGREGATION',
      region: 'Miền Bắc',
      site: 'Hà Nội POP 2',
      ipAddress: '10.0.1.2',
      model: 'Juniper MX480',
      status: 'DEGRADED',
      accessDeviceCount: 18,
      accessErrorCount: 2,
    },
  ],
}

const mockServiceImpact: ServiceImpactReport = {
  serviceId: 'SVC-01',
  serviceName: 'Internet Transit Tier-1',
  serviceStatus: 'DEGRADED',
  totalDependentDevices: 2,
  activeDevices: 1,
  degradedDevices: 1,
  outageDevices: 0,
  affectedDevices: [],
  description: 'Degraded due to optical power drop on AGG-02 link',
}

const mockIncident: IncidentSummary = {
  id: 'INC-07',
  title: 'Mất tín hiệu quang SITE-2 ⇄ CORE-1',
  status: 'INVESTIGATING',
  severity: 'CRITICAL',
  region: 'Miền Bắc',
  primaryDeviceId: 'AGG-02',
  openedAt: '2026-11-16T06:52:00Z',
  alarmCount: 4,
}

const meta: Meta<typeof LookupInspectorPanel> = {
  title: 'Lookup/LookupInspectorPanel',
  component: LookupInspectorPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-[420px] font-sans">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const DeviceInspectionWithIncident: Story = {
  args: {
    activeTab: 'devices',
    selectedDevice: mockDeviceDetails,
    correlatedIncident: mockIncident,
    locale: 'vi',
    onNavigateToTopology: (target) => console.log('Navigate to topology:', target),
    onSelectDependentDevice: (devId) => console.log('Select dependent device:', devId),
  },
}

export const LinkInspectionDegraded: Story = {
  args: {
    activeTab: 'links',
    selectedLink: mockLink,
    locale: 'vi',
    onNavigateToTopology: (target) => console.log('Navigate to topology:', target),
  },
}

export const ServiceInspectionWithImpact: Story = {
  args: {
    activeTab: 'services',
    selectedService: mockServiceDetails,
    serviceImpact: mockServiceImpact,
    correlatedIncident: mockIncident,
    locale: 'vi',
    onNavigateToTopology: (target) => console.log('Navigate to topology:', target),
    onSelectDependentDevice: (devId) => console.log('Select dependent device:', devId),
  },
}

export const LoadingDetails: Story = {
  args: {
    activeTab: 'devices',
    selectedDevice: mockDeviceDetails,
    isLoadingDetails: true,
    locale: 'vi',
    onNavigateToTopology: () => {},
  },
}

export const EmptyState: Story = {
  args: {
    activeTab: 'devices',
    selectedDevice: null,
    locale: 'vi',
    onNavigateToTopology: () => {},
  },
}
