import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ctb-dark">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-xl border border-ctb-border bg-white px-4 py-3 text-base text-ctb-dark focus:border-ctb-primary focus:outline-none focus:ring-2 focus:ring-ctb-primary/15 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
