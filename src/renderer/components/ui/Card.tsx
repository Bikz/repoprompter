import React from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  role?: string
  tabIndex?: number
}

export function Card({ children, className, hover = false, onClick, role, tabIndex, ...props }: CardProps) {
  const isInteractive = onClick || hover
  
  return (
    <div 
      className={cn(
        'glass-surface rounded-lg transition-all duration-200',
        hover && 'hover:shadow-lg hover:translate-y-[-2px] cursor-pointer',
        isInteractive && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
        className
      )}
      onClick={onClick}
      role={role || (isInteractive ? 'button' : undefined)}
      tabIndex={tabIndex !== undefined ? tabIndex : (isInteractive ? 0 : undefined)}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-surface', className)}>
      <h3 className="text-lg font-semibold text-primary">{children}</h3>
    </div>
  )
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-surface', className)}>
      {children}
    </div>
  )
}