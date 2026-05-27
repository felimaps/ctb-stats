interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

export function Checkbox({ label, checked, onChange, description }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-court-600 focus:ring-court-500"
      />
      <div>
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
          {label}
        </span>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  )
}
