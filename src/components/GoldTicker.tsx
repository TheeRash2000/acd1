'use client'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useGoldPrice } from '@/hooks/useGoldPrice'
import { useMarketServer } from '@/stores/marketServer'

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value))

export function GoldTicker() {
  const { server, setServer } = useMarketServer()
  const { rate, change24h, isLoading, error, refresh } = useGoldPrice(server)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (rate !== undefined) {
      setLastUpdated(new Date())
    }
  }, [rate])

  if (error) {
    console.error('GoldTicker API error:', error)
    return (
      <div className="text-xs text-danger" aria-live="polite">
        Gold price unavailable
      </div>
    )
  }

  if (isLoading || rate === undefined) {
    return (
      <div className="text-xs text-muted-light dark:text-muted" aria-live="polite">
        Loading gold...
      </div>
    )
  }

  const change = change24h ?? 0
  const isUp = change > 0
  const isDown = change < 0

  // Premium calculation: 3750 gold/month -> weekly requirement
  const monthlyGoldNeeded = 3750
  const weeklyGoldNeeded = monthlyGoldNeeded / 4
  const weeklySilverNeeded = weeklyGoldNeeded * rate

  return (
    <div className="flex items-center gap-4 text-xs" aria-live="polite">
      <select
        value={server}
        onChange={(e) => setServer(e.target.value as any)}
        className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs text-text1-light dark:border-border dark:bg-bg dark:text-text1"
      >
        <option value="europe">EU</option>
        <option value="america">US</option>
        <option value="asia">Asia</option>
      </select>

      <span className="font-semibold text-accent">Gold price: {formatNumber(rate)} silver</span>

      <span
        className={clsx(
          'flex items-center gap-1',
          isUp && 'text-success',
          isDown && 'text-danger',
          !isUp && !isDown && 'text-muted-light dark:text-muted'
        )}
      >
        <span>{isUp ? 'up' : isDown ? 'down' : 'flat'}</span>
        <span>{formatNumber(Math.abs(change))} (24h)</span>
      </span>

      <span className="text-muted-light dark:text-muted">
        Premium: {formatNumber(weeklySilverNeeded)} silver/week
      </span>

      <button
        type="button"
        onClick={() => refresh()}
        className="btn-secondary text-xs"
      >
        Refresh
      </button>

      <span className="text-muted-light dark:text-muted">
        {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-US')}` : 'Updated --'}
      </span>
    </div>
  )
}
