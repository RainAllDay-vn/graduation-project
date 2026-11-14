import { useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '@/context'
import { HeroSection } from './_components/HeroSection'
import { CapabilityGrid, type CapabilityItem } from './_components/CapabilityGrid'
import { LandingFooter } from './_components/LandingFooter'

const CONTENT = {
  vi: {
    hero: {
      title: 'Điều tra sự cố mạng nhanh hơn',
      description:
        'Topology thời gian thực, giả thuyết AI chỉ chỗ nghi ngờ, tra cứu tài nguyên trong vài giây — dành cho kỹ sư vận hành mạng nội bộ.',
      primaryIdle: 'Đăng nhập',
      primaryResume: 'Tiếp tục phiên làm việc',
      secondary: 'Tạo tài khoản',
      noteIdle: 'Công cụ nội bộ — tài khoản do công ty cấp hoặc tự đăng ký.',
      noteResume: 'Phiên của bạn còn hoạt động — tiếp tục từ nơi bạn dừng.',
    },
    capabilities: [
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
    ] as CapabilityItem[],
    footer: {
      supportContact: 'IT NỘI BỘ',
    },
  },
  en: {
    hero: {
      title: 'Faster Network Incident Investigation',
      description:
        'Real-time topology, AI hypotheses pinpointing suspects, resource lookups in seconds — built for internal network engineers.',
      primaryIdle: 'Log In',
      primaryResume: 'Resume Session',
      secondary: 'Create Account',
      noteIdle: 'Internal tool — accounts provisioned by company or self-registered.',
      noteResume: 'Your session is still active — resume where you left off.',
    },
    capabilities: [
      {
        numberTag: '01 · TOPOLOGY',
        description: 'Entire network on a single canvas: nodes, links, service impacts — updated in real time.',
      },
      {
        numberTag: '02 · INVESTIGATION',
        description: 'Alert timelines and AI hypotheses pinpoint suspect areas directly, avoiding manual hop-by-hop tracing.',
      },
      {
        numberTag: '03 · LOOKUP',
        description: 'Devices, links, and services found in seconds without memorizing IP addresses or port names.',
      },
    ] as CapabilityItem[],
    footer: {
      supportContact: 'INTERNAL IT',
    },
  },
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { locale } = useTheme()

  const t = CONTENT[locale] || CONTENT.vi

  return (
    <div className="flex-1 flex flex-col justify-between items-center w-full min-h-[calc(100vh-60px)] px-4">
      {/* Central Content Area (Hero + Capabilities) */}
      <div className="w-full flex flex-col items-center my-auto pt-8 md:pt-12">
        <HeroSection
          title={t.hero.title}
          description={t.hero.description}
          hasActiveSession={isAuthenticated}
          primaryCtaText={isAuthenticated ? t.hero.primaryResume : t.hero.primaryIdle}
          secondaryCtaText={isAuthenticated ? undefined : t.hero.secondary}
          noteText={isAuthenticated ? t.hero.noteResume : t.hero.noteIdle}
          onPrimaryClick={() => navigate(isAuthenticated ? '/overview' : '/login')}
          onSecondaryClick={() => navigate('/signup')}
        />

        <CapabilityGrid items={t.capabilities} />
      </div>

      {/* Technical Status Footer */}
      <LandingFooter
        version="v0.4"
        environment="TEST"
        supportContact={t.footer.supportContact}
        locale={locale}
      />
    </div>
  )
}
