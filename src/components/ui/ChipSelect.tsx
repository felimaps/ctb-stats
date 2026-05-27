interface ChipOption {
  value: string
  label: string
}

interface ChipSelectProps {
  label: string
  subtitle?: string
  options: ChipOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  variant?: 'humor' | 'corpo'
}

export function ChipSelect({
  label,
  subtitle,
  options,
  selected,
  onChange,
}: ChipSelectProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-sm font-medium text-ctb-dark">{label}</p>
        {subtitle && <p className="text-xs text-ctb-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                isActive
                  ? 'ctb-chip-active'
                  : 'border-ctb-border bg-white text-ctb-muted hover:border-ctb-primary/40 hover:bg-ctb-light/50'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
