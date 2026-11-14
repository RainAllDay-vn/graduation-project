import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { signup } from '@/api/auth'
import { useTheme } from '@/context'
import { SignupForm, type SignupFormData, type SignupFormErrors } from './components/SignupForm'
import { TopologySidePanel } from './components/TopologySidePanel'

export default function SignupPage() {
  const navigate = useNavigate()
  const { locale, setLocale } = useTheme()

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error and general error on change
    if (errors[field] || errors.general) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: SignupFormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = locale === 'en' ? 'Full name is required' : 'Vui lòng nhập họ và tên'
    }

    if (!formData.email.trim()) {
      newErrors.email = locale === 'en' ? 'Email is required' : 'Vui lòng nhập email công ty'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = locale === 'en' ? 'Invalid email format' : 'Định dạng email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = locale === 'en' ? 'Password is required' : 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 8) {
      newErrors.password = locale === 'en' ? 'Password must be at least 8 characters' : 'Mật khẩu phải có tối thiểu 8 ký tự'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = locale === 'en' ? 'Passwords do not match.' : 'Mật khẩu xác nhận không khớp.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })
      setIsSuccess(true)
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setErrors({
            general: locale === 'en' ? 'This email is already registered.' : 'Email này đã được đăng ký.',
            email: locale === 'en' ? 'Email already in use' : 'Email đã tồn tại trong hệ thống',
          })
        } else if (err.response?.data?.message) {
          setErrors({ general: err.response.data.message })
        } else {
          setErrors({
            general:
              locale === 'en'
                ? 'Failed to register account. Please check your network and try again.'
                : 'Đăng ký không thành công. Vui lòng kiểm tra kết nối và thử lại.',
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

  return (
    <div className="min-h-screen w-full flex bg-white font-sans antialiased overflow-hidden">
      {/* Left Form Column */}
      <SignupForm
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        isSuccess={isSuccess}
        locale={locale}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onLoginClick={() => navigate('/login')}
      />

      {/* Right Topology Graphic Column */}
      <TopologySidePanel
        locale={locale}
        onLocaleChange={(newLocale) => setLocale(newLocale)}
      />
    </div>
  )
}
