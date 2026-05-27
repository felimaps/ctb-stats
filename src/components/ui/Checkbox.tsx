interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

export function Checkbox({ label, checked, onChange, description }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-1 min-h-[44px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-ctb-border text-ctb-primary focus:ring-ctb-primary/30"
      />
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-ctb-dark group-hover:text-ctb-primary">
          {label}
        </span>
        {description && (
          <p className="text-xs text-ctb-muted mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </label>
  )
}
