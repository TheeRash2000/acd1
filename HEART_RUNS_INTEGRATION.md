# Heart Runs Integration - Complete Delivery

## ✅ Full Integration Complete

All Heart Runs functionality is now fully implemented and integrated into your Albion Codex application.

### 🎯 New Features

#### 1. **Heart Runs Page** 
- **Route:** `/heart-runs`
- **File:** [src/app/heart-runs/page.tsx](src/app/heart-runs/page.tsx)
- Access via navbar or direct URL
- Responsive layout with info cards

#### 2. **Mission System**
- **File:** [src/data/heart-runs-missions.ts](src/data/heart-runs-missions.ts)
- **12 Missions:** 2 tiers × 6 factions
- Each mission includes:
  - Required items with quantities
  - Faction tokens needed
  - Reward packages (gold, loot bags, resources)
  - Reputation gains
  - Time estimates
  - Difficulty levels

#### 3. **Live Market Integration**
- **File:** [src/hooks/useHeartRunMarketPrices.ts](src/hooks/useHeartRunMarketPrices.ts)
- Fetches real prices from Albion Data API (`https://www.albion-online-data.com/api/v2/`)
- 5-minute cache duration (auto-refreshes)
- Caching to avoid rate limits
- Error handling with fallback prices

#### 4. **Interactive Calculator**
- **File:** [src/components/HeartRunsCalculator.tsx](src/components/HeartRunsCalculator.tsx)
- **Full Features:**
  - Faction selector
  - Dynamic token pricing
  - Real-time profit calculations
  - Price override inputs (simulate scenarios)
  - Cost & reward breakdown
  - Efficiency percentages
  - Market update timestamps
  - Loading/error states

### 📁 File Structure

```
src/
├── app/
│   └── heart-runs/
│       └── page.tsx                          ✅ NEW - Main page
├── components/
│   ├── HeartRunsCalculator.tsx              ✅ UPDATED - Fully integrated
│   └── Navbar.tsx                           ✅ UPDATED - Added link
├── hooks/
│   └── useHeartRunMarketPrices.ts           ✅ NEW - Market API hook
└── data/
    └── heart-runs-missions.ts                ✅ NEW - Mission definitions
    └── generated/
        └── heart-items.json                  ✅ Auto-generated

scripts/
├── extract-heart-items.ts                   ✅ Extraction tool
└── extract-heart-items.ps1                  ✅ PowerShell fallback

package.json                                  ✅ UPDATED - Build pipeline
```

## 🚀 How to Use

### Start the Application
```bash
npm run dev
```
- Automatically extracts heart items data on startup
- Fetches market prices when Heart Runs page loads
- Serves at `http://localhost:3001`

### Access Heart Runs
1. Navigate to `/heart-runs` in your browser
2. Or click "Heart Runs" in the navbar
3. Select a faction
4. Adjust token pricing
5. View mission profitability

### Customize Prices
- Override individual item prices in the calculator
- See profit updates in real-time
- Test different market scenarios

## 📊 Mission Data

### Available Missions by Faction

| Faction | Tier 1 | Tier 2 | Items | Tokens | Rewards |
|---------|--------|--------|-------|--------|---------|
| FOREST | Basic Trade Route | Standard Trade Mission | Wood, Fiber | 1-2 | Gold + Resources |
| HIGHLAND | Highland Supply Run | Mountain Trade Mission | Stone, Ore | 1-2 | Gold + Loot Bags |
| STEPPE | Steppe Commerce | Nomadic Trade Route | Hide, Ore | 1-2 | Gold + Cloth |
| MOUNTAIN | Mountain Supply | Fortress Trade Mission | Stone, Wood | 1-2 | Gold + Planks |
| SWAMP | Swamp Trade | Bog Commerce | Fiber, Hide | 1-2 | Gold + Cloth |
| CAERLEON | Royal Trade Charter | Royal Supply Mission | Mixed | 1-2 | Gold + Silver Tokens |

### Mission Rewards
- **Gold:** Direct silver reward
- **Loot Bags:** ~4,000 silver each (estimated)
- **Resources:** Wood, Ore, Fiber, Hide, Stone, Cloth
- **Reputation:** 100-350 per mission
- **Time:** 15-30 minutes per run

## 🔌 Integration Points

### Market Data
The calculator automatically fetches prices from:
- **API:** `https://www.albion-online-data.com/api/v2/stats/prices`
- **Locations:** Caerleon (main trading hub)
- **Items:** All required and reward items (except GOLD)
- **Update:** Every 5 minutes

### Faction System
Ready to integrate with existing character/faction system:
- Track reputation per character
- Calculate total faction standing
- Unlock higher-tier missions
- Store mission history

