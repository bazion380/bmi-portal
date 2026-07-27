import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ children, style, ...props }) => {
  return (
    <button 
      style={{ 
        padding: '10px 20px', 
        backgroundColor: '#0056b3', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontSize: '1rem',
        ...style 
      }} 
      {...props}
    >
      {children}
    </button>
  );
};
