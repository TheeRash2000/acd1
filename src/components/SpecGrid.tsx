'use client'
import { useMemo, useState } from 'react'

type NodeTree = Record<string, any>

type SpecGridProps = {
  tree: NodeTree | string[]
  specs: Record<string, number>
  searchTerm: string
  colorClass: string
  displayNames?: Record<string, string>
  showId?: boolean
  resolveId?: (name: string) => string
  disabled?: boolean
  onChange: (nodeName: string, value: number) => void
  onBulkSet: (nodeNames: string[], value: number) => void
}

function filterTree(
  node: NodeTree | string[],
  query: string,
  displayNames: Record<string, string>
): NodeTree | string[] | null {
  if (!query) return node
  const lower = query.toLowerCase()
  if (Array.isArray(node)) {
    const matches = node.filter((item) => {
      const display = displayNames[item] ?? item
      return item.toLowerCase().includes(lower) || display.toLowerCase().includes(lower)
    })
    return matches.length ? matches : null
  }

  const result: NodeTree = {}
  for (const [key, value] of Object.entries(node)) {
    if (key.toLowerCase().includes(lower)) {
      result[key] = value
      continue
    }
    const filtered = filterTree(value as NodeTree | string[], query, displayNames)
    if (filtered) result[key] = filtered
  }
  return Object.keys(result).length ? result : null
}

function collectNodes(node: NodeTree | string[], acc: string[] = []) {
  if (Array.isArray(node)) {
    for (const item of node) acc.push(item)
    return acc
  }
  for (const value of Object.values(node)) {
    collectNodes(value as NodeTree | string[], acc)
  }
  return acc
}

export function SpecGrid({
  tree,
  specs,
  searchTerm,
  colorClass,
  displayNames = {},
  showId = false,
  resolveId,
  disabled = false,
  onChange,
  onBulkSet,
}: SpecGridProps) {
  const filteredTree = useMemo(
    () => filterTree(tree, searchTerm, displayNames),
    [tree, searchTerm, displayNames]
  )
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  if (!filteredTree) return <div className="text-sm text-muted-light dark:text-muted">No matches.</div>

  const toggle = (path: string) => {
    setOpenMap((prev) => ({ ...prev, [path]: !(prev[path] ?? true) }))
  }

  const renderNode = (node: NodeTree | string[], path: string, depth: number) => {
    if (Array.isArray(node)) {
      return (
        <div className={`grid gap-2 ${disabled ? 'opacity-60' : ''}`}>
          {node.map((name) => {
            const resolvedId = resolveId ? resolveId(name) : name
            const value = specs[resolvedId] ?? 0
            const displayName = displayNames[name] ?? name
            return (
              <div key={name} className="grid gap-2 rounded-md border border-border-light bg-bg-light p-3 dark:border-border dark:bg-bg">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid gap-1">
                    <div className="text-sm text-text1-light dark:text-text1">{displayName}</div>
                    {showId && (
                      <div className="text-xs text-muted-light dark:text-muted">{resolvedId}</div>
                    )}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={value}
                    onChange={(e) => onChange(resolvedId, Number(e.target.value))}
                    className="w-24 rounded border border-border-light bg-surface-light px-2 py-1 text-right text-sm text-text1-light dark:border-border dark:bg-surface dark:text-text1"
                    disabled={disabled}
                  />
                </div>
                <div className="h-2 rounded-full bg-border-light dark:bg-border">
                  <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div className="grid gap-4">
        {Object.entries(node).map(([key, value]) => {
          const childPath = `${path}/${key}`
          const isOpen = openMap[childPath] ?? true
          const leafNodes = collectNodes(value as NodeTree | string[])
          return (
            <div key={childPath} className={`rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface ${disabled ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggle(childPath)}
                  className="flex items-center gap-2 text-left text-sm font-semibold text-text1-light dark:text-text1"
                >
                  <span className="text-xs">{isOpen ? 'v' : '>'}</span>
                  <span className="uppercase tracking-wide text-muted-light dark:text-muted">{key}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onBulkSet(leafNodes, 100)}
                  className="btn-secondary text-[11px]"
                  disabled={disabled}
                >
                  Set all in section to 100 (testing)
                </button>
              </div>
              {isOpen && <div className="mt-4">{renderNode(value as NodeTree | string[], childPath, depth + 1)}</div>}
            </div>
          )
        })}
      </div>
    )
  }

  return <div className="grid gap-4">{renderNode(filteredTree, 'root', 0)}</div>
}
