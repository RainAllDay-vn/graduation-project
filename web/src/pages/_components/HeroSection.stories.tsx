import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeroSection } from './HeroSection'

const meta: Meta<typeof HeroSection> = {
  title: 'Landing/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Điều tra sự cố mạng nhanh hơn',
    description:
      'Topology thời gian thực, giả thuyết AI chỉ chỗ nghi ngờ, tra cứu tài nguyên trong vài giây — dành cho kỹ sư vận hành mạng nội bộ.',
    primaryCtaText: 'Đăng nhập',
    secondaryCtaText: 'Tạo tài khoản',
    noteText: 'Công cụ nội bộ — tài khoản do công ty cấp hoặc tự đăng ký.',
  },
}

export const ActiveSession: Story = {
  args: {
    title: 'Điều tra sự cố mạng nhanh hơn',
    description:
      'Topology thời gian thực, giả thuyết AI chỉ chỗ nghi ngờ, tra cứu tài nguyên trong vài giây — dành cho kỹ sư vận hành mạng nội bộ.',
    hasActiveSession: true,
    primaryCtaText: 'Tiếp tục phiên làm việc',
    noteText: 'Phiên của bạn còn hoạt động — tiếp tục từ nơi bạn dừng.',
  },
}
