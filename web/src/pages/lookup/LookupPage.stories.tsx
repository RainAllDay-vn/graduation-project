import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { LookupView, type LookupViewProps } from './index'
import { AppProviders } from '@/context'
import type { DeviceDetails, DeviceSummary, LinkSummary } from '@/api/topology'
import type { NetworkServiceDetails, NetworkServiceSummary, ServiceImpactReport } from '@/api/services'
import type { IncidentSummary } from '@/api/incidents'

const mockDevices: (DeviceDetails | DeviceSummary)[] = [
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
    links: [],
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
  },
  {
    id: 'SITE-2',
    name: 'SITE-2',
    layer: 'ACCESS',
    region: 'Miền Bắc',
    site: 'Trạm Cầu Giấy',
    ipAddress: '10.0.2.14',
    model: 'Huawei NE40E',
    status: 'CRITICAL',
    accessDeviceCount: 12,
    accessErrorCount: 8,
    links: [],
  },
  {
    id: 'SITE-4',
    name: 'SITE-4',
    layer: 'ACCESS',
    region: 'Miền Trung',
    site: 'Đà Nẵng Site 4',
    ipAddress: '10.1.2.4',
    model: 'Cisco NCS 540',
    status: 'ACTIVE',
    accessDeviceCount: 8,
    accessErrorCount: 0,
    links: [],
  },
]

const mockLinks: LinkSummary[] = [
  {
    linkId: 'LINK-01',
    sourceDeviceId: 'CORE-1',
    targetDeviceId: 'AGG-02',
    sourcePort: 'TenGig0/0/0/1',
    targetPort: 'TenGig0/0/0/0',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 100,
    operStatus: 'UP',
    rxPowerDbm: -14.2,
    txPowerDbm: 1.5,
    utilizationPercent: 62.4,
    isBackup: false,
  },
  {
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
  },
  {
    linkId: 'LINK-03',
    sourceDeviceId: 'CORE-1',
    targetDeviceId: 'SITE-2',
    sourcePort: 'TenGig0/2/0/0',
    targetPort: 'TenGig0/1/0/0',
    linkType: 'PHYSICAL_FIBER',
    capacityGbps: 10,
    operStatus: 'DOWN',
    rxPowerDbm: -26.5,
    txPowerDbm: -3.0,
    utilizationPercent: 0,
    isBackup: true,
  },
]

const mockServices: NetworkServiceSummary[] = [
  {
    id: 'SVC-01',
    name: 'Internet Transit Tier-1',
    description: 'Cổng kết nối Internet quốc tế cho khách hàng doanh nghiệp và các ISP cấp 2',
    type: 'INTERNET_TRANSIT',
    region: 'Toàn quốc',
    status: 'DEGRADED',
    subscriberCount: 45000,
    dependentDeviceCount: 2,
  },
  {
    id: 'SVC-02',
    name: 'VoIP Carrier Backbone',
    description: 'Dịch vụ thoại IP kết nối các tổng đài liên tỉnh',
    type: 'VOIP',
    region: 'Miền Bắc',
    status: 'OPERATIONAL',
    subscriberCount: 125000,
    dependentDeviceCount: 3,
  },
]

const mockServiceDetails: NetworkServiceDetails = {
  id: 'SVC-01',
  name: 'Internet Transit Tier-1',
  description: 'Cổng kết nối Internet quốc tế cho khách hàng doanh nghiệp và các ISP cấp 2',
  type: 'INTERNET_TRANSIT',
  region: 'Toàn quốc',
  status: 'DEGRADED',
  subscriberCount: 45000,
  dependentDevices: [
    mockDevices[0],
    mockDevices[1],
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
  description: 'Degraded due to optical link drop between AGG-02 and SITE-2',
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

const meta: Meta<typeof LookupView> = {
  title: 'Pages/Lookup',
  component: LookupView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AppProviders>
          <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] font-sans">
            <Story />
          </div>
        </AppProviders>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultDevicesView: Story = {
  args: {
    activeTab: 'devices',
    counts: {
      devices: 32,
      links: 87,
      services: 12,
    },
    searchQuery: '',
    layerFilter: 'ALL',
    typeFilter: 'ALL',
    regionFilter: 'ALL',
    statusFilter: 'ALL',
    availableRegions: ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Toàn quốc'],
    filteredDevices: mockDevices,
    filteredLinks: mockLinks,
    filteredServices: mockServices,
    selectedId: 'AGG-02',
    selectedDevice: mockDevices[1],
    selectedLink: null,
    selectedService: null,
    serviceImpact: null,
    correlatedIncident: mockIncident,
    isLoading: false,
    isLoadingDetails: false,
    locale: 'vi',
    onTabChange: (t) => console.log('Tab change:', t),
    onSearchChange: (q) => console.log('Search change:', q),
    onLayerChange: (l) => console.log('Layer change:', l),
    onTypeChange: (tp) => console.log('Type change:', tp),
    onRegionChange: (r) => console.log('Region change:', r),
    onStatusChange: (s) => console.log('Status change:', s),
    onResetFilters: () => console.log('Reset filters'),
    onSelect: (id) => console.log('Selected row:', id),
    onNavigateToTopology: (target) => console.log('Navigate to topology:', target),
    onSelectDependentDevice: (devId) => console.log('Select dependent device:', devId),
  },
}

export const LinksView: Story = {
  args: {
    ...DefaultDevicesView.args,
    activeTab: 'links',
    selectedId: 'LINK-02',
    selectedDevice: null,
    selectedLink: mockLinks[1],
    selectedService: null,
    correlatedIncident: mockIncident,
  } as LookupViewProps,
}

export const ServicesView: Story = {
  args: {
    ...DefaultDevicesView.args,
    activeTab: 'services',
    selectedId: 'SVC-01',
    selectedDevice: null,
    selectedLink: null,
    selectedService: mockServiceDetails,
    serviceImpact: mockServiceImpact,
    correlatedIncident: mockIncident,
  } as LookupViewProps,
}

export const FilteredEmptyState: Story = {
  args: {
    ...DefaultDevicesView.args,
    searchQuery: 'NonExistentAsset99',
    filteredDevices: [],
    selectedId: null,
    selectedDevice: null,
    correlatedIncident: null,
  } as LookupViewProps,
}

export const EnglishLocale: Story = {
  args: {
    ...DefaultDevicesView.args,
    locale: 'en',
  } as LookupViewProps,
}
