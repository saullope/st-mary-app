import React from 'react';
import styles from '../../styles/components/Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  shape?: 'default' | 'rounded' | 'square' | 'pill';
  loading?: boolean;
  block?: boolean;
  iconOnly?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  shape = 'default',
  loading = false,
  block = false,
  iconOnly = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    shape !== 'default' && styles[`button--${shape}`],
    loading && styles['button--loading'],
    block && styles['button--block'],
    iconOnly && styles['button--icon-only'],
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  );
};

