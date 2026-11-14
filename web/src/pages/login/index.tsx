import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { login } from '@/api/auth'
import { useAuth, useTheme } from '@/context'
import { TopologySidePanel } from '@/components/auth/TopologySidePanel'
import { LoginForm, type LoginFormData, type LoginFormErrors } from './components/LoginForm'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, setUser } = useAuth()
  const { locale, setLocale } = useTheme()

  const [formData, setFormData] = useState<LoginFormData>(() => {
    const remembered = localStorage.getItem('noc_remember_email') || ''
    return {
      email: remembered,
      password: '',
      rememberMe: !!remembered,
    }
  })

  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isSuccess) {
      navigate('/overview', { replace: true })
    }
  }, [isAuthenticated, isSuccess, navigate])

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error when user types
    if (errors[field as keyof LoginFormErrors] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof LoginFormErrors]: undefined,
        general: undefined,
      }))
    }
  }

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email =
        locale === 'en'
          ? 'Username or email is required'
          : 'Vui lòng nhập tên đăng nhập hoặc email'
    }

    if (!formData.password) {
      newErrors.password =
        locale === 'en'
          ? 'Password is required'
          : 'Vui lòng nhập mật khẩu'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || isLoading || isSuccess) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const userDetails = await login({
        email: formData.email.trim(),
        password: formData.password,
      })

      // Handle "Remember me"
      if (formData.rememberMe) {
        localStorage.setItem('noc_remember_email', formData.email.trim())
      } else {
        localStorage.removeItem('noc_remember_email')
      }

      setIsSuccess(true)
      setUser(userDetails)

      // Allow brief moment to display success banner before navigating
      setTimeout(() => {
        navigate('/overview')
      }, 1200)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setErrors({
            general:
              locale === 'en'
                ? 'Wrong username or password.'
                : 'Tài khoản hoặc mật khẩu không đúng.',
          })
        } else if (err.response?.data?.message) {
          setErrors({ general: err.response.data.message })
        } else {
          setErrors({
            general:
              locale === 'en'
                ? 'Unable to connect to the authentication service. Please try again.'
                : 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.',
          })
        }
      } else {
        setErrors({
          general:
            locale === 'en'
              ? 'An unexpected error occurred.'
              : 'Đã xảy ra lỗi không mong muốn.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSsoClick = () => {
    alert(
      locale === 'en'
        ? 'Corporate SSO is enabled for enterprise accounts. Please ensure your VPN or internal network proxy is active.'
        : 'Tính năng đăng nhập SSO dành cho tài khoản doanh nghiệp. Vui lòng đảm bảo đã kết nối VPN hoặc mạng nội bộ.'
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans antialiased overflow-hidden">
      {/* Left Form Column */}
      <LoginForm
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        isSuccess={isSuccess}
        locale={locale}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onSignupClick={() => navigate('/signup')}
        onSsoClick={handleSsoClick}
      />

      {/* Right Topology Graphic Column */}
      <TopologySidePanel
        locale={locale}
        onLocaleChange={(newLocale) => setLocale(newLocale)}
      />
    </div>
  )
}
