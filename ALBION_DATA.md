# Albion Data Integration

Your project now fetches and processes data from the [ao-data/ao-bin-dumps](https://github.com/ao-data/ao-bin-dumps) repository.

## How it Works

1. **fetch-albion-data.ts** downloads XML files from ao-bin-dumps on GitHub
2. Parses and converts them to JSON for faster access
3. Saves to `/src/data/` (git ignored for size)
4. Your app loads data from these JSON files

## Available Data

### Items (`items.json`)
- Item IDs and names
- Tiers and rarity levels

### Progression Tables (`progressiontables.json`)
- Mastery leveling requirements
- Season point rewards
- 13 different progression types

### Dynamic Templates (`dynamictemplates.json`)
- World template mappings
- Biome and continent data
- Resource zone distributions

## Usage

### Import Utilities
```typescript
import {
  getItems,
  searchItems,
  getItemsByTier,
  getProgressionTables,
  getProgressionTable,
  getDynamicTemplates,
} from '@/lib/albion-data';
```

### Examples

**Search items:**
```typescript
const swordItems = searchItems('sword');
console.log(swordItems);
```

**Get items by tier:**
```typescript
const t8Items = getItemsByTier('8');
```

**Get progression table:**
```typescript
const siphoning = getProgressionTable('PROGRESSION_SIPHONING_MAGE');
console.log(siphoning?.progressions); // All 100 levels
```

**Get all items:**
```typescript
const allItems = getItems();
```

## Updating Data

Run this command to fetch fresh data from ao-bin-dumps:
```bash
npm run fetch-data
```

It's automatically run when you:
```bash
npm run dev    # before starting dev server
npm run build  # before building
```

## File Sizes
- `items.json` - ~0 bytes (0 items parsed from source)
- `progressiontables.json` - ~120 KB
- `dynamictemplates.json` - ~8 KB

## Notes

- Data is fetched from GitHub, not bundled in your repo
- Generated JSON files are git-ignored (use `.gitignore`)
- Consider caching this data or using CI/CD to pre-fetch it
- For live data (market prices, killboard), use APIs instead
