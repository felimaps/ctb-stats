import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  fullWidth?: boolean
}

const variants = {
  primary:
    'bg-ctb-primary hover:bg-ctb-primary-hover text-white shadow-sm shadow-ctb-primary/15',
  secondary:
    'bg-white border border-ctb-secondary/60 text-ctb-primary hover:bg-ctb-light hover:border-ctb-primary/40',
  danger: 'bg-red-400 hover:bg-red-500 text-white shadow-sm',
  ghost: 'text-ctb-muted hover:bg-ctb-light hover:text-ctb-primary',
  accent:
    'bg-ctb-accent text-ctb-dark hover:brightness-[1.02] font-semibold shadow-sm',
}

const sizes = {
  sm: 'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
  md: 'px-5 py-3 text-sm rounded-xl min-h-[44px]',
  lg: 'px-6 py-3.5 text-base rounded-2xl min-h-[48px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ctb-primary/25 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
