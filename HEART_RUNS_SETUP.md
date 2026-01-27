# Heart Runs (Faction Trade Missions) Setup Guide

## Overview

The Heart Runs feature enables players to calculate profitability of faction trade missions in Albion Online. This setup extracts faction tokens, hearts, and heart fragments from the Albion game data.

## Components Created

### 1. Data Extraction Script
**File:** [scripts/extract-heart-items.ts](scripts/extract-heart-items.ts)

Extracts faction items from `items.xml` and generates organized JSON:
- Searches for faction tokens: `T1_FACTION_(FACTION)_TOKEN_*`
- Searches for heart items containing "HEART"
- Searches for fragments containing "FRAGMENT"
- Groups results by faction (FOREST, HIGHLAND, STEPPE, MOUNTAIN, SWAMP, CAERLEON)
- Provides allMatches fallback for unassigned items

**Usage:**
```bash
npm run extract:heart-items
```

**Output:** `data/generated/heart-items.json`

### 2. PowerShell Fallback Script
**File:** [scripts/extract-heart-items.ps1](scripts/extract-heart-items.ps1)

Alternative extraction script for Windows environments:
```powershell
.\scripts\extract-heart-items.ps1
# or with custom path:
.\scripts\extract-heart-items.ps1 -ItemsXmlPath "C:\path\to\items.xml"
```

### 3. React Calculator Component
**File:** [src/components/HeartRunsCalculator.tsx](src/components/HeartRunsCalculator.tsx)

Interactive UI component with:
- Faction selector (FOREST, HIGHLAND, STEPPE, MOUNTAIN, SWAMP, CAERLEON)
- Token unit cost input
- Dynamic profit calculation
- Item price overrides
- Expandable run details

**Features:**
- Real-time profit calculations
- Price customization per item
- Organized by faction
- Quick stats summary

## Generated Data Structure

The output JSON has this structure:

```json
{
  "factions": {
    "FOREST": {
      "tokenIds": ["T1_FACTION_FOREST_TOKEN_1"],
      "heartIds": [...],
      "fragmentIds": [...]
    },
    // ... other factions
  },
  "allMatches": {
    "tokenIds": [...],
    "heartLikeIds": [...],
    "fragmentLikeIds": [...]
  }
}
```

## Current Status

✅ **Extracted Successfully:**
- All 6 faction tokens (FOREST, HIGHLAND, STEPPE, MOUNTAIN, SWAMP, CAERLEON)
- Total items scanned: 5,836 unique items from items.xml

⏳ **To Complete:**
1. Add hearts/fragments to items.xml or identify correct naming patterns
2. Load `heart-items.json` into HeartRunsCalculator component
3. Integrate with market price APIs for real-time pricing
4. Add reward configuration data (which items/quantities for each run)
5. Integrate with character tracking system for profitability per character

## Integration Steps

### Step 1: Import the Data in Your Page/Component
```typescript
import heartItems from '@/data/generated/heart-items.json';
import { HeartRunsCalculator } from '@/components/HeartRunsCalculator';

export default function HeartRunsPage() {
  return (
    <div>
      <HeartRunsCalculator />
      {/* Use heartItems data to populate calculator */}
    </div>
  );
}
```

### Step 2: Load Runs into Calculator
The component expects a `runs` state. Populate it with:
- Run ID
- Faction (from heartItems)
- Token cost (number)
- Required items (itemId, quantity, optional unitCost)
- Rewards (itemId, quantity, optional unitValue)

### Step 3: Connect to Market Data
Update `handlePriceOverride` to:
- Fetch live prices from Albion market APIs
- Auto-populate unit costs/values
- Update calculations automatically

### Step 4: Enhance with Rewards
Add a rewards configuration system that defines:
- Which items are rewarded for each mission
- Quantities per mission
- Reputation rewards

## API Endpoints to Integrate

Suggested market data sources:
- Albion Data Project: `https://www.albion-online-data.com/api/v2/`
- AlbionOnline2D: Similar market data endpoints
- Custom backend with caching

## File Locations

```
scripts/
  ├── extract-heart-items.ts          # Main extraction logic
  └── extract-heart-items.ps1         # PowerShell fallback

src/
  ├── components/
  │   └── HeartRunsCalculator.tsx      # UI component
  └── data/
      └── generated/
          └── heart-items.json         # Generated data

src/app/
  └── heartruns/                       # (optional page to add)
      └── page.tsx
```

## Troubleshooting

**Issue:** No items extracted
- Check internet connection for remote fetch
- Verify items.xml is valid XML
- Check patterns match actual item names in game

**Issue:** Items found but no hearts/fragments
- Current game data may use different naming
- Check actual item names in Albion Online
- Update HEART_PATTERN and FRAGMENT_PATTERN in script

**Issue:** Calculator shows empty runs
- Verify heart-items.json was generated
- Load it in component state
- Populate with mission reward configurations

## Next Steps

1. ✅ Extract faction tokens - DONE
2. ⏳ Identify hearts/fragments in game data
3. ⏳ Create rewards configuration data
4. ⏳ Integrate market price API
5. ⏳ Complete UI with real data
6. ⏳ Add historical profit tracking
