import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentFilterBar } from './DocumentFilterBar'

const meta: Meta<typeof DocumentFilterBar> = {
  title: 'Documents/DocumentFilterBar',
  component: DocumentFilterBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultVietnamese: Story = {
  args: {
    searchQuery: '',
    selectedStatus: 'ALL',
    selectedSource: 'ALL',
    locale: 'vi',
    onSearchChange: (q) => console.log('Search:', q),
    onStatusChange: (s) => console.log('Status:', s),
    onSourceChange: (src) => console.log('Source:', src),
    onResetFilters: () => console.log('Reset filters'),
  },
}

export const FilteredEnglish: Story = {
  args: {
    searchQuery: 'optical',
    selectedStatus: 'READY',
    selectedSource: 'INTERNAL_WIKI',
    locale: 'en',
    onSearchChange: () => {},
    onStatusChange: () => {},
    onSourceChange: () => {},
    onResetFilters: () => {},
  },
}
