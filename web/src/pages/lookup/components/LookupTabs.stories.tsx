import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { LookupTabs } from './LookupTabs'
import type { LookupTab } from './lookupUtils'

const meta: Meta<typeof LookupTabs> = {
  title: 'Lookup/LookupTabs',
  component: LookupTabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultVietnamese: Story = {
  render: (args) => {
    const [activeTab, setActiveTab] = useState<LookupTab>(args.activeTab)
    return (
      <LookupTabs
        {...args}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          args.onTabChange(tab)
        }}
      />
    )
  },
  args: {
    activeTab: 'devices',
    counts: {
      devices: 32,
      links: 87,
      services: 12,
    },
    locale: 'vi',
    onTabChange: (t) => console.log('Tab changed:', t),
  },
}

export const LinksActiveEnglish: Story = {
  render: (args) => {
    const [activeTab, setActiveTab] = useState<LookupTab>(args.activeTab)
    return (
      <LookupTabs
        {...args}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          args.onTabChange(tab)
        }}
      />
    )
  },
  args: {
    activeTab: 'links',
    counts: {
      devices: 12,
      links: 8,
      services: 12,
    },
    locale: 'en',
    onTabChange: (t) => console.log('Tab changed:', t),
  },
}

export const ServicesActive: Story = {
  render: (args) => {
    const [activeTab, setActiveTab] = useState<LookupTab>(args.activeTab)
    return (
      <LookupTabs
        {...args}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          args.onTabChange(tab)
        }}
      />
    )
  },
  args: {
    activeTab: 'services',
    counts: {
      devices: 12,
      links: 8,
      services: 12,
    },
    locale: 'vi',
    onTabChange: (t) => console.log('Tab changed:', t),
  },
}
