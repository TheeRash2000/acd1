'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Props {
  search: string
  setSearch: (search: string) => void
}

export function MarketSearch({ search, setSearch }: Props) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-muted-light dark:text-muted" />
      </div>
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-10 py-3 text-sm text-text1-light placeholder:text-muted-light dark:text-text1 dark:placeholder:text-muted"
        placeholder="Search items..."
      />
    </div>
  )
}
