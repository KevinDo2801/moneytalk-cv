import React from 'react'

export interface User {
  id: string
  email?: string
  full_name?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface SignupFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

export interface AuthContextType extends AuthState {
  signUp: (data: SignupFormData) => Promise<{ error: any }>
  signIn: (data: LoginFormData) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  clearError: () => void
}

export type AuthProviderProps = {
  children: React.ReactNode
}
