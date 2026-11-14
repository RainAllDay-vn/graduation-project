import { apiClient } from './client'

export interface SignupRequest {
  fullName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export type UserRole = 'ENGINEER' | 'ADMIN' | 'OPERATOR'

export interface UserDetails {
  id: number
  fullName: string
  email: string
  role: UserRole
  createdAt: string
}

/**
 * Register a new engineer account.
 * Throws AxiosError with 409 Conflict if email is already registered.
 */
export async function signup(payload: SignupRequest): Promise<UserDetails> {
  const response = await apiClient.post<UserDetails>('/auth/signup', payload)
  return response.data
}

/**
 * Authenticate with email and password.
 */
export async function login(payload: LoginRequest): Promise<UserDetails> {
  const response = await apiClient.post<UserDetails>('/auth/login', payload)
  return response.data
}

/**
 * Invalidate current session.
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

/**
 * Get current authenticated user details.
 */
export async function getMe(): Promise<UserDetails> {
  const response = await apiClient.get<UserDetails>('/auth/me')
  return response.data
}
