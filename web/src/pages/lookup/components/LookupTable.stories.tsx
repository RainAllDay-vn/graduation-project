import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { LookupTable } from './LookupTable'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import type { NetworkServiceSummary } from '@/api/services'

const mockDevices: DeviceSummary[] = [
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
    description: 'Cổng kết nối Internet quốc tế cho khách hàng doanh nghiệp',
    type: 'INTERNET_TRANSIT',
    region: 'Toàn quốc',
    status: 'OPERATIONAL',
    subscriberCount: 45000,
    dependentDeviceCount: 4,
  },
  {
    id: 'SVC-02',
    name: 'VoIP Carrier Backbone',
    description: 'Dịch vụ thoại IP kết nối các tổng đài liên tỉnh',
    type: 'VOIP',
    region: 'Miền Bắc',
    status: 'DEGRADED',
    subscriberCount: 125000,
    dependentDeviceCount: 3,
  },
  {
    id: 'SVC-03',
    name: 'VPN MPLS Ngân hàng',
    description: 'Kênh truyền riêng kết nối mạng lưới PGD ngân hàng BIDV',
    type: 'VPN_MPLS',
    region: 'Miền Trung',
    status: 'OUTAGE',
    subscriberCount: 120,
    dependentDeviceCount: 2,
  },
]

const meta: Meta<typeof LookupTable> = {
  title: 'Lookup/LookupTable',
  component: LookupTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DevicesTab: Story = {
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string | null>(args.selectedId || 'AGG-02')
    return <LookupTable {...args} selectedId={selectedId} onSelect={setSelectedId} />
  },
  args: {
    activeTab: 'devices',
    devices: mockDevices,
    links: mockLinks,
    services: mockServices,
    selectedId: 'AGG-02',
    isLoading: false,
    locale: 'vi',
    onSelect: () => {},
  },
}

export const LinksTab: Story = {
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string | null>(args.selectedId || 'LINK-02')
    return <LookupTable {...args} selectedId={selectedId} onSelect={setSelectedId} />
  },
  args: {
    activeTab: 'links',
    devices: mockDevices,
    links: mockLinks,
    services: mockServices,
    selectedId: 'LINK-02',
    isLoading: false,
    locale: 'vi',
    onSelect: () => {},
  },
}

export const ServicesTab: Story = {
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string | null>(args.selectedId || 'SVC-02')
    return <LookupTable {...args} selectedId={selectedId} onSelect={setSelectedId} />
  },
  args: {
    activeTab: 'services',
    devices: mockDevices,
    links: mockLinks,
    services: mockServices,
    selectedId: 'SVC-02',
    isLoading: false,
    locale: 'vi',
    onSelect: () => {},
  },
}

export const LoadingState: Story = {
  args: {
    activeTab: 'devices',
    devices: [],
    links: [],
    services: [],
    isLoading: true,
    locale: 'vi',
    onSelect: () => {},
  },
}

export const EmptyState: Story = {
  args: {
    activeTab: 'devices',
    devices: [],
    links: [],
    services: [],
    isLoading: false,
    locale: 'vi',
    onSelect: () => {},
    onResetFilters: () => console.log('Reset filters clicked'),
  },
}
