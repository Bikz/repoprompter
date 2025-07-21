import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { InputStyleProps } from '@common/types'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, InputStyleProps {
  label?: string
  helperText?: string
  errorMessage?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  error = false,
  label,
  helperText,
  errorMessage,
  className,
  ...props
}, ref) => {
  const baseStyles = 'w-full border transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-tertiary'
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary focus:border-primary',
    search: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-primary focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-gray-800'
  }
  
  const sizes = {
    sm: 'h-8 px-2 text-xs rounded-md',
    md: 'h-10 px-3 text-sm rounded-lg',
    lg: 'h-12 px-4 text-base rounded-lg'
  }
  
  const errorStyles = error 
    ? 'border-danger focus:ring-danger focus:border-danger' 
    : ''
  
  const inputClasses = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    errorStyles,
    className
  )
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary mb-1">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      
      {(helperText || errorMessage) && (
        <p className={cn(
          'mt-1 text-xs',
          error ? 'text-danger' : 'text-secondary'
        )}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'