import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { LookupFilterBar } from './LookupFilterBar'

const meta: Meta<typeof LookupFilterBar> = {
  title: 'Lookup/LookupFilterBar',
  component: LookupFilterBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DevicesTabDefault: Story = {
  render: (args) => {
    const [q, setQ] = useState(args.searchQuery)
    const [layer, setLayer] = useState(args.layerFilter)
    const [region, setRegion] = useState(args.regionFilter)
    const [status, setStatus] = useState(args.statusFilter)

    return (
      <LookupFilterBar
        {...args}
        searchQuery={q}
        onSearchChange={setQ}
        layerFilter={layer}
        onLayerChange={setLayer}
        regionFilter={region}
        onRegionChange={setRegion}
        statusFilter={status}
        onStatusChange={setStatus}
        onResetFilters={() => {
          setQ('')
          setLayer('ALL')
          setRegion('ALL')
          setStatus('ALL')
        }}
      />
    )
  },
  args: {
    activeTab: 'devices',
    searchQuery: '',
    layerFilter: 'ALL',
    typeFilter: 'ALL',
    regionFilter: 'ALL',
    statusFilter: 'ALL',
    availableRegions: ['Miền Bắc', 'Miền Nam', 'Miền Trung'],
    locale: 'vi',
    onSearchChange: () => {},
    onLayerChange: () => {},
    onTypeChange: () => {},
    onRegionChange: () => {},
    onStatusChange: () => {},
    onResetFilters: () => {},
  },
}

export const LinksTabActiveFilters: Story = {
  render: (args) => {
    const [q, setQ] = useState(args.searchQuery)
    const [type, setType] = useState(args.typeFilter)
    const [status, setStatus] = useState(args.statusFilter)

    return (
      <LookupFilterBar
        {...args}
        searchQuery={q}
        onSearchChange={setQ}
        typeFilter={type}
        onTypeChange={setType}
        statusFilter={status}
        onStatusChange={setStatus}
        onResetFilters={() => {
          setQ('')
          setType('ALL')
          setStatus('ALL')
        }}
      />
    )
  },
  args: {
    activeTab: 'links',
    searchQuery: 'CORE-1',
    layerFilter: 'ALL',
    typeFilter: 'PHYSICAL_FIBER',
    regionFilter: 'ALL',
    statusFilter: 'DEGRADED',
    locale: 'vi',
    onSearchChange: () => {},
    onLayerChange: () => {},
    onTypeChange: () => {},
    onRegionChange: () => {},
    onStatusChange: () => {},
    onResetFilters: () => {},
  },
}

export const ServicesTabEnglish: Story = {
  render: (args) => {
    const [q, setQ] = useState(args.searchQuery)
    const [type, setType] = useState(args.typeFilter)
    const [region, setRegion] = useState(args.regionFilter)
    const [status, setStatus] = useState(args.statusFilter)

    return (
      <LookupFilterBar
        {...args}
        searchQuery={q}
        onSearchChange={setQ}
        typeFilter={type}
        onTypeChange={setType}
        regionFilter={region}
        onRegionChange={setRegion}
        statusFilter={status}
        onStatusChange={setStatus}
        onResetFilters={() => {
          setQ('')
          setType('ALL')
          setRegion('ALL')
          setStatus('ALL')
        }}
      />
    )
  },
  args: {
    activeTab: 'services',
    searchQuery: 'Transit',
    layerFilter: 'ALL',
    typeFilter: 'INTERNET_TRANSIT',
    regionFilter: 'ALL',
    statusFilter: 'ALL',
    locale: 'en',
    onSearchChange: () => {},
    onLayerChange: () => {},
    onTypeChange: () => {},
    onRegionChange: () => {},
    onStatusChange: () => {},
    onResetFilters: () => {},
  },
}
