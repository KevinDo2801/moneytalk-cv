import React from 'react';
import type { TimeFilter } from '../types/financial';
import { TIME_FILTERS } from '../types/financial';
import './TimeFilter.css';

interface TimeFilterProps {
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
  className?: string;
}

const TimeFilterComponent: React.FC<TimeFilterProps> = ({ 
  activeFilter, 
  onFilterChange, 
  className = '' 
}) => {
  const getCurrentDateText = (): string => {
    const now = new Date();
    
    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}/${day}`;
    };
    
    switch (activeFilter) {
      case 'day':
        const dayOptions: Intl.DateTimeFormatOptions = { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        };
        return now.toLocaleDateString('en-US', dayOptions);
        
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 6); // Last 7 days including today
        return `${formatDate(startOfWeek)} - ${formatDate(now)}`;
        
      case 'month':
        const startOfMonth = new Date(now);
        startOfMonth.setDate(now.getDate() - 29); // Last 30 days including today
        return `${formatDate(startOfMonth)} - ${formatDate(now)}`;
        
      case 'year':
        return now.getFullYear().toString();
        
      case 'period':
        const periodOptions: Intl.DateTimeFormatOptions = { 
          month: 'long', 
          year: 'numeric' 
        };
        return now.toLocaleDateString('en-US', periodOptions);
        
      default:
        const defaultOptions: Intl.DateTimeFormatOptions = { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        };
        return now.toLocaleDateString('en-US', defaultOptions);
    }
  };

  return (
    <div className={`time-filter-container animate-fade-in ${className}`} style={{ animationDelay: '0.2s' }}>
      <div className="time-filter-buttons">
        {TIME_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`time-filter-button ${
              activeFilter === filter.value ? 'filter-active' : ''
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="current-date">
        {getCurrentDateText()}
      </div>
    </div>
  );
};

export default TimeFilterComponent;
