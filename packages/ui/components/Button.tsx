import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  style, 
  ...props 
}) => {
  
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    ...style
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.875rem' },
    md: { padding: '10px 18px', fontSize: '1rem' },
    lg: { padding: '14px 24px', fontSize: '1.125rem' }
  }[size];

  // For a real app, you'd use classes linked to the global.css vars, 
  // but we can map them directly here for component encapsulation without a CSS module loader
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'white',
      boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)'
    },
    secondary: {
      backgroundColor: 'var(--secondary)',
      color: 'white',
      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: 'white'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--surface-border)'
    }
  };

  return (
    <button 
      style={{ ...baseStyles, ...sizeStyles, ...variants[variant] }} 
      onMouseOver={(e) => {
        if(variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseOut={(e) => {
        if(variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary)';
        e.currentTarget.style.transform = 'none';
      }}
      {...props}
    >
      {children}
    </button>
  );
};
