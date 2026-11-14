import type { Meta, StoryObj } from '@storybook/react-vite'
import { SignupForm } from './SignupForm'

const meta: Meta<typeof SignupForm> = {
  title: 'Auth/SignupForm',
  component: SignupForm,
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
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    errors: {},
    isLoading: false,
    isSuccess: false,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onLoginClick: () => {},
  },
}

export const WithValidationErrors: Story = {
  args: {
    formData: {
      fullName: '',
      email: 'invalid-email',
      password: '123',
      confirmPassword: '456',
    },
    errors: {
      fullName: 'Vui lòng nhập họ và tên.',
      email: 'Định dạng email không hợp lệ.',
      password: 'Mật khẩu phải có ít nhất 8 ký tự.',
      confirmPassword: 'Mật khẩu xác nhận không khớp.',
    },
    isLoading: false,
    isSuccess: false,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onLoginClick: () => {},
  },
}

export const Loading: Story = {
  args: {
    formData: {
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@corp.internal',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    },
    errors: {},
    isLoading: true,
    isSuccess: false,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onLoginClick: () => {},
  },
}

export const SuccessState: Story = {
  args: {
    formData: {
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@corp.internal',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    },
    errors: {},
    isLoading: false,
    isSuccess: true,
    locale: 'vi',
    onChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onLoginClick: () => {},
  },
}