### Price Data
The useHeartRunMarketPrices hook provides:
- Live buy/sell prices
- Bid/ask spreads
- Last update timestamp
- Error handling
- Loading states

## ⚙️ Build Pipeline

Updated `package.json` scripts:

```bash
npm run dev        # Runs extraction + dev server
npm run build      # Runs extraction + production build
npm run extract:heart-items  # Extract data only
```

Extraction runs **automatically** before:
- Local development (`npm run dev`)
- Production build (`npm run build`)

## 🎨 UI/UX Features

### Responsive Design
- Mobile-friendly layout
- Collapsible mission details
- Scrollable mission list
- Touch-friendly inputs

### Visual Feedback
- Profit color coding (green = profitable, red = loss)
- Difficulty badges (Easy/Normal/Hard)
- Loading indicators
- Error messages
- Last update timestamps

### User Interactions
- Click to expand mission details
- Type to override prices
- Instant calculation updates
- Real-time efficiency percentages

## 🔍 Data Extraction

Heart items are extracted on every build:

```bash
npm run extract:heart-items
```

**Results:**
- 5,836 items scanned
- 6 faction tokens extracted
- Organized by faction
- Deterministic, sorted output
- Version control friendly

## 📈 Profitability Calculation

```
Total Cost = (Required Items × Market Price) + (Tokens × Token Price)
Total Reward = (Reward Items × Market Price) + Direct Gold + Estimated Loot Value
Profit = Total Reward - Total Cost
Efficiency % = (Profit / Total Cost) × 100
```

## 🛠️ Customization

### Add New Missions
Edit [src/data/heart-runs-missions.ts](src/data/heart-runs-missions.ts):

```typescript
{
  id: 'faction_tier_name',
  faction: 'FACTION_NAME',
  tier: 2,
  name: 'Mission Name',
  description: 'Mission description',
  tokensRequired: 2,
  requiredItems: [
    { itemId: 'T4_ITEM', quantity: 100 }
  ],
  rewards: [
    { itemId: 'GOLD', quantity: 5500 },
    { itemId: 'T2_MATERIAL', quantity: 50 }
  ],
  reputation: 250,
  estimatedTime: 25,
  difficulty: 'normal'
}
```

### Adjust Token Prices
Default: 1,500 silver
- Change in calculator UI: Dynamically adjusts
- Change default in code: Edit `useState` in HeartRunsCalculator.tsx

### Update Market API
Change API endpoint in [src/hooks/useHeartRunMarketPrices.ts](src/hooks/useHeartRunMarketPrices.ts):

```typescript
const ALBION_DATA_API = 'https://your-api-url/stats/prices';
```

## 🚨 Troubleshooting

### Market prices not loading
- Check internet connection
- Verify Albion Data API is accessible
- Check browser console for errors
- Market data is optional; calculator works with manual prices

### Mission data not showing
- Verify [src/data/heart-runs-missions.ts](src/data/heart-runs-missions.ts) exists
- Check browser console for import errors
- Clear Next.js cache: `rm -rf .next`

### Extraction fails
- Verify internet connection (remote fetch)
- Check `src/data/items.xml` exists (local source)
- Run: `npm run extract:heart-items` manually
- Check file permissions

## ✨ What's Included

✅ Full mission system with 12 missions (2 tiers × 6 factions)
✅ Real-time market price fetching
✅ Interactive profit calculator
✅ Price override capability
✅ Responsive, mobile-friendly UI
✅ Loading & error states
✅ Integration with navbar
✅ Automatic data extraction on build
✅ TypeScript types throughout
✅ Complete documentation

## 📚 Next Steps (Optional)

1. **Character Integration**
   - Store missions completed per character
   - Track total reputation earned
   - Calculate lifetime earnings

2. **Advanced Analytics**
   - Historical price tracking
   - Profit trend charts
   - Best time to run missions
   - ROI per faction

3. **Notifications**
   - Alert when prices spike
   - Suggest best missions
   - Track new missions

4. **Social Features**
   - Share profitable routes
   - Guild mission coordination
   - Leaderboards

## 📞 Support

All files are well-commented and use TypeScript for type safety. 

Key files:
- **Components:** [src/components/HeartRunsCalculator.tsx](src/components/HeartRunsCalculator.tsx)
- **Hooks:** [src/hooks/useHeartRunMarketPrices.ts](src/hooks/useHeartRunMarketPrices.ts)
- **Data:** [src/data/heart-runs-missions.ts](src/data/heart-runs-missions.ts)
- **Page:** [src/app/heart-runs/page.tsx](src/app/heart-runs/page.tsx)

---

**Status:** ✅ Complete and Production Ready
**Deployment:** Ready to run `npm run dev` or `npm run build`
**Access:** http://localhost:3001/heart-runs
