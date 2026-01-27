'use client'

interface Props {
  value: number
  onChange: (value: number) => void
  showCostImpact?: boolean
}

const enchantmentLabels = [
  '.0 (Normal)',
  '.1 (Uncommon)',
  '.2 (Rare)',
  '.3 (Epic)',
  '.4 (Legendary)',
]

const costMultipliers = [1.0, 1.5, 2.5, 5.0, 10.0]

export function EnchantmentSelector({ value, onChange, showCostImpact }: Props) {
  return (
    <div className="grid gap-1 text-xs">
      <label className="text-muted-light dark:text-muted">Enchantment Level</label>
      <select
        value={value}
        onChange={(event) => onChange(parseInt(event.target.value, 10))}
        className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
      >
        {enchantmentLabels.map((label, index) => (
          <option key={label} value={index}>
            {label}
          </option>
        ))}
      </select>
      {showCostImpact && (
        <div className="text-[11px] text-muted-light dark:text-muted">
          Material cost multiplier: {costMultipliers[value]}x
        </div>
      )}
    </div>
  )
}
