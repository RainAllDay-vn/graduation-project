import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoginForm } from './LoginForm'

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    formData: {
      email: '',
      password: '',
      rememberMe: false,
    },
    errors: {},
    isLoading: false,
    isSuccess: false,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onSignupClick: () => {},
    onSsoClick: () => {},
  },
}

export const ValidationErrors: Story = {
  args: {
    formData: {
      email: '',
      password: '',
      rememberMe: false,
    },
    errors: {
      email: 'Vui lòng nhập tên đăng nhập hoặc email',
      password: 'Vui lòng nhập mật khẩu',
    },
    isLoading: false,
    isSuccess: false,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onSignupClick: () => {},
    onSsoClick: () => {},
  },
}

export const AuthenticationFailed: Story = {
  args: {
    formData: {
      email: 'engineer@corp.internal',
      password: 'WrongPassword!',
      rememberMe: true,
    },
    errors: {
      general: 'Tài khoản hoặc mật khẩu không đúng.',
    },
    isLoading: false,
    isSuccess: false,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onSignupClick: () => {},
    onSsoClick: () => {},
  },
}

export const Loading: Story = {
  args: {
    formData: {
      email: 'engineer@corp.internal',
      password: 'CorrectPassword123!',
      rememberMe: true,
    },
    errors: {},
    isLoading: true,
    isSuccess: false,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onSignupClick: () => {},
    onSsoClick: () => {},
  },
}

export const SuccessState: Story = {
  args: {
    formData: {
      email: 'engineer@corp.internal',
      password: 'CorrectPassword123!',
      rememberMe: true,
    },
    errors: {},
    isLoading: false,
    isSuccess: true,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onSignupClick: () => {},
    onSsoClick: () => {},
  },
}

export const English: Story = {
  args: {
    formData: {
      email: '',
      password: '',
      rememberMe: true,
    },
    errors: {},
    isLoading: false,
    isSuccess: false,
    locale: 'en',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onSignupClick: () => {},
    onSsoClick: () => {},
  },
}
