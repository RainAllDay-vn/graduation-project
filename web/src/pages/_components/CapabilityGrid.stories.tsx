import type { Meta, StoryObj } from '@storybook/react-vite'
import { CapabilityGrid } from './CapabilityGrid'

const meta: Meta<typeof CapabilityGrid> = {
  title: 'Landing/CapabilityGrid',
  component: CapabilityGrid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      {
        numberTag: '01 · TOPOLOGY',
        description: 'Toàn mạng trên một canvas: nút, liên kết, ảnh hưởng tới dịch vụ — cập nhật thời gian thực.',
      },
      {
        numberTag: '02 · ĐIỀU TRA',
        description: 'Timeline cảnh báo và giả thuyết AI dẫn thẳng tới vùng nghi ngờ, không dò từng thiết bị.',
      },
      {
        numberTag: '03 · TRA CỬU',
        description: 'Thiết bị, liên kết, dịch vụ tìm được trong vài giây, không cần nhớ địa chỉ hay tên cổng.',
      },
    ],
  },
}
