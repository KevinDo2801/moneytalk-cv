import React from 'react';
import type { TabType } from '../types/financial';
import './TabNavigation.css';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  className = '' 
}) => {
  const tabs = [
    { id: 'expenses' as TabType, label: 'EXPENSES' },
    { id: 'income' as TabType, label: 'INCOME' },
  ];

  return (
    <div className={`tab-navigation animate-fade-in ${className}`} style={{ animationDelay: '0.1s' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${
            activeTab === tab.id ? 'tab-active' : 'tab-inactive'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
