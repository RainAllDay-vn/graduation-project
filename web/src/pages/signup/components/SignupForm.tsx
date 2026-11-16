export interface SignupFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface SignupFormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export interface SignupFormProps {
  formData: SignupFormData
  errors: SignupFormErrors
  isLoading?: boolean
  isSuccess?: boolean
  locale?: 'vi' | 'en'
  onChange: (field: keyof SignupFormData, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onLoginClick: () => void
}

export function SignupForm({
  formData,
  errors,
  isLoading = false,
  isSuccess = false,
  locale = 'vi',
  onChange,
  onSubmit,
  onLoginClick,
}: SignupFormProps) {
  const isEn = locale === 'en'

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between items-center py-10 px-6 sm:px-12 md:px-20 bg-white dark:bg-[#0b0f19] relative transition-colors">
      {/* Centered Form Card */}
      <div className="w-full max-w-[460px] my-auto">
        {/* Head Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#eff6ff] dark:bg-blue-950/40 text-[#1d4ed8] dark:text-[#60a5fa] font-mono font-extrabold text-2xl flex items-center justify-center mx-auto mb-4 border border-[#bfdbfe]/50 dark:border-blue-900/50 shadow-sm">
            N
          </div>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-[-0.01em] text-[#0f172a] dark:text-[#f8fafc] m-0">
            {isEn ? 'Create Account' : 'Tạo tài khoản'}
          </h1>
          <p className="mt-2 text-[13.5px] text-[#64748b] dark:text-[#94a3b8]">
            <span>{isEn ? 'Already have an account?' : 'Đã có tài khoản?'}</span>{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-[#1d4ed8] dark:text-[#60a5fa] font-bold hover:underline cursor-pointer bg-transparent border-none p-0 inline"
            >
              {isEn ? 'Sign In' : 'Đăng nhập'}
            </button>
          </p>
        </div>

        {/* Global Error Banner */}
        {errors.general && (
          <div className="mb-4 bg-[#fef2f2] dark:bg-red-950/40 border border-[#fecaca] dark:border-red-900/50 text-[#b91c1c] dark:text-red-300 rounded-xl p-3 text-[12.5px] font-semibold leading-relaxed">
            {errors.general}
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-4 bg-[#ecfdf5] dark:bg-emerald-950/40 border border-[#a7f3d0] dark:border-emerald-800/50 text-[#047857] dark:text-emerald-300 rounded-xl p-3 text-[12.5px] font-semibold leading-relaxed">
            {isEn
              ? 'Account created successfully! You can now log in.'
              : 'Tạo tài khoản thành công — bạn có thể đăng nhập ngay bây giờ.'}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder={isEn ? 'Full name' : 'Họ và tên'}
              required
              disabled={isLoading || isSuccess}
              className={`w-full h-12 px-4 rounded-xl border text-sm text-[#0f172a] dark:text-[#f8fafc] bg-white dark:bg-[#0f172a] placeholder-[#94a3b8] dark:placeholder-[#64748b] outline-none transition-all ${
                errors.fullName
                  ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20'
                  : 'border-[#cbd5e1] dark:border-[#334155] focus:border-[#1d4ed8] focus:ring-3 focus:ring-[#1d4ed8]/12'
              }`}
            />
            {errors.fullName && (
              <p className="text-[12px] font-semibold text-[#b91c1c] mt-1.5">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder={isEn ? 'Corporate email — user@company.vn' : 'Email công ty — ten@congty.vn'}
              required
              disabled={isLoading || isSuccess}
              className={`w-full h-12 px-4 rounded-xl border text-sm text-[#0f172a] dark:text-[#f8fafc] bg-white dark:bg-[#0f172a] placeholder-[#94a3b8] dark:placeholder-[#64748b] outline-none transition-all ${
                errors.email
                  ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20'
                  : 'border-[#cbd5e1] dark:border-[#334155] focus:border-[#1d4ed8] focus:ring-3 focus:ring-[#1d4ed8]/12'
              }`}
            />
            {errors.email && (
              <p className="text-[12px] font-semibold text-[#b91c1c] mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder={isEn ? 'Password' : 'Mật khẩu'}
              required
              minLength={8}
              disabled={isLoading || isSuccess}
              className={`w-full h-12 px-4 rounded-xl border text-sm text-[#0f172a] dark:text-[#f8fafc] bg-white dark:bg-[#0f172a] placeholder-[#94a3b8] dark:placeholder-[#64748b] outline-none transition-all ${
                errors.password
                  ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20'
                  : 'border-[#cbd5e1] dark:border-[#334155] focus:border-[#1d4ed8] focus:ring-3 focus:ring-[#1d4ed8]/12'
              }`}
            />
            <p className="text-[11px] text-[#94a3b8] dark:text-[#64748b] mt-1.5">
              {isEn ? 'minimum 8 characters' : 'tối thiểu 8 ký tự'}
            </p>
            {errors.password && (
              <p className="text-[12px] font-semibold text-[#b91c1c] mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              placeholder={isEn ? 'Confirm password' : 'Nhập lại mật khẩu'}
              required
              disabled={isLoading || isSuccess}
              className={`w-full h-12 px-4 rounded-xl border text-sm text-[#0f172a] dark:text-[#f8fafc] bg-white dark:bg-[#0f172a] placeholder-[#94a3b8] dark:placeholder-[#64748b] outline-none transition-all ${
                errors.confirmPassword
                  ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20'
                  : 'border-[#cbd5e1] dark:border-[#334155] focus:border-[#1d4ed8] focus:ring-3 focus:ring-[#1d4ed8]/12'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-[12px] font-semibold text-[#b91c1c] mt-1.5">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="h-[46px] rounded-full px-10 bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-50 text-white font-bold text-sm cursor-pointer shadow-sm transition-colors mx-auto inline-flex items-center justify-center"
            >
              {isLoading ? (
                <span>{isEn ? 'Creating account...' : 'Đang xử lý...'}</span>
              ) : (
                <span>{isEn ? 'Create Account' : 'Tạo tài khoản'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Pane Footer */}
      <footer className="w-full text-center font-mono text-[11px] font-bold tracking-[0.1em] text-[#94a3b8] dark:text-[#64748b] pt-8">
        NOC TOPOLOGY v0.4 · MÔI TRƯỜNG <span className="text-[#f59e0b] font-extrabold">TEST</span> · HỖ TRỢ: IT NỘI BỘ
      </footer>
    </div>
  )
}
