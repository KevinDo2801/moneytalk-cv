import React, { useState } from 'react';
import './FloatingActionButton.css';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick();
  };

  return (
    <button
      className={`fab-button animate-bounce-in ${className}`}
      style={{ animationDelay: '0.8s' }}
      onClick={handleClick}
    >
      <i className="fas fa-plus"></i>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="animate-ripple"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: '20px',
            height: '20px',
          }}
        />
      ))}
    </button>
  );
};

export default FloatingActionButton;
