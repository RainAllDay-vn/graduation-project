import { useState, type FormEvent } from 'react'

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginFormErrors {
  email?: string
  password?: string
  general?: string
}

export interface LoginFormProps {
  formData: LoginFormData
  errors: LoginFormErrors
  isLoading?: boolean
  isSuccess?: boolean
  locale?: 'vi' | 'en'
  onChange: (field: keyof LoginFormData, value: string | boolean) => void
  onSubmit: (e: FormEvent) => void
  onSignupClick: () => void
  onSsoClick?: () => void
}

const TEXT = {
  vi: {
    h1: 'Đăng nhập',
    leadPre: 'Chưa có tài khoản?',
    leadLink: 'Đăng ký',
    bannerErr: 'Tài khoản hoặc mật khẩu không đúng.',
    bannerOk: 'Đăng nhập thành công — đang mở Tổng quan mạng…',
    userPh: 'Tên đăng nhập nội bộ hoặc email',
    passPh: 'Mật khẩu',
    remember: 'Ghi nhớ tôi',
    forgot: 'Quên mật khẩu?',
    submit: 'Đăng nhập',
    submitBusy: 'Đang đăng nhập…',
    divider: 'HOẶC',
    sso: 'Đăng nhập bằng SSO công ty',
    ftEnv: 'MÔI TRƯỜNG',
    ftSupport: 'HỖ TRỢ: IT NỘI BỘ',
    forgotModalTitle: 'Quên mật khẩu?',
    forgotModalDesc: 'Mật khẩu tài khoản nội bộ do quản trị viên IT cấp. Vui lòng liên hệ IT nội bộ (Hotline: 1900-NOC / Email: it-support@corp.internal) để được cấp lại mật khẩu.',
    forgotModalClose: 'Đóng',
  },
  en: {
    h1: 'Sign in',
    leadPre: "Don't have an account?",
    leadLink: 'Sign up',
    bannerErr: 'Wrong username or password.',
    bannerOk: 'Signed in — opening Network overview…',
    userPh: 'Internal username or email',
    passPh: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Sign in',
    submitBusy: 'Signing in…',
    divider: 'OR',
    sso: 'Sign in with company SSO',
    ftEnv: 'ENVIRONMENT',
    ftSupport: 'SUPPORT: INTERNAL IT',
    forgotModalTitle: 'Forgot password?',
    forgotModalDesc: 'Internal account credentials are provisioned by IT administration. Please reach out to internal IT support (Hotline: 1900-NOC / Email: it-support@corp.internal) to reset your credentials.',
    forgotModalClose: 'Close',
  },
}

