# AlbionCodex Master Document

**Version:** 1.0
**Date:** 2026-01-27
**Purpose:** Unified reference for all AI systems working on this project

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Data Pipeline](#3-data-pipeline)
4. [Core Calculators](#4-core-calculators)
5. [Feature Modules](#5-feature-modules)
6. [State Management](#6-state-management)
7. [Integration Points](#7-integration-points)
8. [Data Provenance](#8-data-provenance)
9. [Known Gaps & TODOs](#9-known-gaps--todos)
10. [Optimization Recommendations](#10-optimization-recommendations)

---

## 1. Project Overview

AlbionCodex is a comprehensive toolkit for Albion Online players, providing:
- **Build Planner** - Create and save equipment loadouts with damage calculations
- **Crafting Calculator** - Profit analysis with real-time market prices
- **Market Browser** - Live prices from Albion Online Data Project
- **Destiny Board** - Character progression tracking (IP and Focus calculations)
- **Damage Calculator** - Spell damage analysis with resistance profiles

### Directory Structure

```
albion-codex/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── build/              # Build planner page
│   │   ├── craft/              # Crafting calculator
│   │   ├── market/             # Market browser
│   │   ├── destiny-board/      # Destiny board UI
│   │   ├── pvp/                # PvP analysis
│   │   ├── calculator/         # General calculator
│   │   ├── heart-runs/         # Heart run calculator
│   │   └── api/                # API routes (market, gold, killboard)
│   ├── components/             # React components
│   │   ├── DestinyBoard/       # Destiny board components
│   │   └── crafting/           # Crafting components
│   ├── lib/                    # Core logic
│   │   ├── calculators/        # IP and Focus calculators
│   │   ├── combat/damage/      # Damage calculator
│   │   ├── crafting/           # Crafting logic
│   │   └── data/generated/     # Generated JSON indexes
│   ├── stores/                 # Zustand state stores
│   ├── hooks/                  # Custom React hooks
│   ├── constants/              # Game constants
│   ├── types/                  # TypeScript definitions
│   └── data/                   # Static data files
│       └── formatted/          # ao-bin-dumps formatted data
├── scripts/                    # Data generation scripts
├── data/                       # Raw dump files
│   ├── spells.xml
│   └── localization.xml
└── public/                     # Static assets
```

---

## 2. Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 14.2.5 |
| Language | TypeScript | 5.x |
| UI | React | 18.x |
| Styling | TailwindCSS | 3.4 |
| State | Zustand | 4.5.4 |
| Data Fetching | SWR | 2.2.5 |
| Tables | TanStack Table | 8.20.5 |
| Charts | Recharts | 2.12.7 |
| XML Parsing | xml2js | 0.6.2 |
| HTTP | Axios | 1.7.2 |

### Build Commands

```bash
npm run dev          # Development (fetches data + runs Next.js)
npm run build        # Production build (fetches data + builds)
npm run fetch-data   # Fetch raw dumps from ao-bin-dumps
npm run gen:items    # Generate items index
npm run gen:data     # Generate spell/weapon indexes
npm run gen:crafting # Generate crafting data
```

---

## 3. Data Pipeline

### 3.1 Data Sources

| Source | URL | Files | Purpose |
|--------|-----|-------|---------|
| ao-bin-dumps | github.com/ao-data/ao-bin-dumps | items.xml, spells.xml, localization.xml, progressiontables.xml | Raw game data |
| ao-bin-dumps/formatted | .../formatted | items.json, world.json | Pre-processed JSON |
| Albion Data Project | albion-online-data.com | API | Live market prices |

### 3.2 Data Flow

```
ao-bin-dumps (GitHub)
        │
        ▼
┌───────────────────┐
│ fetch-albion-data │ ←── npm run fetch-data
└───────────────────┘
        │
        ▼
┌───────────────────────────────────────────┐
│ Raw Files                                 │
│ ├── data/ao-bin-dumps/items.xml          │
│ ├── data/ao-bin-dumps/spells.xml         │
│ ├── data/spells.xml                      │
│ ├── data/localization.xml                │
│ └── src/data/formatted/items.json        │
└───────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────┐
│ Generation Scripts                        │
│ ├── generate-items-index.ts              │
│ ├── generateAlbionIndexes.ts             │
│ └── generate-crafting-data.ts            │
└───────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────┐
│ Generated Indexes                         │
│ ├── src/lib/data/generated/              │
│ │   ├── itemsIndex.json (780KB)          │
│ │   ├── spellsIndex.json (1MB)           │
│ │   ├── weaponSpellPoolsResolved.json    │
│ │   └── spellDisplayNames.json           │
│ └── data/generated/heart-items.json      │
└───────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────┐
│ Runtime Consumers                         │
│ ├── Build Planner (itemsIndex.json)      │
│ ├── Damage Calculator (spellsIndex.json) │
│ ├── Market Tool (itemsIndex.json)        │
│ └── Crafting (crafting data)             │
└───────────────────────────────────────────┘
```

### 3.3 Generated Data Structure

**itemsIndex.json** - Key fields per item:
```typescript
{
  id: string              // "T4_MAIN_SWORD"
  slotType: string        // "weapon" | "offhand" | "head" | "chest" | "shoes" | etc.
  hands: string           // "1h" | "2h"
  abilityPower: number    // 120 (default for most weapons)
  baseItemPower: number   // 700 (T4), 800 (T5), etc.
  weight: number          // kg
  attackDamage: number    // base auto-attack damage
  attackType: string      // "melee" | "ranged"
  craftingSpellList: {...}
}
```

**spellsIndex.json** - Key fields per spell:
```typescript
{
  id: string              // "SPELL_Q_BROADSWORD"
  components: DamagePacket[]  // damage packets for calculation
}

interface DamagePacket {
  label: string           // "Heroic Strike"
  base: number            // base damage value
  damageType: "physical" | "magic" | "true"
  count: number           // hit count
  interval?: number       // ms between hits
  aoeBonusPerTarget?: number  // AOE scaling
}
```

---

## 4. Core Calculators

### 4.1 IP Calculator

**Location:** `src/lib/calculators/ip-calculator.ts`

**Purpose:** Calculate total Item Power including Destiny Board bonuses

**Formula:**
```
Total IP = Base IP
         + Mastery IP (level × 0.2)
         + Spec Unique IP (level × 2.0)
         + Spec Mutual IP (Σ all specs × mutual_rate)
         + Mastery Modifier Bonus (destiny_board_total × tier_modifier)
```

**Mastery Modifier by Tier:**
| Tier | Modifier |
|------|----------|
| T1-T4 | 0% |
| T5 | 5% |
| T6 | 10% |
| T7 | 15% |
| T8 | 20% |

**Mutual IP Rates:**
| Equipment Type | Rate |
|---------------|------|
| Armor/Weapon Simple | 0.2 |
| Offhand Simple (Shield/Torch/Tome) | **0.6** (3× multiplier!) |
| Artifact/Royal/Avalonian | 0.1 |

**Example Calculation (T5 Knight Boots):**
```
Base IP: 800
Mastery (100): 100 × 0.2 = 20
Spec Unique (32): 32 × 2.0 = 64
Spec Mutual: 63×0.2 + 61×0.2 + 30×0.1 = 27.8
Destiny Board Total: 20 + 64 + 27.8 = 111.8
Mastery Modifier (5%): 111.8 × 0.05 = 5.59
FINAL IP: 800 + 111.8 + 5.59 ≈ 924 ✓
```

### 4.2 Focus Calculator

**Location:** `src/lib/calculators/focus-calculator.ts`

**Purpose:** Calculate focus costs with FCE (Focus Cost Efficiency) reduction

**Formula:**
```
Actual Cost = Base Cost / (2 ^ (Total FCE / 10,000))
```

**FCE Halving Threshold:** Every 10,000 FCE halves focus cost
- 0 FCE: 100% cost
- 10,000 FCE: 50% cost
- 20,000 FCE: 25% cost
- 30,000 FCE: 12.5% cost
- 40,000 FCE: 6.25% cost

**FCE Sources:**
| Source | FCE at Level 100 |
|--------|------------------|
| Mastery | 3,000 |
| Simple Spec Unique | 25,000 |
| Simple Spec Mutual | 3,000 |
| Artifact Spec Mutual | 1,500 |

### 4.3 Damage Calculator

**Location:** `src/lib/combat/damage/damageCalculator.ts`

**Purpose:** Calculate spell damage accounting for IP, ability power, and resistances

**Formula:**
```
damage = base × (AP/100) × (PowerFactor ^ (IP/100)) × mitigation × abilityBonus × aoe
```

**Power Factors:**
| Weapon Type | Factor |
|-------------|--------|
| 1-handed | 1.0825 |
| 2-handed | 1.0918 |

**Mitigation:**
```
mitigation = 100 / (100 + resistance)
```

---

## 5. Feature Modules

### 5.1 Build Planner

**Location:** `src/app/build/page.tsx`

**Features:**
- 9 equipment slots (weapon, offhand, head, chest, shoes, cape, mount, food, potion)
- Item selection with tier/quality filtering
- Quality bonuses (Normal +0, Good +20, Outstanding +40, Excellent +60, Masterpiece +100)
- Damage rotation calculator integration
- Build saving/loading (localStorage via Zustand)
- Community builds presets
- Manual IP override option

**Data Flow:**
```
itemsIndex.json → BuildPage → BuildSlot components
                      ↓
               DamageRotation → damageCalculator.ts
                      ↓
               spellsIndex.json
```

### 5.2 Crafting Calculator

**Location:** `src/app/craft/page.tsx`

**Features:**
- 3000+ craftable items
- Enchantment level selection (0-4)
- Quality selection (Normal to Masterpiece)
- Material cost calculation with RRR (Return Rate Multiplier)
- Station fee calculation
- Multi-city price comparison
- Hideout presets with building bonuses
- Journal profit calculation
- Price history charts
- Focus usage toggle

**RRR Sources:**
- City bonuses (varies by item type)
- Hideout building tier (0-35%)
- Food bonus
- Focus usage (doubles RRR, capped at 50%)

### 5.3 Market Browser

**Location:** `src/app/market/page.tsx`

**Features:**
- Live prices from Albion Data Project API
- Filtering by tier, enchantment, slot, category, quality, city
- Sorting by name, tier, price, volume
- Favorites system
- Item detail modal with price breakdown
- Character spec integration (IP Calculator dropdown)

**API Integration:**
```
/api/market/route.ts → albion-online-data.com
                    → Returns: { itemId, city, quality, sellPriceMin, buyPriceMax, timestamp }
```

### 5.4 Destiny Board

**Location:** `src/app/destiny-board/page.tsx`

**Components:**
- `DestinyBoardManager` - Main container
- `CharacterSelector` - Create/switch characters
- `MasteryTree` - Left sidebar mastery list
- `SpecializationPanel` - Spec levels editor
- `IPCalculatorPanel` - IP calculation display
- `FocusCalculatorPanel` - FCE calculation display

**Data Model:**
```typescript
interface CharacterSheet {
  id: string
  name: string
  masteries: Record<string, number>      // masteryId → level (0-100)
  specializations: Record<string, number> // specId → level (0-120)
  createdAt: string
  updatedAt: string
}
```

---

## 6. State Management

### 6.1 Zustand Stores

| Store | Location | Purpose | Persistence |
|-------|----------|---------|-------------|
| `useBuilds` | `stores/builds.ts` | Build loadouts | localStorage |
| `useCraftingStore` | `stores/crafting.ts` | Crafting settings | localStorage |
| `useDestinyBoardStore` | `stores/destinyBoardStore.ts` | Character specs | localStorage |
| `useCharacterSync` | `stores/characterSync.ts` | Synced characters | localStorage |
| `useMarketServerStore` | `stores/marketServer.ts` | Market preferences | localStorage |
| `useThemeStore` | `stores/theme.ts` | Dark/light mode | localStorage |
| `useCharacters` | `stores/characters.ts` | Character data | localStorage |

### 6.2 Custom Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useMarketData` | `hooks/useMarketData.ts` | Fetch market prices |
| `useCraftingMarketPrices` | `hooks/useCraftingMarketPrices.ts` | Crafting prices |
| `useCharacterSpecs` | `hooks/useCharacterSpecs.ts` | Character spec data |
| `useFavorites` | `hooks/useFavorites.ts` | Favorite items |
| `useGoldPrice` | `hooks/useGoldPrice.ts` | Gold/silver rates |
| `useKillboard` | `hooks/useKillboard.ts` | Killboard data |

---

## 7. Integration Points

### 7.1 Current Integration Status

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT STATE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────┐     ┌───────────────┐     ┌────────────┐   │
│  │ Destiny   │     │    Build      │     │  Damage    │   │
│  │ Board     │     │   Planner     │────▶│ Calculator │   │
│  │           │     │               │     │            │   │
│  └───────────┘     └───────────────┘     └────────────┘   │
│       │                    │                    ▲          │
│       │                    │                    │          │
│       │            ┌───────▼────────┐          │          │
│       │            │  itemsIndex    │──────────┘          │
│       │            │  spellsIndex   │                     │
│       │            └────────────────┘                     │
│       │                    ▲                               │
│       ▼                    │                               │
│  ┌───────────┐     ┌───────┴────────┐     ┌────────────┐ │
│  │ IP Calc   │     │    Market      │     │  Crafting  │ │
│  │ (unused)  │     │    Browser     │     │ Calculator │ │
│  │           │     │                │     │            │ │
│  └───────────┘     └────────────────┘     └────────────┘ │
│                                                           │
│  Legend:                                                  │
│  ────▶ = Data flows                                       │
│  [box] = Module                                           │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Integration Opportunities

1. **Destiny Board → Build Planner**
   - Currently: Build uses base IP from itemsIndex
   - Opportunity: Use `calculateItemIP()` with character specs for true IP

2. **Destiny Board → Market Browser**
   - Currently: Market shows base item stats
   - Opportunity: "View with my specs" toggle to show computed IP

3. **Destiny Board → Crafting Calculator**
   - Currently: Crafting uses hardcoded RRR
   - Opportunity: Use `calculateFocusCost()` with character specs

4. **Build Panel API**
   - `BuildPanel.tsx` already calls `/api/ip` endpoint
   - This integration exists but needs mastery data to work fully

---

## 8. Data Provenance

### 8.1 Source Mapping

| Data | Source | File | Confidence |
|------|--------|------|------------|
| Item names | ao-bin-dumps | formatted/items.json | HIGH |
| Base IP | ao-bin-dumps | itemsIndex.json (derived) | HIGH |
| Spell damage | ao-bin-dumps | spells.xml → spellsIndex.json | HIGH |
| Fame tables | ao-bin-dumps | progressiontables.xml | HIGH |
| Market prices | Albion Data Project | API | HIGH |
| Mastery IP rate | Wiki + In-game | Constants | HIGH |
| Spec IP rates | Wiki + In-game | Constants | HIGH |
| Mastery modifier | Wiki + In-game | Constants | HIGH |
| Focus costs | Wiki | Constants | MEDIUM |
| Quality bonuses | Wiki + In-game | Constants | HIGH |
| RRR values | Wiki | Calculations | MEDIUM |

### 8.2 Constants Location

**File:** `src/constants/albion-constants.ts`

Contains:
- `MASTERY_MODIFIER_BY_TIER` - T5=5%, T6=10%, T7=15%, T8=20%
- `BASE_IP_BY_TIER` - T4=700, +100 per tier
- `MUTUAL_IP_RATES` - Including 0.6 for offhand simple
- `IP_CONSTANTS` - 0.2/level mastery, 2.0/level spec unique
- `FOCUS_COSTS` - Base costs by activity and tier
- `FCE_CONSTANTS` - 10,000 halving threshold
- `QUALITY_CONSTANTS` - Quality chance rates
- `PROGRESSION_CONSTANTS` - Level caps, elite level costs
- `PREMIUM_CONSTANTS` - 10k focus/day, 30k cap

---

## 9. Known Gaps & TODOs

### 9.1 Critical Gaps

| Gap | Impact | Solution |
|-----|--------|----------|
| Mastery data definitions | Destiny Board MasteryTree needs mastery definitions | Create `src/data/masteries/` with combat/crafting/gathering definitions |
| Destiny Board ↔ Build integration | Build doesn't use character specs for IP | Wire `calculateItemIP()` into BuildPanel |
| Focus calculator unused | Crafting doesn't use FCE calculation | Wire `calculateFocusCost()` into crafting page |

### 9.2 Feature TODOs

1. **Mastery Definitions** - Define all 23+ combat masteries with their specs
2. **Crafting/Refining/Farming/Gathering Trees** - Define non-combat masteries
3. **"With My Specs" Toggle** - Market tool IP display
4. **Character Import** - Import specs from game or external source
5. **Build Sharing** - Generate shareable build links
6. **Notification System** - Price alerts for market tool

### 9.3 Technical Debt

1. Multiple enchantment parsers (3 different implementations)
2. IP calculation exists in BuildPage and IP calculator separately
3. Some constants duplicated between files
4. Missing error boundaries on API failures

---

## 10. Optimization Recommendations

### 10.1 Architecture Optimizations

#### A. Unify IP Calculation

**Problem:** IP is calculated in multiple places with slightly different logic.

**Current:**
- `src/app/build/page.tsx` lines 101-106 (simple base + quality)
- `src/components/BuildPanel.tsx` lines 115-127 (similar)
- `src/lib/calculators/ip-calculator.ts` (full calculation with destiny board)

**Solution:**
```typescript
// Create unified hook
// src/hooks/useItemIP.ts
export function useItemIP(itemId: string, characterId?: string) {
  const { activeCharacter } = useDestinyBoardStore()
  const item = itemsIndex[itemId]

  if (!characterId || !activeCharacter) {
    // Return base IP only
    return {
      ip: item?.baseItemPower ?? 0,
      breakdown: null,
      hasDestinyBoard: false
    }
  }

  // Return full calculation with destiny board
  return calculateItemIP({
    itemTier: parseTier(itemId),
    // ... full params
  })
}
```

#### B. Consolidate Enchantment Parsing

**Problem:** 3 different enchantment parsing implementations.

**Files:**
- `src/lib/crafting/calculations.ts` lines 70-93
- `src/app/build/page.tsx` lines 55-57
- `src/app/market/page.tsx` lines 17-53

**Solution:**
```typescript
// src/lib/utils/parseItemId.ts
export function parseItemId(itemId: string): {
  baseId: string
  tier: number
  enchantment: number
} {
  // Single implementation used everywhere
}
```

### 10.2 Performance Optimizations

#### A. Lazy Load Heavy Data

**Problem:** itemsIndex.json (780KB) and spellsIndex.json (1MB) loaded upfront.

**Solution:**
```typescript
// Dynamic import with React.lazy
const itemsIndex = await import('@/lib/data/generated/itemsIndex.json')

// Or use SWR with local file
const { data: items } = useSWR('/data/itemsIndex.json', fetcher)
```

#### B. Virtualize Long Lists

**Current:** Market browser renders up to 200 items.

**Already Using:** react-window and react-virtualized-auto-sizer are in dependencies.

**Ensure:** All long lists use virtualization.

### 10.3 Code Quality Optimizations

#### A. Extract Shared Types

Create `src/types/shared.ts`:
```typescript
export type ItemQuality = 'normal' | 'good' | 'outstanding' | 'excellent' | 'masterpiece'
export type Tier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type Enchantment = 0 | 1 | 2 | 3 | 4
export type SlotType = 'weapon' | 'offhand' | 'head' | 'chest' | 'shoes' | 'cape' | 'mount' | 'food' | 'potion'
```

#### B. Create Calculation Contracts

Define clear interfaces for calculator inputs/outputs:
```typescript
// src/types/calculators.ts
export interface IPCalculatorInput {
  itemId: string
  characterId?: string
  quality?: ItemQuality
}

export interface IPCalculatorOutput {
  baseIP: number
  destinyBoardIP: number
  masteryModifierBonus: number
  finalIP: number
  breakdown: IPBreakdown
}
```

### 10.4 Feature Optimizations

#### A. Destiny Board Integration Priority

1. **Phase 1:** Create mastery definitions
   - Define 23 combat masteries
   - Define specs for each mastery
   - Export `ALL_MASTERIES`, `getMastery()`, `getSpecsForMastery()`

2. **Phase 2:** Wire Build Planner
   - Replace base IP with `useItemIP()` hook
   - Show IP breakdown tooltip
   - Add "Optimize" button

3. **Phase 3:** Wire Crafting
   - Add character selector to crafting page
   - Use `calculateFocusCost()` for RRR display
   - Show FCE breakdown

#### B. Market Tool Enhancement

Add "With My Specs" feature:
```typescript
// In MarketTable.tsx
const [showWithSpecs, setShowWithSpecs] = useState(false)

const displayIP = showWithSpecs
  ? calculateItemIP({ itemId, characterId }).finalIP
  : item.baseItemPower
```

### 10.5 Data Pipeline Optimizations

#### A. Add Data Validation

Create validation script:
```typescript
// scripts/validate-data.ts
- Verify all items have baseItemPower
- Verify all weapons have spells in spellsIndex
- Verify tier parsing is consistent
- Report missing localization
```

#### B. Incremental Updates

Instead of full refetch:
```typescript
// Check last-modified header
// Only download if changed
// Cache ETags
```

---

## Summary

AlbionCodex is a well-structured project with:
- Solid data pipeline from ao-bin-dumps
- Correct calculation formulas (IP, Focus, Damage)
- Comprehensive UI for Build/Craft/Market
- Proper state management with Zustand

**Key Integration Needed:**
1. Connect Destiny Board to Build Planner
2. Connect Destiny Board to Crafting
3. Create mastery/spec definitions
4. Add "With My Specs" to Market

**Estimated Effort:** 1-2 weeks for full integration
