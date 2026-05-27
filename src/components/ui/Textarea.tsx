import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({
  label,
  error,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-ctb-dark">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full rounded-xl border border-ctb-border bg-white px-4 py-3 text-base text-ctb-dark placeholder:text-ctb-muted/60 focus:border-ctb-primary focus:outline-none focus:ring-2 focus:ring-ctb-primary/15 resize-none ${error ? 'border-red-400' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
