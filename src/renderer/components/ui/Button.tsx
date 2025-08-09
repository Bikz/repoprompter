import React from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  className,
  children,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 active:opacity-80 focus-visible:ring-primary/50',
    secondary: 'glass-button text-primary hover:bg-white/20 focus-visible:ring-primary/50',
    danger: 'bg-danger text-white hover:opacity-90 active:opacity-80 focus-visible:ring-danger/50',
    success: 'bg-success text-white hover:opacity-90 active:opacity-80 focus-visible:ring-success/50',
    ghost: 'text-primary hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-primary/50'
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
    md: 'h-10 px-4 text-sm rounded-lg gap-2',
    lg: 'h-12 px-6 text-base rounded-lg gap-2.5'
  }
  
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}