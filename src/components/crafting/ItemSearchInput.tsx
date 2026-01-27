'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Item } from '@/lib/crafting/types'

interface Props {
  items: Item[]
  value: string
  onChange: (value: string) => void
  onSelect: (item: Item) => void
}

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function ItemSearchInput({ items, value, onChange, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounced = useDebounce(value, 200)

  const filteredItems = useMemo(() => {
    const trimmed = debounced.trim()
    if (!trimmed) return []
    const search = trimmed.toLowerCase()
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.item_id.toLowerCase().includes(search) ||
          item.base_item_id.toLowerCase().includes(search) ||
          item.subcategory.toLowerCase().includes(search)
      )
      .slice(0, 10)
  }, [items, debounced])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) setIsOpen(true)
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        event.preventDefault()
        if (filteredItems[highlightedIndex]) {
          onSelect(filteredItems[highlightedIndex])
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
      default:
        break
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <label className="text-xs text-muted-light dark:text-muted">Item Name</label>
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setIsOpen(true)
          setHighlightedIndex(0)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search for an item..."
        className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
      />
      {isOpen && filteredItems.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded border border-border-light bg-surface-light text-xs shadow-xl dark:border-border dark:bg-surface">
          {filteredItems.map((item, index) => (
            <button
              type="button"
              key={item.item_id}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-bg-light/60 dark:hover:bg-bg/60 ${
                index === highlightedIndex ? 'bg-bg-light/70 dark:bg-bg/70' : ''
              }`}
              onClick={() => {
                onSelect(item)
                setIsOpen(false)
              }}
            >
              <img
                src={`https://render.albiononline.com/v1/item/${item.item_id}.png`}
                alt={item.name}
                className="h-8 w-8 rounded"
              />
              <div className="flex-1">
                <div className="text-text1-light dark:text-text1">{item.name}</div>
                <div className="text-[11px] text-muted-light dark:text-muted">
                  T{item.tier}
                  {item.enchantment > 0 ? `.${item.enchantment}` : ''}
                  {item.is_artifact ? ' *' : ''}
                </div>
              </div>
              <span className="text-[11px] uppercase text-muted-light dark:text-muted">
                {item.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
