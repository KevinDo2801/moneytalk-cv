import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { ChartData } from '../types/financial';
import './ExpenseChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  data: ChartData;
  total: number;
  className?: string;
  onMicrophoneClick?: () => void;
  isConnected?: boolean;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ 
  data, 
  total, 
  className = '',
  onMicrophoneClick,
  isConnected = false
}) => {
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    animation: {
      animateRotate: true,
      duration: 1000,
    },
  };

  const hasData = data.labels.length > 0 && data.datasets[0].data.length > 0;
  
  // Create chart data with gray circle when no data
  const chartData = hasData ? data : {
    labels: [''],
    datasets: [{
      data: [1],
      backgroundColor: ['#B7B7B7'],
      borderWidth: 0,
      cutout: '70%',
    }],
  };

  return (
    <div className={`chart-container animate-scale-up ${className}`} style={{ animationDelay: '0.3s' }}>
      <div className="card-container">
        <Doughnut data={chartData} options={options} />
        <div className="chart-center-text">
          <div 
            className="voice-chat-icon" 
            onClick={onMicrophoneClick} 
            style={{ 
              cursor: 'pointer',
              filter: isConnected 
                ? 'drop-shadow(0px 2px 4px rgba(255, 68, 68, 0.3))' 
                : 'drop-shadow(0px 2px 4px rgba(55, 199, 138, 0.3))'
            }}
          >
            <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1C13.1 1 14 1.9 14 3V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V3C10 1.9 10.9 1 12 1Z" fill={isConnected ? "#FF4444" : "#37C78A"}/>
              <path d="M19 10V12C19 15.9 15.9 19 12 19C8.1 19 5 15.9 5 12V10H7V12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12V10H19Z" fill={isConnected ? "#FF4444" : "#37C78A"}/>
              <path d="M11 22H13V24H11V22Z" fill={isConnected ? "#FF4444" : "#37C78A"}/>
              <path d="M7 22H9V24H7V22Z" fill={isConnected ? "#FF4444" : "#37C78A"}/>
              <path d="M15 22H17V24H15V22Z" fill={isConnected ? "#FF4444" : "#37C78A"}/>
            </svg>
          </div>
          <div className="font-bold">{formatAmount(total)}</div>
          <div className="font-normal">Total</div>
        </div>
        <div className="chat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="#666666"/>
          </svg>
        </div>
        <div className="camera-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5M7.43 4.93L6.5 6H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2.5l-.93-.93A2 2 0 0 0 15.5 4h-7a2 2 0 0 0-1.07.93z" fill="#666666"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
