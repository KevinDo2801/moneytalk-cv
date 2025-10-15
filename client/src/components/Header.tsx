import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  balance: number;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ balance, className = '' }) => {
  const { signOut, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatBalance = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className={`header-container animate-fade-in ${className}`}>
        <div className="header-content">
        <div className="header-main-title">
          <div className="balance-label">BALANCE</div>
          <div className="balance-amount">{formatBalance(balance)}</div>
        </div>
        <div className="header-center-icon">
          <div className="user-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
          <button 
            className="hamburger-menu"
            onClick={toggleMenu}
            title="Menu"
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div className="menu-backdrop" onClick={closeMenu}></div>
      )}

      {/* Sliding Menu */}
      <div className={`sliding-menu ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="menu-header">
          <h3 className="menu-title">Menu</h3>
          <button className="menu-close" onClick={closeMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="menu-content">
          <div className="user-info">
            <div className="user-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="user-details">
              <div className="user-name">{user?.email?.split('@')[0] || 'User'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          
          <div className="menu-divider"></div>
          
          <button className="menu-logout" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
