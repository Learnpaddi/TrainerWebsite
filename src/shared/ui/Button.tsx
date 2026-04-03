import React from 'react'
import { ButtonHTMLAttributes } from 'react'
import { theme } from '../styles/theme'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
  className?: string
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 rounded-3xl shadow-lg active:shadow-inner'

  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 text-white hover:shadow-3xl hover:-translate-y-1 hover:from-indigo-600 hover:to-purple-700 shadow-2xl',
    secondary: 'bg-white/80 text-gray-900 border-2 border-gray-200/50 backdrop-blur-sm hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:-translate-y-1',
    ghost: 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-100/50 px-4 py-2',
    destructive: 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-3xl hover:-translate-y-1 hover:from-rose-600',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-5 text-xl',
  }

  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed !shadow-none !translate-y-0' : ''

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}

export { Button }

