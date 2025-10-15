import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { SignupFormData } from '../types/auth'

interface SignupFormProps {
  onSwitchToLogin: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { signUp, error, clearError } = useAuth()
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Partial<SignupFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

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

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | null => {
    if (password.length === 0) return null
    if (password.length < 6) return 'weak'
    if (password.length < 10) return 'medium'
    return 'strong'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    
    // Update password strength
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value))
    }
    
    // Clear error for this field
    if (errors[name as keyof SignupFormData]) {
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
    const newErrors: Partial<SignupFormData> = {}
    
    if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeTerms) {
      // Show alert for terms agreement instead of field error
      alert('You must agree to the Terms of Service and Privacy Policy')
      return
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await signUp(formData)
      if (error) {
        // Error is handled by the auth context
        console.error('Signup error:', error)
      } else {
        // Success - switch to login form
        onSwitchToLogin()
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          agreeTerms: false,
        })
        setPasswordStrength(null)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setIsSubmitting(false)
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
        <label className="form-label" htmlFor="signupName">
          Full Name
        </label>
        <input
          type="text"
          className={`form-input ${errors.fullName ? 'error' : ''}`}
          id="signupName"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />
        {errors.fullName && (
          <div className="error-message">{errors.fullName}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="signupEmail">
          Email
        </label>
        <input
          type="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          id="signupEmail"
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
        <label className="form-label" htmlFor="signupPassword">
          Password
        </label>
        <input
          type="password"
          className={`form-input ${errors.password ? 'error' : ''}`}
          id="signupPassword"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        {formData.password && (
          <div className="password-strength">
            <div className={`password-strength-bar ${passwordStrength || ''}`}></div>
          </div>
        )}
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          type="password"
          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
        {errors.confirmPassword && (
          <div className="error-message">{errors.confirmPassword}</div>
        )}
      </div>

      <div className="terms-group">
        <div className="terms-checkbox">
          <input
            type="checkbox"
            className="checkbox-input"
            id="agreeTerms"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
            required
          />
          <label className="terms-label" htmlFor="agreeTerms">
            I agree to the{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.agreeTerms && (
          <div className="error-message">{errors.agreeTerms}</div>
        )}
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="spinner"></div>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>


      {/* Auth Switch */}
      <div className="auth-switch">
        Already have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
          Login
        </a>
      </div>
    </form>
  )
}

export default SignupForm
