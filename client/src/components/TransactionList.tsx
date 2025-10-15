import React from 'react';
import type { TransactionCategory } from '../types/financial';
import './TransactionList.css';

interface TransactionListProps {
  categories: TransactionCategory[];
  className?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  categories, 
  className = '' 
}) => {
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`transaction-list-container animate-fade-in ${className}`} style={{ animationDelay: '0.4s' }}>
      {categories.map((category, index) => (
        <div
          key={category.id}
          className="transaction-item animate-slide-in"
          style={{ animationDelay: `${0.5 + index * 0.1}s` }}
        >
          <div 
            className={`category-icon ${category.name.toLowerCase()}`}
          >
            <i className={category.icon}></i>
          </div>
          <div className="category-details">
            <div className="category-name">{category.name}</div>
            <div className="category-percentage">{category.percentage}%</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color 
                }}
              ></div>
            </div>
          </div>
          <div className="category-amount">{formatAmount(category.amount)}</div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
