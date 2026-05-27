import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ctb-dark">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-ctb-border bg-white px-4 py-3 text-base text-ctb-dark placeholder:text-ctb-muted/60 transition-all focus:border-ctb-primary focus:outline-none focus:ring-2 focus:ring-ctb-primary/15 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
