import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { LoginFormData } from '../types/auth'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { signIn, error, clearError } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Clear errors when component mounts
  useEffect(() => {
    clearError()
    setErrors({})
  }, []) // Clear errors when component mounts

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    
    // Clear error for this field
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    clearError()

    // Validate form
    const newErrors: Partial<LoginFormData> = {}
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await signIn(formData)
      if (error) {
        // Error is handled by the auth context
        console.error('Login error:', error)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!formData.email || !validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address first' })
      return
    }

    try {
      // This would be implemented in the auth context
      alert('Password reset email sent! (This is a demo)')
    } catch (err) {
      console.error('Password reset error:', err)
    }
  }

  return (
    <form 
      className="auth-form"
      onSubmit={handleSubmit}
    >
      {/* Global error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="loginEmail">
          Email
        </label>
        <input
          type="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          id="loginEmail"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        {errors.email && (
          <div className="error-message">{errors.email}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="loginPassword">
          Password
        </label>
        <input
          type="password"
          className={`form-input ${errors.password ? 'error' : ''}`}
          id="loginPassword"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
      </div>

      <div className="checkbox-group">
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            className="checkbox-input"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
          />
          <label className="checkbox-label" htmlFor="rememberMe">
            Remember me
          </label>
        </div>
        <a href="#" className="forgot-link" onClick={handleForgotPassword}>
          Forgot password?
        </a>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="spinner"></div>
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>


      {/* Auth Switch */}
      <div className="auth-switch">
        Don't have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>
          Sign up
        </a>
      </div>
    </form>
  )
}

export default LoginForm
