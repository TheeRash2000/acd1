'use client'

import {
  calculateProfitMargin,
  calculateROI,
  calculateStationFeePer100,
  calculateProfitWithPer100Fee,
} from '@/lib/crafting/calculations'

interface Props {
  buyPrice?: number
  sellPrice: number
  materialCost: number
  stationFeePer100: number
  itemTier: number
  quantity: number
  journalBonus?: number
}

function formatPrice(price: number) {
  if (!Number.isFinite(price)) return '--'
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(2)}k`
  return price.toFixed(0)
}

export function ProfitDisplay({
  buyPrice,
  sellPrice,
  materialCost,
  stationFeePer100,
  itemTier,
  quantity,
  journalBonus = 0,
}: Props) {
  const totalRevenue = (sellPrice + journalBonus) * quantity
  const totalCost = materialCost * quantity
  const stationFeeEach = calculateStationFeePer100(stationFeePer100, itemTier)
  const stationFeeAmount = stationFeeEach * quantity
  const profit = totalRevenue - totalCost - stationFeeAmount
  const margin = calculateProfitMargin(sellPrice + journalBonus, materialCost + stationFeeEach)
  const roi = calculateROI(profit, totalCost)
  const safeMargin = Number.isFinite(margin) ? margin : 0
  const safeRoi = Number.isFinite(roi) ? roi : 0

  return (
    <div className="grid gap-3 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
      <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">Profit</div>
      <div className="grid gap-1">
        <div className="flex justify-between">
          <span>Sell Price (each)</span>
          <span>{formatPrice(sellPrice)}</span>
        </div>
        {buyPrice !== undefined && (
          <div className="flex justify-between">
            <span>Buy Price (each)</span>
            <span>{formatPrice(buyPrice)}</span>
          </div>
        )}
        {journalBonus > 0 && (
          <div className="flex justify-between">
            <span>Journal Bonus (each)</span>
            <span>{formatPrice(journalBonus)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Material Cost (each)</span>
          <span>{formatPrice(materialCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>Station Fee</span>
          <span>{formatPrice(stationFeeAmount)}</span>
        </div>
        <div className="flex justify-between text-[11px] text-muted-light dark:text-muted">
          <span>Fee per craft</span>
          <span>{formatPrice(stationFeeEach)}</span>
        </div>
      </div>
      <div className="border-t border-border/40 pt-2">
        <div className="flex justify-between text-base font-semibold">
          <span>TOTAL PROFIT</span>
          <span className={profit >= 0 ? 'text-emerald-300' : 'text-red-300'}>
            {profit >= 0 ? '+' : ''}
            {formatPrice(profit)}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted-light dark:text-muted">
          <span>Margin</span>
          <span>{safeMargin.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-[11px] text-muted-light dark:text-muted">
          <span>ROI</span>
          <span>{safeRoi.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
