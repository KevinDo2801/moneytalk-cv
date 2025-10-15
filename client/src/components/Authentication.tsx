import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import './Auth.css'

const Authentication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const { loading } = useAuth()

  // This effect is not needed since the parent component handles the redirect logic
  // Removing to prevent potential infinite re-renders

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in-up">
          <div className="auth-logo">
            <h1>MoneyTalk</h1>
          </div>
          <div className="spinner" style={{ margin: '2rem auto' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card fade-in-up">
        {/* Logo Section */}
        <div className="auth-logo">
          <h1>MoneyTalk</h1>
        </div>

        {/* Tab Navigation */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {activeTab === 'login' && (
          <LoginForm 
            onSwitchToSignup={() => setActiveTab('signup')}
          />
        )}
        {activeTab === 'signup' && (
          <SignupForm 
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}
      </div>
    </div>
  )
}

export default Authentication
