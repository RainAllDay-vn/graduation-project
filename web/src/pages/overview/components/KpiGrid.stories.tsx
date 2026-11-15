import type { Meta, StoryObj } from '@storybook/react-vite'
import { KpiGrid } from './KpiGrid'

const meta: Meta<typeof KpiGrid> = {
  title: 'Overview/KpiGrid',
  component: KpiGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      {
        id: 'kpi-1',
        label: 'NÚT HOẠT ĐỘNG',
        value: '15/16',
        tone: 'normal',
        subtitle: '1 cảnh báo · 0 lỗi nghiêm trọng',
      },
      {
        id: 'kpi-2',
        label: 'CẢNH BÁO ĐANG MỞ',
        value: 1,
        tone: 'warn',
        subtitle: 'ALM 58.2°C · SITE-2',
      },
      {
        id: 'kpi-3',
        label: 'SỰ CỐ ĐANG XỬ LÝ',
        value: 1,
        tone: 'bad',
        subtitle: 'INC-07 · mở 13:52',
      },
      {
        id: 'kpi-4',
        label: 'CỔNG MẤT KẾT NỐI',
        value: 2,
        tone: 'bad',
        subtitle: 'liên quan INC-07',
      },
    ],
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    items: [
      { id: 'kpi-1', label: 'NÚT HOẠT ĐỘNG', value: '15/16', subtitle: '...' },
      { id: 'kpi-2', label: 'CẢNH BÁO ĐANG MỞ', value: 0, subtitle: '...' },
      { id: 'kpi-3', label: 'SỰ CỐ ĐANG XỬ LÝ', value: 0, subtitle: '...' },
      { id: 'kpi-4', label: 'CỔNG MẤT KẾT NỐI', value: 0, subtitle: '...' },
    ],
    isLoading: true,
  },
}
