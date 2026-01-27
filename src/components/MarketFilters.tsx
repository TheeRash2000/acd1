'use client'

interface FiltersState {
  tier: string
  enchant: string
  slot: string
  category: string
  quality: string
  city: string
}

interface Props {
  filters: FiltersState
  setFilters: (filters: FiltersState) => void
  categories: string[]
}

export function MarketFilters({ filters, setFilters, categories }: Props) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-text1-light dark:text-text1">Filters</h3>

      <div>
        <label className="mb-1 block text-xs text-muted-light dark:text-muted">Tier</label>
        <select
          value={filters.tier}
          onChange={(event) => setFilters({ ...filters, tier: event.target.value })}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text1-light dark:text-text1"
        >
          <option value="all">All Tiers</option>
          <option value="4">T4</option>
          <option value="5">T5</option>
          <option value="6">T6</option>
          <option value="7">T7</option>
          <option value="8">T8</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-light dark:text-muted">Enchant</label>
        <select
          value={filters.enchant}
          onChange={(event) => setFilters({ ...filters, enchant: event.target.value })}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text1-light dark:text-text1"
        >
          <option value="all">All Enchants</option>
          <option value="none">None</option>
          <option value="1">.1</option>
          <option value="2">.2</option>
          <option value="3">.3</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-light dark:text-muted">Slot</label>
        <select
          value={filters.slot}
          onChange={(event) => setFilters({ ...filters, slot: event.target.value })}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text1-light dark:text-text1"
        >
          <option value="all">All Slots</option>
          <option value="mainhand">Main Hand</option>
          <option value="offhand">Off Hand</option>
          <option value="head">Head</option>
          <option value="armor">Armor</option>
          <option value="shoes">Shoes</option>
          <option value="bag">Bag</option>
          <option value="cape">Cape</option>
          <option value="mount">Mount</option>
          <option value="food">Food</option>
          <option value="potion">Potion</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-light dark:text-muted">Category</label>
        <select
          value={filters.category}
          onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text1-light dark:text-text1"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-light dark:text-muted">Quality</label>
        <select
          value={filters.quality}
          onChange={(event) => setFilters({ ...filters, quality: event.target.value })}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text1-light dark:text-text1"
        >
          <option value="all">All Qualities</option>
          <option value="Normal">Normal</option>
          <option value="Good">Good</option>
          <option value="Outstanding">Outstanding</option>
          <option value="Excellent">Excellent</option>
          <option value="Masterpiece">Masterpiece</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-light dark:text-muted">City</label>
        <select
          value={filters.city}
          onChange={(event) => setFilters({ ...filters, city: event.target.value })}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text1-light dark:text-text1"
        >
          <option value="all">All Cities</option>
          <option value="Bridgewatch">Bridgewatch</option>
          <option value="Fort Sterling">Fort Sterling</option>
          <option value="Lymhurst">Lymhurst</option>
          <option value="Martlock">Martlock</option>
          <option value="Thetford">Thetford</option>
          <option value="Caerleon">Caerleon</option>
          <option value="Brecilien">Brecilien</option>
          <option value="Black Market">Black Market</option>
        </select>
      </div>
    </div>
  )
}
