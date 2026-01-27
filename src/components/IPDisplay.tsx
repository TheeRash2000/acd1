'use client'

type IPCalcResult = {
  itemId: string
  baseIP: number
  totalIP: number
  qualityBonus: number
  masteryLevel: number
  specLevel: number
  masteryBonus: number
  masteryModifierBonus: number
  crossSpecContribution: number
  siblingSpecsUsed: Array<{ spec: string; level: number; contribution: number }>
}

type IPDisplayProps = {
  result: IPCalcResult
  showDebug?: boolean
}

export function IPDisplay({ result, showDebug = false }: IPDisplayProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border-light bg-surface-light p-4 text-sm dark:border-border dark:bg-surface">
      <div className="flex items-center justify-between">
        <span className="text-text1-light dark:text-text1">Total IP</span>
        <span className="text-lg font-semibold text-accent">{Math.round(result.totalIP)}</span>
      </div>
      <div className="grid gap-1 text-xs text-muted-light dark:text-muted">
        <div>Base IP: {result.baseIP}</div>
        <div>Quality Bonus: {result.qualityBonus.toFixed(1)}</div>
        <div>Mastery Level: {result.masteryLevel}</div>
        <div>Spec Level: {result.specLevel}</div>
        <div>Cross Spec: {result.crossSpecContribution.toFixed(1)}</div>
        <div>Mastery Bonus: {result.masteryBonus.toFixed(1)}</div>
        <div>Mastery Modifier Bonus: {result.masteryModifierBonus.toFixed(1)}</div>
      </div>
      {showDebug && result.siblingSpecsUsed.length > 0 && (
        <div className="grid gap-2 text-xs text-muted-light dark:text-muted">
          <div className="font-semibold text-text1-light dark:text-text1">Sibling Specs Used</div>
          <div className="grid gap-1">
            {result.siblingSpecsUsed.map((entry) => (
              <div key={entry.spec} className="flex items-center justify-between">
                <span>{entry.spec}</span>
                <span>{entry.level} (+{entry.contribution.toFixed(1)})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
