import React, { useState, useEffect } from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';
import TimeFilterComponent from './TimeFilter';
import ExpenseChart from './ExpenseChart';
import TransactionList from './TransactionList';
import { useFinancialData } from '../hooks/use-financial-data';
import { useAuth } from '../contexts/AuthContext';
import type { 
  TabType, 
  TimeFilter
} from '../types/financial';
import './FinancialDashboard.css';

interface FinancialDashboardProps {
  onMicrophoneClick?: () => void;
  isConnected?: boolean;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ onMicrophoneClick, isConnected }) => {
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('month');
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFinancialData(activeFilter);

  // Refetch data when user logs in
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const currentData = activeTab === 'expenses' ? data.expenses : data.income;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (filter: TimeFilter) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            fontSize: '18px',
            color: '#666'
          }}>
            Loading your financial data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            fontSize: '18px',
            color: '#e74c3c'
          }}>
            <div>Error loading data: {error}</div>
            <button 
              onClick={refetch}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <Header balance={currentData.balance} />
        
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
        
        <TimeFilterComponent 
          activeFilter={activeFilter} 
          onFilterChange={handleFilterChange} 
        />
        
        <ExpenseChart 
          data={currentData.chartData} 
          total={currentData.total}
          onMicrophoneClick={onMicrophoneClick}
          isConnected={isConnected}
        />
        
        <TransactionList categories={currentData.categories} />
      </div>
    </div>
  );
};

export default FinancialDashboard;
