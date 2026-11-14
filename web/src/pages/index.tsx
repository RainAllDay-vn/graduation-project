import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context'
import { HeroSection } from './_components/HeroSection'
import { CapabilityGrid, type CapabilityItem } from './_components/CapabilityGrid'
import { LandingFooter } from './_components/LandingFooter'

const CAPABILITIES: CapabilityItem[] = [
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
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex-1 flex flex-col justify-between items-center w-full min-h-[calc(100vh-60px)] px-4">
      {/* Central Content Area (Hero + Capabilities) */}
      <div className="w-full flex flex-col items-center my-auto pt-8 md:pt-12">
        <HeroSection
          title="Điều tra sự cố mạng nhanh hơn"
          description="Topology thời gian thực, giả thuyết AI chỉ chỗ nghi ngờ, tra cứu tài nguyên trong vài giây — dành cho kỹ sư vận hành mạng nội bộ."
          hasActiveSession={isAuthenticated}
          primaryCtaText={isAuthenticated ? 'Tiếp tục phiên làm việc' : 'Đăng nhập'}
          secondaryCtaText={isAuthenticated ? undefined : 'Tạo tài khoản'}
          noteText={
            isAuthenticated
              ? 'Phiên của bạn còn hoạt động — tiếp tục từ nơi bạn dừng.'
              : 'Công cụ nội bộ — tài khoản do công ty cấp hoặc tự đăng ký.'
          }
          onPrimaryClick={() => navigate(isAuthenticated ? '/overview' : '/login')}
          onSecondaryClick={() => navigate('/signup')}
        />

        <CapabilityGrid items={CAPABILITIES} />
      </div>

      {/* Technical Status Footer */}
      <LandingFooter
        version="v0.4"
        environment="TEST"
        supportContact="IT NỘI BỘ"
      />
    </div>
  )
}