export function LoginForm({
  formData,
  errors,
  isLoading = false,
  isSuccess = false,
  locale = 'vi',
  onChange,
  onSubmit,
  onSignupClick,
  onSsoClick,
}: LoginFormProps) {
  const [showForgotModal, setShowForgotModal] = useState(false)
  const t = TEXT[locale] || TEXT.vi

  return (
    <div className="flex-1 min-w-0 relative flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 lg:p-20 bg-white dark:bg-[#0b0f19] min-h-screen select-none transition-colors">
      <div className="w-full max-w-[420px] my-auto">
        {/* Head Branding */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#eff6ff] dark:bg-blue-950/40 text-[#1d4ed8] dark:text-[#60a5fa] font-mono font-extrabold text-[22px] flex items-center justify-center mx-auto border border-[#bfdbfe]/50 dark:border-blue-900/50 shadow-sm">
            N
          </div>
          <h1 className="mt-5 text-[28px] font-extrabold tracking-[-0.01em] text-[#0f172a] dark:text-[#f8fafc] m-0">
            {t.h1}
          </h1>
          <p className="mt-2.5 text-[13.5px] text-[#64748b] dark:text-[#94a3b8] m-0">
            <span>{t.leadPre} </span>
            <button
              type="button"
              onClick={onSignupClick}
              className="text-[#1d4ed8] dark:text-[#60a5fa] font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
            >
              {t.leadLink}
            </button>
          </p>
        </div>

        {/* Status Banners */}
        {errors.general && (
          <div className="mt-4 text-[12.5px] font-semibold rounded-lg px-3 py-2.5 bg-[#fef2f2] dark:bg-red-950/40 border border-[#fecaca] dark:border-red-900/50 text-[#991b1b] dark:text-red-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0" />
            <span>{errors.general || t.bannerErr}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mt-4 text-[12.5px] font-semibold rounded-lg px-3 py-2.5 bg-[#ecfdf5] dark:bg-emerald-950/40 border border-[#a7f3d0] dark:border-emerald-800/50 text-[#065f46] dark:text-emerald-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
            <span>{t.bannerOk}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={onSubmit} className="mt-4">
          <div>
            <div className="mt-3.5">
              <input
                id="f-user"
                type="text"
                placeholder={t.userPh}
                aria-label={t.userPh}
                value={formData.email}
                disabled={isLoading || isSuccess}
                onChange={(e) => onChange('email', e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                className={`w-full h-12 border rounded-lg px-4 text-sm font-sans text-[#0f172a] dark:text-[#f8fafc] bg-white dark:bg-[#0f172a] outline-none transition-all placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] ${
                  errors.email
                    ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20'
                    : 'border-[#cbd5e1] dark:border-[#334155] focus:border-[#1d4ed8] focus:ring-3 focus:ring-[#1d4ed8]/12'
                }`}
              />
              {errors.email && (
                <p className="text-[12px] font-medium text-[#ef4444] mt-1 mb-0 px-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mt-3.5">
              <input
                id="f-pass"
                type="password"
                placeholder={t.passPh}
                aria-label={t.passPh}
                value={formData.password}
                disabled={isLoading || isSuccess}
                onChange={(e) => onChange('password', e.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck="false"
                className={`w-full h-12 border rounded-lg px-4 text-sm font-sans text-[#0f172a] dark:text-[#f8fafc] bg-white dark:bg-[#0f172a] outline-none transition-all placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] ${
                  errors.password
                    ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20'
                    : 'border-[#cbd5e1] dark:border-[#334155] focus:border-[#1d4ed8] focus:ring-3 focus:ring-[#1d4ed8]/12'
                }`}
              />
              {errors.password && (
                <p className="text-[12px] font-medium text-[#ef4444] mt-1 mb-0 px-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Aux Row: Remember me + Forgot password */}
            <div className="mt-3.5 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-[#334155] dark:text-[#cbd5e1] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  disabled={isLoading || isSuccess}
                  onChange={(e) => onChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 rounded border-[#cbd5e1] dark:border-[#334155] text-[#1d4ed8] focus:ring-[#1d4ed8] cursor-pointer accent-[#1d4ed8]"
                />
                <span>{t.remember}</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[13px] font-semibold text-[#1d4ed8] dark:text-[#60a5fa] hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                {t.forgot}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`h-[46px] px-10 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm ${
                isLoading || isSuccess
                  ? 'bg-[#64748b] cursor-not-allowed opacity-90'
                  : 'bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-[0.99]'
              }`}
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              )}
              <span>{isLoading ? t.submitBusy : t.submit}</span>
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 max-w-[220px] mx-auto my-4 text-[#94a3b8] dark:text-[#64748b] text-[11px] font-mono tracking-[0.08em] before:flex-1 before:h-[1px] before:bg-[#e2e8f0] dark:before:bg-[#1e293b] after:flex-1 after:h-[1px] after:bg-[#e2e8f0] dark:after:bg-[#1e293b]">
          {t.divider}
        </div>

        {/* SSO Action */}
        <button
          type="button"
          onClick={onSsoClick}
          className="block mx-auto text-[14px] font-bold text-[#1d4ed8] dark:text-[#60a5fa] hover:underline bg-transparent border-0 cursor-pointer p-0 transition-colors"
        >
          {t.sso}
        </button>
      </div>

      {/* Technical Footer */}
      <footer className="mt-8 lg:absolute lg:bottom-6 left-0 right-0 text-center font-mono text-[11px] font-bold tracking-[0.1em] text-[#94a3b8] dark:text-[#64748b]">
        <span>NOC TOPOLOGY v0.4 · {t.ftEnv} </span>
        <span className="text-[#f59e0b] font-extrabold">TEST</span>
        <span> · {t.ftSupport}</span>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-xl max-w-md w-full p-6 border border-[#e2e8f0] dark:border-[#1e293b] animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0f172a] dark:text-[#f8fafc] m-0">
              {t.forgotModalTitle}
            </h3>
            <p className="mt-3 text-sm text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
              {t.forgotModalDesc}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="h-9 px-4 rounded-lg bg-[#0f172a] dark:bg-[#1e293b] hover:bg-[#1e293b] dark:hover:bg-[#334155] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {t.forgotModalClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
