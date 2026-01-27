# Heart Runs Quick Reference

## One-Command Setup
```bash
npm run extract:heart-items
```
Generates: `data/generated/heart-items.json` with all faction tokens

## Files Created

| File | Purpose | Size |
|------|---------|------|
| [scripts/extract-heart-items.ts](scripts/extract-heart-items.ts) | Main extraction logic (TypeScript) | 6.6 KB |
| [scripts/extract-heart-items.ps1](scripts/extract-heart-items.ps1) | PowerShell fallback | 2.2 KB |
| [src/components/HeartRunsCalculator.tsx](src/components/HeartRunsCalculator.tsx) | React calculator UI | 9.6 KB |
| [data/generated/heart-items.json](data/generated/heart-items.json) | Generated faction data | 1.1 KB |
| [HEART_RUNS_SETUP.md](HEART_RUNS_SETUP.md) | Complete setup guide | 5.0 KB |
| [HEART_RUNS_SUMMARY.md](HEART_RUNS_SUMMARY.md) | Implementation summary | 6.2 KB |

## Extraction Results
- **Items Scanned:** 5,836 unique items
- **Faction Tokens Found:** 6 (all factions)
- **Hearts Found:** 0 (not in current naming pattern)
- **Fragments Found:** 0 (not in current naming pattern)

## Token IDs Extracted
```json
{
  "FOREST": "T1_FACTION_FOREST_TOKEN_1",
  "HIGHLAND": "T1_FACTION_HIGHLAND_TOKEN_1",
  "STEPPE": "T1_FACTION_STEPPE_TOKEN_1",
  "MOUNTAIN": "T1_FACTION_MOUNTAIN_TOKEN_1",
  "SWAMP": "T1_FACTION_SWAMP_TOKEN_1",
  "CAERLEON": "T1_FACTION_CAERLEON_TOKEN_1"
}
```

## Quick Integration

### Import & Use
```typescript
import HeartRunsCalculator from '@/components/HeartRunsCalculator';
import heartItems from '@/data/generated/heart-items.json';

export default function HeartRunsPage() {
  // heartItems contains all extracted faction data
  return <HeartRunsCalculator />;
}
```

### Update npm Script (Already Done)
```json
{
  "scripts": {
    "extract:heart-items": "tsx scripts/extract-heart-items.ts"
  }
}
```

## Component Features
- ✅ Faction selector (all 6 factions)
- ✅ Token unit cost input
- ✅ Quick stats display
- ✅ Runs list view
- ✅ Expandable run details
- ✅ Price override inputs
- ✅ Real-time profit calculation
- ✅ Responsive design
- ✅ Dark theme with Albion aesthetics

## Regex Patterns Used
```typescript
TOKEN:     T1_FACTION_(FOREST|HIGHLAND|STEPPE|MOUNTAIN|SWAMP|CAERLEON)_TOKEN_\d+
HEARTS:    .*HEART.*
FRAGMENTS: .*FRAGMENT.*
```

## FAQ

**Q: How do I re-extract data?**
A: Run `npm run extract:heart-items` anytime to refresh heart-items.json

**Q: What if hearts/fragments aren't found?**
A: Verify their actual names in Albion Online and update the regex patterns in the script

**Q: Can I use local items.xml?**
A: Yes, place it at `src/data/items.xml` and the script will use it instead of downloading

**Q: How do I use the PowerShell script?**
A: Run `.\scripts\extract-heart-items.ps1` in Windows PowerShell

**Q: What market price API should I use?**
A: Recommended: https://www.albion-online-data.com/api/v2/

## Next Integration Steps
1. Load heart-items.json into component state
2. Define mission reward configurations
3. Connect to market price API
4. Populate runs with actual mission data
5. Add character-specific tracking

---
Created: 2025-01-23 | Status: ✅ Ready for Integration
