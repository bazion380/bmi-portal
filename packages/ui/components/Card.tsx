import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div 
      className={`glass-panel hover-lift ${className}`} 
      style={{ padding: '24px', ...style }}
    >
      {children}
    </div>
  );
};
