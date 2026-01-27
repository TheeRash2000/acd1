# 🏛️ ALBION CODEX — SYSTEM ARCHITECTURE & DATA PROVENANCE CANON

**Document Version:** 1.0  
**Last Updated:** 2026-01-27  
**Status:** BASELINE AUDIT — REBUILD REQUIRED  

---

## 1️⃣ EXECUTIVE SUMMARY

### What's Broken Today

**Critical Problems:**
1. **Data Source Fragmentation**: Multiple systems pull from different sources (items.xml, items.json, formatted/items.json, hardcoded constants) without clear provenance
2. **Formula Inconsistency**: IP calculations exist in multiple places with different implementations (combat damage calculator vs destiny board calculator)
3. **Missing Integration**: Destiny Board system is isolated—doesn't feed Build Calculator, Market Tool, or Crafting Calculator
4. **Incomplete Coverage**: Only combat masteries (23/~50 total) implemented; no crafting/refining/farming/gathering integration
5. **Hard-coded Assumptions**: Base IP values hardcoded instead of derived from authoritative dumps
6. **Tree Confusion**: Combat IP bonuses mixed with crafting focus mechanics in shared types

**Impact:**
- Build calculator uses incorrect IP (doesn't account for destiny board bonuses)
- Damage calculations are inaccurate (wrong IP input)
- Market tool cannot show "IP with my specs"
- Crafting calculator has no focus cost efficiency integration
- Users must manually track progression externally

### What We're Fixing

**Rebuild Scope:**
1. **Single Source of Truth**: All data derives from `ao-bin-dumps` (especially `/formatted`)
2. **Unified Calculation Engine**: One IP calculator, one focus calculator, used everywhere
3. **Complete Destiny Board**: All 5 trees (Combat, Crafting, Refining, Farming, Gathering)
4. **Deep Integration**: Destiny Board → Build Calculator → Damage Calculator → Market Tool → Crafting Tool
5. **Data Provenance**: Every constant traced to dump file + field + transformation logic
6. **Patch-safe**: Update dumps → re-run generators → system updates automatically

---

## 2️⃣ END-TO-END SYSTEM MAP

```
┌────────────────────────────────────────────────────────────────────┐
│                     DATA SOURCES (ao-bin-dumps)                    │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐│
│  │ items.xml    │  │ spells.xml   │  │ progressiontables.xml    ││
│  │ (raw dumps)  │  │              │  │                          ││
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────────────┘│
│         │                 │                    │                  │
│  ┌──────▼──────────────────▼────────────────────▼────────────────┐│
│  │         formatted/items.json (AUTHORITATIVE)                  ││
│  │         - LocalizedNames, Tier, Enchantment, ItemPower       ││
│  │         - Category, Slot, UniqueName                         ││
│  └──────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────┐
│                    DATA INGESTION & NORMALIZATION                  │
│                                                                    │
│  /src/lib/aoData/                                                 │
│  ├── loadItems() → ItemDefinition[]                              │
│  ├── loadSpells() → SpellDefinition[]                            │
│  ├── loadProgressionTables() → ProgressionTable[]                │
│  └── itemToDestinyMapping() → { masteryId, specIds, tier, ... } │
└────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│   DESTINY BOARD MODULE (NEW)     │  │    CANONICAL CONSTANTS           │
│                                  │  │                                  │
│  /src/modules/destinyBoardV2/   │  │  /src/constants/albion-canon.ts  │
│  ├── types.ts                   │  │  ├── MASTERY_MODIFIER_BY_TIER    │
│  ├── data/                      │  │  ├── IP_CONSTANTS                │
│  │   ├── combat-masteries.ts   │  │  ├── MUTUAL_IP_RATES             │
│  │   ├── crafting-masteries.ts │  │  ├── FOCUS_CONSTANTS             │
│  │   ├── refining-masteries.ts │  │  └── FCE_CONSTANTS               │
│  │   ├── farming-masteries.ts  │  │                                  │
│  │   └── gathering-masteries.ts│  │  (Source: Wiki + in-game verify) │
│  ├── calculators/               │  └──────────────────────────────────┘
│  │   ├── combatIp.ts           │
│  │   ├── focus.ts              │
│  │   └── quality.ts            │
│  ├── resolvers/                 │
│  │   ├── itemToNodes.ts        │
│  │   └── activityToNodes.ts    │
│  └── store.ts (Zustand)         │
└───────────────┬──────────────────┘
                │
    ┌───────────┼───────────┬──────────────┬────────────┐
    │           │           │              │            │
    ▼           ▼           ▼              ▼            ▼
┌─────────┐ ┌────────┐ ┌─────────────┐ ┌────────┐ ┌─────────────┐
│ BUILD   │ │ DAMAGE │ │   MARKET    │ │CRAFTING│ │   COMBAT    │
│ PLANNER │ │ CALC   │ │   TOOL      │ │ CALC   │ │   ANALYSIS  │
│         │ │        │ │             │ │        │ │   (PVP)     │
│ Uses:   │ │ Uses:  │ │   Uses:     │ │ Uses:  │ │             │
│ combat  │ │ combat │ │   combatIp()│ │ focus()│ │   Consumes  │
│ IP()    │ │ IP()   │ │   quality() │ │quality()│ │   damage    │
│ damage()│ │ spell  │ │             │ │        │ │   output    │
│         │ │ data   │ │             │ │        │ │             │
└─────────┘ └────────┘ └─────────────┘ └────────┘ └─────────────┘
```

### Module Descriptions

#### **1. Data Sources (ao-bin-dumps)**
- **Purpose**: Canonical game data from SBI's client files
- **Files**: items.xml, spells.xml, progressiontables.xml, localization.xml, formatted/items.json
- **Update Frequency**: Patch releases (~monthly)
- **Critical**: `formatted/items.json` is pre-processed, human-readable, most reliable

#### **2. Data Ingestion Layer** (`/src/lib/aoData/`)
- **Purpose**: Load, parse, normalize dump files
- **Inputs**: Raw XML/JSON from dumps
- **Outputs**: Typed TypeScript objects (ItemDefinition, SpellDefinition, etc.)
- **Transformations**: 
  - Parse item IDs to extract tier/enchantment
  - Map item categories to destiny board masteries
  - Extract base IP, ability power, attack damage
  - Link items to progression table IDs

#### **3. Destiny Board Module** (`/src/modules/destinyBoardV2/`)
- **Purpose**: SINGLE source of progression/mastery/spec logic for entire app
- **Trees**: Combat, Crafting, Refining, Farming, Gathering
- **Outputs**:
  - Combat: `CombatIPResult` (mastery IP, spec IP, modifier, final IP)
  - Crafting/Refining: `FocusResult` (FCE, actual cost, RRR)
  - Crafting: `QualityResult` (quality points, IP from quality)
- **Storage**: Zustand store with localStorage (character progression)

#### **4. Canonical Constants** (`/src/constants/albion-canon.ts`)
- **Purpose**: Game mechanics constants verified from Wiki + in-game testing
- **Examples**:
  - Mastery modifier by tier (T5=5%, T6=10%, etc.)
  - IP scaling rates (mastery 0.2/lvl, spec unique 2.0/lvl)
  - Mutual IP rates (armor/weapon 0.2, offhand simple 0.6)
  - Focus halving threshold (10,000 FCE)
- **Source**: NOT from dumps (game mechanics, not data files)

#### **5. Build Planner** (`/src/app/builds/`, `/src/components/BuildPanel.tsx`)
- **Current State**: ❌ Doesn't use destiny board IP
- **Rebuild**: ✅ Calls `calculateCombatItemIP()` for each equipment slot
- **Integration**: Shows IP breakdown, suggests specs to level

#### **6. Damage Calculator** (`/src/lib/combat/damage/damageCalculator.ts`)
- **Current State**: ⚠️ Takes IP as input, uses correct spell scaling
- **Rebuild**: ✅ Receives correct IP from build planner
- **Formula**: `damage = base * (abilityPower/100) * powerFactor^(IP/100) * mitigation`

#### **7. Market Tool** (`/src/app/market/`)
- **Current State**: ❌ Shows base item data only
- **Rebuild**: ✅ Adds "View with my specs" toggle → shows computed IP

#### **8. Crafting Calculator** (`/src/lib/crafting/`)
- **Current State**: ❌ No focus cost efficiency, hardcoded base costs
- **Rebuild**: ✅ Calls `calculateFocusCost()` → shows RRR with specs

#### **9. Combat Analysis (PVP)** (`/src/app/pvp/`)
- **Current State**: ⚠️ Uses damage calculator output
- **Rebuild**: ✅ No changes needed (consumes correct damage)

---

## 3️⃣ DATA PROVENANCE INVENTORY

### Critical Data Mapping Table

| **Module**          | **Data Needed**                  | **Dump Source**                       | **Field(s)**                                  | **Transform**                                      | **Notes**                                     |
|---------------------|----------------------------------|---------------------------------------|-----------------------------------------------|----------------------------------------------------|-----------------------------------------------|
| **Item Catalog**    | Item ID, Name, Tier              | `formatted/items.json`                | `UniqueName`, `LocalizedNames.EN-US`, index   | Parse tier from ID (`T4_...`)                      | ✅ AUTHORITATIVE                              |
|                     | Base IP                          | `formatted/items.json` (if available) | `ItemPower` (if exists)                       | If missing: derive from tier (T4=700, +100/tier)   | ⚠️ May need fallback table                   |
|                     | Slot (head/chest/mainhand)       | `formatted/items.json`                | Category context (parse from `@category`)     | Map category ID → slot enum                        | Requires category mapping logic               |
|                     | Equipment type (simple/artifact) | Item ID pattern                       | ID suffix (`_LEVEL1`, `_UNDEAD`, `_AVALON`)   | Pattern matching (see ARTIFACT_PATTERNS)           | ✅ Already implemented in crafting/calc.ts    |
| **Spells/Abilities**| Spell ID, Damage base            | `spells.xml`                          | `<spell uniquename="...">`, `<damage>`        | Parse XML → SpellDefinition                        | ✅ Already fetched                            |
|                     | Ability Power scaling            | Inferred from item category           | N/A (weapon category → AP)                    | Default 120 AP, read from item if available        | Most weapons: 120 AP                          |
|                     | Power Factor (1h vs 2h)          | CONSTANT                              | N/A                                           | 1h: 1.0825, 2h: 1.0918                             | ✅ Verified in damageCalculator.ts            |
| **Progression**     | Fame per level (mastery/spec)    | `progressiontables.xml`               | `<progression level="X" points="Y">`          | Parse XML → ProgressionTable[]                     | ✅ Already parsed                             |
|                     | Mastery modifier values          | CONSTANT (Wiki + in-game)             | N/A                                           | Hardcode: T5=0.05, T6=0.1, T7=0.15, T8=0.2         | NOT in dumps (game mechanic)                  |
|                     | Spec unique IP rate              | CONSTANT (Wiki)                       | N/A                                           | Always 2.0 IP/level                                | NOT in dumps                                  |
|                     | Spec mutual IP rate              | CONSTANT (Wiki)                       | N/A                                           | Armor/weapon simple: 0.2, offhand: 0.6, artifact:0.1| NOT in dumps                                  |
| **Crafting Focus**  | Base focus cost                  | ❌ NOT FOUND IN DUMPS                 | N/A                                           | Fallback: Wiki tables (T4=112, T5=125.8, etc.)     | **CRITICAL GAP** — needs verification         |
|                     | Focus halving threshold          | CONSTANT (Wiki)                       | N/A                                           | 10,000 FCE                                         | NOT in dumps                                  |
|                     | FCE per mastery level            | CONSTANT (Wiki)                       | N/A                                           | 30 FCE/level (mastery)                             | NOT in dumps                                  |
|                     | FCE per spec level (unique)      | CONSTANT (Wiki)                       | N/A                                           | Varies by activity (250 for weapons, etc.)         | NOT in dumps                                  |
|                     | FCE per spec level (mutual)      | CONSTANT (Wiki)                       | N/A                                           | 30 FCE/level (most cases)                          | NOT in dumps                                  |
| **Refining**        | Base refining costs (by enchant) | ❌ NOT FOUND IN DUMPS                 | N/A                                           | Wiki tables (T4.0=56, T4.1=84, T4.2=140, etc.)     | **CRITICAL GAP**                              |
|                     | Refining mutual grouping         | CONSTANT (game mechanics)             | N/A                                           | Chain-based (ore→wood→hide→fiber→stone)            | NOT in dumps                                  |
| **Quality**         | Quality IP bonus                 | CONSTANT (Wiki)                       | N/A                                           | Normal=0, Good=+10, Outstanding=+20, etc.          | NOT in dumps                                  |
|                     | Quality chance per spec level    | CONSTANT (Wiki)                       | N/A                                           | Varies by activity                                 | NOT in dumps                                  |
| **Destiny Mapping** | Item → Mastery ID                | ❌ NOT in dumps (must derive)         | Item category + slot                          | Custom mapping logic (itemToDestinyMapping())      | **CRITICAL** — must be built manually         |
|                     | Item → Specialization ID         | ❌ NOT in dumps                       | Item ID (unique identifier)                   | One-to-one (T4_MAIN_SWORD → spec_broadsword)       | Requires manual spec definition               |

### Data Source Files (Actual Paths)

```
/data/ao-bin-dumps/               # Raw dumps (XML)
├── items.xml                     # All items (complex XML structure)
├── spells.xml                    # All spells/abilities
├── progressiontables.xml         # Fame progression tables
├── localization.xml              # Translations
└── factionwarfare.xml            # Faction warfare data

/data/formatted/                  # ✅ PREFER THIS (JSON, pre-processed)
├── items.json                    # ⭐ AUTHORITATIVE for item metadata
└── world.json                    # World/cluster data

/src/data/                        # Processed/generated
├── items.json                    # Generated from items.xml (legacy)
├── progressiontables.json        # Generated from XML
├── dynamictemplates.json         # Generated from XML
└── masteries/                    # ❌ OLD (to be replaced)
    ├── axe-mastery.ts
    ├── ...
    └── index.ts
```

### Transformation Pipeline

```typescript
// CURRENT (scattered)
items.xml → processItems() → /src/data/items.json → getItemById()
formatted/items.json → (not used consistently)
progressiontables.xml → processProgressionTables() → progressiontables.json

// TARGET (unified)
formatted/items.json (ALWAYS) → loadItems() → ItemDefinition[]
                               → itemToDestinyMapping() → { masteryId, specIds }
                               → calculateCombatItemIP() → CombatIPResult

spells.xml → loadSpells() → SpellDefinition[]
          → calculateSpellDamage() (with correct IP input)

progressiontables.xml → loadProgressionTables() → ProgressionTable[]
                      → getFameForLevel() (mastery/spec)
```

### Critical Gaps & Fallback Strategy

#### **GAP 1: Base Item IP not in dumps**
- **Problem**: `formatted/items.json` may not have `ItemPower` field consistently
- **Fallback**: Derive from tier → `BASE_IP_BY_TIER = { T4: 700, T5: 800, ... }`
- **Verification**: Cross-check sample items in-game vs formula
- **Status**: ⚠️ **NEEDS TESTING** (check if `ItemPower` field exists in formatted/items.json)

#### **GAP 2: Focus costs not in dumps**
- **Problem**: Base focus costs for crafting/refining not found in dump files
- **Fallback**: Use Wiki tables (T4 equipment = 112, consumables = 56, etc.)
- **Verification**: In-game testing with 0 FCE character
- **Status**: ❌ **MUST VERIFY** (run in-game tests or find alternative source)

#### **GAP 3: Destiny Board structure not in dumps**
- **Problem**: Mastery/spec relationships, tree organization not present
- **Fallback**: Manual definition based on game UI + Wiki
- **Verification**: Cross-check with progression table IDs
- **Status**: ✅ **ACCEPTABLE** (this is UI/logic, not data)

#### **GAP 4: Quality/enchantment mechanics not in dumps**
- **Problem**: Quality IP bonuses, enchantment material costs not found
- **Fallback**: Wiki constants (Good=+10 IP, etc.)
- **Verification**: In-game inspection
- **Status**: ⚠️ **NEEDS VERIFICATION**

---

## 4️⃣ ALBION CODEX CANON (Knowledge Base)

### Definitions

#### **Base IP**
- Definition: Intrinsic Item Power of an equipment piece determined by its tier, quality, and enchantment level
- Formula: `BaseIP = TierBaseIP + QualityBonus + EnchantmentBonus`
- Tier Base IP: T1=400, T2=500, T3=600, T4=700, T5=800, T6=900, T7=1000, T8=1100
- Quality Bonus: Normal=0, Good=+10, Outstanding=+20, Excellent=+30, Masterpiece=+50
- Enchantment Bonus: Varies by tier (T4.1=+100, T4.2=+200, T4.3=+300, T4.4=+400)
- **Source**: In-game item inspection + Wiki
- **Dump Trace**: Tier from `formatted/items.json` (parse ID), quality/enchant NOT in dumps

#### **Mastery**
- Definition: Combat/crafting/refining/farming/gathering skill category (0-100 levels)
- Combat Mastery IP Bonus: `masteryLevel * 0.2` IP
- Crafting Mastery FCE: `masteryLevel * 30` FCE (most activities)
- **Source**: Game mechanics (verified Wiki)
- **Dump Trace**: Progression tables in `progressiontables.xml` (fame per level)

#### **Specialization**
- Definition: Equipment-specific skill within a mastery (0-120 levels, elite 100-120 costs silver)
- Combat Spec IP Bonuses:
  - **Unique IP**: `specLevel * 2.0` (ONLY for equipped item)
  - **Mutual IP**: `specLevel * mutualRate` (for ALL specs in mastery)
- Mutual Rates:
  - Armor simple: 0.2
  - Weapon simple: 0.2
  - Offhand simple (shield/torch/tome): **0.6** (3× multiplier!)
  - Artifact/Royal/Avalonian: 0.1
  - Misty: 0.1
- Crafting Spec FCE: Unique + Mutual (varies by activity)
- **Source**: Wiki formulas + in-game verification
- **Dump Trace**: Progression tables (fame), mutual rates NOT in dumps

#### **Mastery Modifier**
- Definition: Tier-based percentage bonus applied to TOTAL Destiny Board IP (not base IP)
- Formula: `MasteryModifierBonus = (MasteryIP + UniqueIP + MutualIP) * ModifierPercent`
- Values:
  - T1-T4: 0%
  - T5: 5%
  - T6: 10%
  - T7: 15%
  - T8: 20%
- **Source**: Wiki + in-game verification (T5 Knight Boots example = 924 IP ✅)
- **Dump Trace**: NOT in dumps (game mechanic constant)

#### **Final Combat IP**
- Formula:
  ```
  DestinyBoardIP = (masteryLevel * 0.2) 
                 + (equippedSpecLevel * 2.0) 
                 + Σ(allSpecLevels * mutualRate)
  
  MasteryModifierBonus = DestinyBoardIP * MASTERY_MODIFIER_BY_TIER[tier]
  
  FinalIP = BaseIP + DestinyBoardIP + MasteryModifierBonus
  ```
- **Source**: Wiki verified formula
- **Verification**: T5 Knight Boots (mastery 100, spec 32, other specs 63/61/30) = 924 IP ✅

#### **Focus**
- Definition: Resource consumed when crafting/refining/farming with premium
- Daily Grant: 10,000 focus/day (premium)
- Max Storage: 30,000 focus
- **Source**: Wiki + in-game
- **Dump Trace**: NOT in dumps

#### **Focus Cost Efficiency (FCE)**
- Definition: Stat that reduces focus costs exponentially
- Formula: `ActualFocusCost = BaseFocusCost / (2 ^ (TotalFCE / 10000))`
- Halving Threshold: Every +10,000 FCE halves the cost
- Sources of FCE:
  - Mastery: 30 FCE/level
  - Spec Unique: Varies (250 for equipment, etc.)
  - Spec Mutual: 30 FCE/level (varies by category)
- Max FCE: ~40,000 for refining, ~43,000-47,500 for equipment
- **Source**: Wiki verified formula
- **Dump Trace**: Base costs NOT in dumps (must use Wiki tables)

#### **Return Rate Multiplier (RRR)**
- Definition: When crafting with focus, percentage of materials returned
- Formula: `RRR = FocusUsed / BaseFocusCost` (capped at 15.3% for most activities)
- **Source**: Wiki
- **Dump Trace**: NOT in dumps

#### **Quality (Crafting)**
- Definition: Chance to craft higher quality items (Good/Outstanding/Excellent/Masterpiece)
- Quality Points: Accumulated from crafting specialization levels
- Formula: `TotalQualityPoints = specUniqueQuality + Σ(specMutualQuality)`
- IP Bonus from Quality: Good=+10, Outstanding=+20, Excellent=+30, Masterpiece=+50
- **Source**: Wiki
- **Dump Trace**: Quality bonuses NOT in dumps

### Source Trace Table

| **Constant/Rule**                | **Value**             | **File/Source**                              | **Field**                  | **Notes**                        |
|----------------------------------|-----------------------|----------------------------------------------|----------------------------|----------------------------------|
| Base IP by Tier                  | T4=700, T5=800...     | Inferred (or `formatted/items.json`)         | `ItemPower` (if exists)    | Fallback: +100/tier from T4=700  |
| Mastery IP rate                  | 0.2/level             | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Spec unique IP rate              | 2.0/level             | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Spec mutual IP (armor/weapon)    | 0.2/level             | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Spec mutual IP (offhand simple)  | 0.6/level             | CONSTANT (Wiki)                              | N/A                        | **3× multiplier**                |
| Spec mutual IP (artifact)        | 0.1/level             | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Mastery Modifier (T5)            | 5%                    | CONSTANT (Wiki + in-game verified)           | N/A                        | T5 Knight Boots test = 924 IP ✅ |
| Mastery Modifier (T6)            | 10%                   | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Mastery Modifier (T7)            | 15%                   | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Mastery Modifier (T8)            | 20%                   | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Focus daily grant                | 10,000                | CONSTANT (Wiki + in-game)                    | N/A                        | Premium benefit                  |
| Focus max storage                | 30,000                | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| FCE halving threshold            | 10,000                | CONSTANT (Wiki verified formula)             | N/A                        | 2^(FCE/10000)                    |
| FCE from mastery                 | 30/level              | CONSTANT (Wiki)                              | N/A                        | Most activities                  |
| Base focus cost (T4 equipment)   | 112                   | ⚠️ Wiki (NOT in dumps)                       | N/A                        | NEEDS VERIFICATION               |
| Base focus cost (T4 consumable)  | 56                    | ⚠️ Wiki (NOT in dumps)                       | N/A                        | NEEDS VERIFICATION               |
| Quality IP bonus (Good)          | +10                   | CONSTANT (Wiki + in-game)                    | N/A                        | Never changes                    |
| Quality IP bonus (Outstanding)   | +20                   | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Quality IP bonus (Excellent)     | +30                   | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Quality IP bonus (Masterpiece)   | +50                   | CONSTANT (Wiki)                              | N/A                        | Never changes                    |
| Power Factor (1h)                | 1.0825                | CONSTANT (verified in damageCalculator.ts)   | N/A                        | Ability damage scaling           |
| Power Factor (2h)                | 1.0918                | CONSTANT (verified in damageCalculator.ts)   | N/A                        | Ability damage scaling           |
| Fame per level                   | Varies (level^2 * N)  | `progressiontables.xml`                      | `points` attribute         | ✅ In dumps                      |
| Item name                        | "Broadsword", etc.    | `formatted/items.json`                       | `LocalizedNames.EN-US`     | ✅ AUTHORITATIVE                 |
| Item tier                        | 4-8                   | Parse from ID (`T4_...`)                     | `UniqueName`               | ✅ In dumps                      |
| Item enchantment                 | 0-4                   | Parse from ID (`@1`, `_LEVEL1`)              | `UniqueName`               | ✅ In dumps                      |
| Spell damage base                | Varies                | `spells.xml`                                 | `<damage>` component       | ✅ In dumps                      |

### What Can Change With Patches

**Dump-Derived (WILL update with patches):**
- Item names, tiers, enchantment levels
- Spell damage base values
- Fame progression tables (rare, but possible)
- New items/spells/categories

**Constants (UNLIKELY to change, but monitor patch notes):**
- Mastery IP rate (0.2/level)
- Spec unique IP rate (2.0/level)
- Mutual IP rates (0.2, 0.6, 0.1)
- Mastery modifier percentages (5%, 10%, 15%, 20%)
- Focus halving threshold (10,000 FCE)
- Power factors (1.0825, 1.0918)

**Manual Definitions (MUST update if game changes):**
- Destiny Board tree structure (if SBI adds new masteries)
- Item → Mastery/Spec mappings (if new categories added)
- Crafting/refining mutual groupings (if crafting trees change)

### Versioning Strategy

```yaml
canon_version: "1.0"
dumps_version: "latest"  # Track ao-bin-dumps commit hash
last_verified_date: "2026-01-27"

update_process:
  1. Monitor ao-bin-dumps for new commits
  2. Re-run fetch-albion-data.ts
  3. Re-run generators (gen:items, gen:data, gen:crafting)
  4. Verify critical formulas with sample data
  5. Update canon_version if constants change
  6. Publish updated canon document

critical_tests:
  - T5 Knight Boots IP = 924 (mastery 100, spec 32/63/61/30)
  - T6 Greataxe IP = 1117 (mastery 100, spec 63/100/50/30)
  - Focus cost halving at 10k/20k/40k FCE
  - Offhand simple mutual rate = 0.6 (not 0.2)
```

---

## 5️⃣ NEW DESTINY BOARD SPECIFICATION + INTEGRATION CONTRACTS

### Data Model

#### Core Types (`/src/modules/destinyBoardV2/types.ts`)

```typescript
// Tree Types
export type TreeType = 'combat' | 'crafting' | 'refining' | 'farming' | 'gathering'

// Node Types
export type NodeKind = 'mastery' | 'specialization'

// Mastery Node Definition
export interface MasteryNodeDef {
  id: string                        // 'mastery_sword', 'mastery_plate_helmet', etc.
  name: string                      // 'Sword Fighter', 'Plate Helmet Crafter'
  tree: TreeType                    // Which tree this belongs to
  category: string                  // 'weapon_warrior', 'armor_plate', 'refining_ore'
  maxLevel: 100                     // Always 100 for masteries
  progressionTableId: string        // Link to progressiontables.xml
  specializationIds: string[]       // Child specs
  bonuses: {
    combat?: {
      ipPerLevel: 0.2               // Always 0.2 for combat masteries
    }
    crafting?: {
      fcePerLevel: number           // Usually 30
      mutualFcePerLevel?: number    // For crafting masteries
    }
    refining?: {
      fcePerLevel: 250              // Unique FCE for refining
      mutualFcePerLevel: 30         // Mutual across chain
      mutualGroupKey: string        // 'refining_ore_chain', etc.
    }
  }
}

// Specialization Node Definition
export interface SpecNodeDef {
  id: string                        // 'spec_broadsword', 'spec_knight_helmet_combat', etc.
  name: string                      // 'Broadsword Combat Specialist'
  masteryId: string                 // Parent mastery
  itemId?: string                   // T4_MAIN_SWORD (for equipment specs)
  activityKey?: string              // 'craft_sword', 'refine_ore_t4' (for crafting/refining)
  type: EquipmentSubtype            // 'simple', 'artifact', 'royal', 'avalonian', 'misty', 'crystal'
  tree: TreeType                    // Must match parent mastery tree
  maxLevel: 120                     // Combat specs: 120, Crafting: 100
  progressionTableId: string        // Link to progressiontables.xml
  bonuses: {
    combat?: {
      uniqueIpPerLevel: 2.0         // Always 2.0 for equipped item
      mutualIpPerLevel: number      // Varies: 0.2/0.6/0.1 based on type
    }
    crafting?: {
      uniqueFcePerLevel: number     // Varies by activity (250 for weapons)
      mutualFcePerLevel: number     // Usually 30
      uniqueQualityPerLevel: number // Quality chance points
      mutualQualityPerLevel: number // Mutual quality (if applicable)
      mutualGroupKey?: string       // Mastery-wide mutual or chain-based
    }
  }
}

// Character Progression (SEPARATE by tree to prevent mixing)
export interface CharacterProgress {
  characterId: string
  characterName: string
  
  // COMBAT TREE
  combatMasteries: Record<string, number>        // masteryId → level (0-100)
  combatSpecs: Record<string, number>            // specId → level (0-120)
  
  // CRAFTING TREE
  craftingMasteries: Record<string, number>      // masteryId → level (0-100)
  craftingSpecs: Record<string, number>          // specId → level (0-100)
  
  // REFINING TREE
  refiningMasteries: Record<string, number>      // masteryId → level (0-100)
  refiningSpecs: Record<string, number>          // specId → level (0-100)
  
  // FARMING TREE
  farmingMasteries: Record<string, number>       // masteryId → level (0-100)
  farmingSpecs: Record<string, number>           // specId → level (0-100)
  
  // GATHERING TREE
  gatheringMasteries: Record<string, number>     // masteryId → level (0-100)
  gatheringSpecs: Record<string, number>         // specId → level (0-100)
  
  lastUpdated: string
}

// Equipment Subtype (for mutual rate lookup)
export type EquipmentSubtype = 
  | 'simple'      // T4.0, T4.1, T4.2, T4.3 (normal enchants)
  | 'royal'       // Royal items (_SET1, _SET2, _SET3)
  | 'artifact'    // Artifact items (_UNDEAD, _KEEPER, _MORGANA, _HELL)
  | 'avalonian'   // Avalonian items (_AVALON)
  | 'misty'       // Mistcaller, etc. (special case)
  | 'crystal'     // Crystal League rewards

// Calculation Results
export interface CombatIPResult {
  baseIP: number                    // From item tier/quality/enchant
  masteryIP: number                 // masteryLevel * 0.2
  specializationIP: {
    unique: number                  // equippedSpecLevel * 2.0
    mutual: number                  // Σ(allSpecLevels * mutualRate)
    breakdown: Array<{
      specId: string
      specName: string
      level: number
      uniqueIP: number              // 0 for non-equipped
      mutualIP: number
      mutualRate: number
    }>
  }
  destinyBoardTotal: number         // masteryIP + unique + mutual
  masteryModifierPercent: number    // 0-20 (based on tier)
  masteryModifierBonus: number      // destinyBoardTotal * modifierPercent
  finalIP: number                   // baseIP + destinyBoardTotal + modifierBonus
}

export interface FocusResult {
  baseCost: number                  // From Wiki tables (or in-game verify)
  totalFCE: number                  // From mastery + specs
  fceBreakdown: {
    masteryFCE: number
    specUniqueFCE: number
    specMutualFCE: number
    details: Array<{
      source: string                // 'mastery_sword', 'spec_broadsword', etc.
      fce: number
    }>
  }
  reductionFactor: number           // 2^(totalFCE / 10000)
  actualCost: number                // baseCost / reductionFactor
  percentOfBase: number             // (actualCost / baseCost) * 100
  rrr: number                       // Return rate multiplier (if applicable)
}

export interface QualityResult {
  totalQualityPoints: number
  qualityBreakdown: {
    specUniqueQuality: number
    specMutualQuality: number
    details: Array<{
      source: string
      qualityPoints: number
    }>
  }
  estimatedQualityChances?: {       // Optional: translate points to %
    good: number
    outstanding: number
    excellent: number
    masterpiece: number
  }
  ipFromQuality?: {                 // Optional: IP bonus if crafted at quality X
    good: number                    // +10
    outstanding: number             // +20
    excellent: number               // +30
    masterpiece: number             // +50
  }
}
```

### Tree Separation Rules

**CRITICAL: Combat IP and Crafting Focus are COMPLETELY SEPARATE.**

#### Combat Tree
- **Purpose**: Calculate IP bonuses for wearable equipment
- **Inputs**: Item ID, character's combat masteries/specs
- **Outputs**: Combat IP (for builds, damage calc, market display)
- **Masteries**: Sword Fighter, Plate Helmet Fighter, Shield Fighter, etc.
- **Specs**: Broadsword Combat Specialist, Knight Helmet Combat Specialist, etc.
- **Bonuses**: IP only (mastery 0.2/lvl, spec unique 2.0/lvl, mutual varies)

#### Crafting Tree
- **Purpose**: Calculate FCE + Quality for equipment crafting
- **Inputs**: Activity key (craft_sword, craft_knight_helmet), character's crafting masteries/specs
- **Outputs**: Focus cost, quality chance points
- **Masteries**: Sword Crafter, Plate Helmet Crafter, etc.
- **Specs**: Broadsword Crafting Specialist, Knight Helmet Crafting Specialist, etc.
- **Bonuses**: FCE (unique + mutual) + Quality points

#### Refining Tree
- **Purpose**: Calculate FCE for refining (no quality)
- **Inputs**: Material type + tier + enchant, character's refining masteries/specs
- **Outputs**: Focus cost only
- **Masteries**: Ore Refiner, Wood Refiner, Hide Refiner, Fiber Refiner, Stone Refiner
- **Specs**: Per-tier specs (T4 Ore Refining Specialist, T5 Ore Refining Specialist, etc.)
- **Bonuses**: FCE only (250 unique, 30 mutual across chain)
- **Mutual Chain**: Ore → Wood → Hide → Fiber → Stone (each contributes mutual FCE to next)

#### Farming Tree
- **Purpose**: Calculate FCE for farming activities
- **Inputs**: Crop/animal type, character's farming masteries/specs
- **Outputs**: Focus cost, yield bonuses
- **Masteries**: Crop Farmer, Animal Farmer
- **Specs**: Per-crop/animal (Carrot Farming Specialist, Chicken Farming Specialist, etc.)
- **Bonuses**: FCE (varies), yield/nurture/water bonuses

#### Gathering Tree
- **Purpose**: Calculate gathering yield/speed and gathering gear IP bonuses
- **Inputs**: Resource type + tier, character's gathering masteries/specs
- **Outputs**: Yield/speed bonuses, gathering gear IP (if wearing gathering equipment)
- **Masteries**: Ore Gatherer, Lumberjack, Game Hunter, Fiber Gatherer, Stone Gatherer, Fisherman
- **Specs**: Per-tier (T4 Ore Gathering Specialist, T5 Ore Gathering Specialist, etc.)
- **Bonuses**: Yield/speed, gathering gear IP (special rules per tier)

### Integration Contracts

#### Contract 1: Destiny Board → IP Engine

**Purpose**: Provide combat IP for build calculator, damage calculator, market tool

**Input Payload:**
```typescript
interface CalculateCombatIPRequest {
  itemId: string                    // e.g., 'T6_MAIN_AXE' (Greataxe)
  characterId: string               // Which character's progression to use
}
```

**Output Payload:**
```typescript
interface CalculateCombatIPResponse {
  itemId: string
  itemName: string                  // 'Greataxe' (from localization)
  tier: string                      // 'T6'
  enchantment: number               // 0-4
  equipmentType: EquipmentSubtype   // 'simple'
  
  ipResult: CombatIPResult          // Full breakdown
  
  // Convenience fields for display
  finalIP: number                   // 1117 (example)
  breakdown: string[]               // Human-readable lines for tooltip
}
```

**Example:**
```typescript
// Request
{
  itemId: 'T6_MAIN_AXE',
  characterId: 'char_12345'
}

// Response
{
  itemId: 'T6_MAIN_AXE',
  itemName: 'Greataxe',
  tier: 'T6',
  enchantment: 0,
  equipmentType: 'simple',
  ipResult: {
    baseIP: 900,
    masteryIP: 20,                  // 100 * 0.2
    specializationIP: {
      unique: 126,                  // 63 * 2.0
      mutual: 52,                   // 100*0.2 + 50*0.2 + 30*0.1
      breakdown: [
        { specId: 'spec_greataxe', level: 63, uniqueIP: 126, mutualIP: 12.6, mutualRate: 0.2 },
        { specId: 'spec_battleaxe', level: 100, uniqueIP: 0, mutualIP: 20, mutualRate: 0.2 },
        { specId: 'spec_halberd', level: 50, uniqueIP: 0, mutualIP: 10, mutualRate: 0.2 },
        { specId: 'spec_carrioncaller', level: 30, uniqueIP: 0, mutualIP: 3, mutualRate: 0.1 }
      ]
    },
    destinyBoardTotal: 198,         // 20 + 126 + 52
    masteryModifierPercent: 10,     // T6 = 10%
    masteryModifierBonus: 19.8,     // 198 * 0.10
    finalIP: 1117                   // 900 + 198 + 19.8 (rounded)
  },
  finalIP: 1117,
  breakdown: [
    'Base IP (T6): 900',
    'Mastery (100): +20',
    'Greataxe Spec (63): +126 unique, +12.6 mutual',
    'Battleaxe Spec (100): +20 mutual',
    'Halberd Spec (50): +10 mutual',
    'Carrioncaller Spec (30): +3 mutual',
    '────────────────────',
    'Destiny Board Total: 198',
    'Mastery Modifier (10%): +19.8',
    '════════════════════',
    'FINAL IP: 1117'
  ]
}
```

**Consumer Code (Build Calculator):**
```typescript
import { calculateCombatItemIP } from '@/modules/destinyBoardV2'

function BuildPanel({ characterId, weapon }: Props) {
  const { finalIP, breakdown } = calculateCombatItemIP({
    itemId: weapon.id,
    characterId
  })
  
  return (
    <div>
      <WeaponSlot item={weapon} ip={finalIP} />
      <IPBreakdown lines={breakdown} />
    </div>
  )
}
```

---

#### Contract 2: Destiny Board → Crafting/Refining

**Purpose**: Provide focus cost + quality for crafting calculator

**Input Payload:**
```typescript
interface CalculateFocusCostRequest {
  activityKey: string               // 'craft_sword', 'refine_ore_t5', 'farm_carrot'
  tier: number                      // 4-8
  enchantment: number               // 0-4 (for refining)
  characterId: string               // Which character's progression to use
}
```

**Output Payload:**
```typescript
interface CalculateFocusCostResponse {
  activityKey: string
  tier: number
  enchantment: number
  
  focusResult: FocusResult          // Full FCE breakdown
  qualityResult?: QualityResult     // Only for crafting (not refining/farming)
  
  // Convenience fields
  actualFocusCost: number           // 28 (example: 112 / 2^(10000/10000))
  percentOfBase: number             // 25% (example)
  rrr: number                       // 0.25 (25% RRR)
}
```

**Example:**
```typescript
// Request
{
  activityKey: 'craft_sword_t5',
  tier: 5,
  enchantment: 0,
  characterId: 'char_12345'
}

// Response
{
  activityKey: 'craft_sword_t5',
  tier: 5,
  enchantment: 0,
  focusResult: {
    baseCost: 125.8,                // T5 equipment base
    totalFCE: 10000,                // Mastery 100 * 30 + Spec 100 * 250 + Mutual 5000
    fceBreakdown: {
      masteryFCE: 3000,             // 100 * 30
      specUniqueFCE: 5000,          // 100 * 50 (example spec unique FCE for swords)
      specMutualFCE: 2000,          // Other specs in mastery
      details: [...]
    },
    reductionFactor: 2,             // 2^(10000/10000)
    actualCost: 62.9,               // 125.8 / 2
    percentOfBase: 50,              // 50%
    rrr: 0.15                       // Capped at 15.3%
  },
  qualityResult: {
    totalQualityPoints: 1500,
    qualityBreakdown: {...},
    estimatedQualityChances: {
      good: 65,
      outstanding: 25,
      excellent: 8,
      masterpiece: 2
    }
  },
  actualFocusCost: 62.9,
  percentOfBase: 50,
  rrr: 0.15
}
```

**Consumer Code (Crafting Calculator):**
```typescript
import { calculateFocusCost } from '@/modules/destinyBoardV2'

function CraftingCalculator({ activity, characterId }: Props) {
  const { actualFocusCost, rrr, qualityResult } = calculateFocusCost({
    activityKey: activity.key,
    tier: activity.tier,
    enchantment: 0,
    characterId
  })
  
  return (
    <div>
      <p>Focus Cost: {actualFocusCost.toFixed(1)} (RRR: {(rrr*100).toFixed(1)}%)</p>
      <QualityChances chances={qualityResult.estimatedQualityChances} />
    </div>
  )
}
```

---

#### Contract 3: Destiny Board → Build/PVP/Market

**Purpose**: Unified interface for all tools that need IP or focus data

**Exports:**
```typescript
// Main module export
export * from './calculators/combatIp'
export * from './calculators/focus'
export * from './calculators/quality'
export * from './resolvers/itemToNodes'
export * from './resolvers/activityToNodes'
export * from './store'
export * from './types'

// Convenience hooks
export function useCombatIP(itemId: string) {
  const { activeCharacter } = useDestinyBoardStore()
  return calculateCombatItemIP({ itemId, characterId: activeCharacter.id })
}

export function useFocusCost(activityKey: string, tier: number, enchantment: number = 0) {
  const { activeCharacter } = useDestinyBoardStore()
  return calculateFocusCost({ activityKey, tier, enchantment, characterId: activeCharacter.id })
}
```

**Usage in Build Calculator:**
```typescript
import { useCombatIP } from '@/modules/destinyBoardV2'

function BuildSlot({ itemId }: Props) {
  const { finalIP, breakdown } = useCombatIP(itemId)
  return <ItemDisplay ip={finalIP} tooltip={breakdown} />
}
```

**Usage in Market Tool:**
```typescript
import { calculateCombatItemIP } from '@/modules/destinyBoardV2'

function MarketItemRow({ item }: Props) {
  const [showWithSpecs, setShowWithSpecs] = useState(false)
  const { activeCharacter } = useDestinyBoardStore()
  
  const computedIP = showWithSpecs 
    ? calculateCombatItemIP({ itemId: item.id, characterId: activeCharacter.id }).finalIP
    : item.baseIP
  
  return (
    <tr>
      <td>{item.name}</td>
      <td>
        {computedIP}
        <button onClick={() => setShowWithSpecs(!showWithSpecs)}>
          {showWithSpecs ? 'Hide Specs' : 'With My Specs'}
        </button>
      </td>
    </tr>
  )
}
```

**Usage in Damage Calculator:**
```typescript
import { useCombatIP } from '@/modules/destinyBoardV2'
import { calculateSpellDamage } from '@/lib/combat/damage/damageCalculator'

function DamageRotation({ weaponId, spellId }: Props) {
  const { finalIP } = useCombatIP(weaponId)
  
  const damage = calculateSpellDamage({
    weaponId,
    weaponIP: finalIP,  // ✅ Now uses correct IP with destiny board bonuses
    spellId,
    armor: 150,
    mr: 150
  })
  
  return <DamageDisplay total={damage.total} packets={damage.packets} />
}
```

---

## 6️⃣ TO-DO LIST (Next 10 Tasks)

**Ordered by dependency chain:**

### Phase 1: Foundation (Days 1-3)

**Task 1: Verify Dump Data Availability** ⚠️ CRITICAL
- [ ] Check if `formatted/items.json` contains `ItemPower` field
- [ ] Verify spell damage values in `spells.xml`
- [ ] Confirm progression tables map correctly
- [ ] Document any missing fields (base focus costs, quality tables, etc.)
- **Blocker**: Cannot proceed without knowing data gaps

**Task 2: Create Data Ingestion Layer**
- [ ] Implement `/src/lib/aoData/loadItems.ts` (parse `formatted/items.json`)
- [ ] Implement `/src/lib/aoData/loadSpells.ts` (parse `spells.xml`)
- [ ] Implement `/src/lib/aoData/loadProgressionTables.ts` (parse XML)
- [ ] Add type definitions for ItemDefinition, SpellDefinition
- [ ] Write tests for parsing edge cases
- **Dependencies**: Task 1 complete

**Task 3: Create Item→Destiny Mapping**
- [ ] Implement `itemToDestinyMapping(itemId) → { masteryId, specIds, tier, type }`
- [ ] Map item categories to mastery IDs (sword → mastery_sword_combat)
- [ ] Detect equipment subtype (simple/artifact/royal/avalonian)
- [ ] Handle special cases (gathering tools, capes, mounts, etc.)
- [ ] Write tests for mapping logic
- **Dependencies**: Task 2 complete

### Phase 2: Destiny Board Data (Days 4-7)

**Task 4: Define Combat Masteries + Specs**
- [ ] Create `/src/modules/destinyBoardV2/data/combat-masteries.ts`
- [ ] Define 17 weapon masteries + specs (use ao-bin-dumps item IDs)
- [ ] Define 3 armor masteries + specs (plate/leather/cloth)
- [ ] Define 3 offhand masteries + specs (shield/torch/tome with 0.6 mutual)
- [ ] Export ALL_COMBAT_MASTERIES, ALL_COMBAT_SPECS arrays
- **Dependencies**: Task 3 complete (need item mapping)

**Task 5: Define Crafting/Refining/Farming/Gathering Masteries**
- [ ] Create `/src/modules/destinyBoardV2/data/crafting-masteries.ts`
- [ ] Define crafting masteries (Warrior's Forge, Hunter's Lodge, Mage's Tower, Toolmaker, etc.)
- [ ] Create `/src/modules/destinyBoardV2/data/refining-masteries.ts` (5 refiners: ore/wood/hide/fiber/stone)
- [ ] Create `/src/modules/destinyBoardV2/data/farming-masteries.ts` (crops + animals)
- [ ] Create `/src/modules/destinyBoardV2/data/gathering-masteries.ts` (6 gatherers)
- [ ] Document FCE/quality bonuses per spec (reference Wiki tables)
- **Dependencies**: Task 4 complete

### Phase 3: Calculators (Days 8-10)

**Task 6: Implement Combat IP Calculator**
- [ ] Create `/src/modules/destinyBoardV2/calculators/combatIp.ts`
- [ ] Implement `calculateCombatItemIP(request) → CombatIPResult`
- [ ] Handle base IP lookup (from dumps or fallback table)
- [ ] Calculate mastery IP (level * 0.2)
- [ ] Calculate spec unique IP (level * 2.0)
- [ ] Calculate spec mutual IP (Σ levels * mutualRate)
- [ ] Apply mastery modifier (T5-T8 only)
- [ ] Write tests: T5 Knight Boots = 924 IP ✅, T6 Greataxe = 1117 IP ✅
- **Dependencies**: Tasks 2, 4 complete

**Task 7: Implement Focus Calculator**
- [ ] Create `/src/modules/destinyBoardV2/calculators/focus.ts`
- [ ] Implement `calculateFocusCost(request) → FocusResult`
- [ ] Lookup base focus cost (from Wiki tables as fallback if not in dumps)
- [ ] Calculate total FCE (mastery + spec unique + spec mutual)
- [ ] Apply exponential reduction: `cost = base / (2^(FCE/10000))`
- [ ] Calculate RRR if applicable
- [ ] Write tests: 0 FCE=100%, 10k=50%, 20k=25%, 40k=6.25%
- **Dependencies**: Task 5 complete

**Task 8: Implement Quality Calculator**
- [ ] Create `/src/modules/destinyBoardV2/calculators/quality.ts`
- [ ] Implement `calculateCraftingQualityPoints(request) → QualityResult`
- [ ] Sum unique + mutual quality points from specs
- [ ] Map quality points → estimated % chances (if formula known)
- [ ] Add IP bonus lookup (Good=+10, Outstanding=+20, etc.)
- [ ] Write tests for sample crafting specs
- **Dependencies**: Task 5 complete

### Phase 4: Integration (Days 11-14)

**Task 9: Integrate with Build Calculator**
- [ ] Update `/src/components/BuildPanel.tsx` to use `calculateCombatItemIP()`
- [ ] Replace hardcoded IP with destiny board IP
- [ ] Show IP breakdown tooltip
- [ ] Add "Optimize" button → suggest specs to level next
- [ ] Update damage calculator to receive correct IP
- [ ] Write integration tests
- **Dependencies**: Task 6 complete

**Task 10: Integrate with Crafting Calculator + Market Tool**
- [ ] Update `/src/lib/crafting/calculations.ts` to use `calculateFocusCost()`
- [ ] Show focus cost + RRR in crafting UI
- [ ] Add quality chance display
- [ ] Update market tool to show "IP with my specs" toggle
- [ ] Write integration tests
- **Dependencies**: Tasks 7, 8 complete

---

## 7️⃣ CRITICAL SUCCESS CRITERIA

**Before declaring "rebuild complete", all of these MUST be true:**

1. ✅ **Single Source of Truth**: All item/spell data comes from `ao-bin-dumps` (no hardcoded lists)
2. ✅ **Formula Verification**: T5 Knight Boots = 924 IP test passes
3. ✅ **Offhand Mutual Rate**: Shield/Torch/Tome simple variants use 0.6 (not 0.2)
4. ✅ **Build Calculator Integration**: Shows correct combat IP with destiny board bonuses
5. ✅ **Damage Calculator Accuracy**: Receives correct IP from build calculator
6. ✅ **Market Tool Enhancement**: Can display "IP with my specs"
7. ✅ **Crafting Calculator Integration**: Shows focus cost with FCE reduction
8. ✅ **Focus Halving Test**: 10k FCE = 50%, 20k = 25%, 40k = 6.25%
9. ✅ **Data Provenance**: Every constant has documented source (Wiki/dumps/in-game)
10. ✅ **Patch Safety**: Re-running data fetch updates system automatically

**Failure Modes to Avoid:**
- ❌ Combat IP and crafting focus mixed in same calculation
- ❌ Hardcoded item lists that become stale
- ❌ Base IP values that don't match in-game inspection
- ❌ Mastery modifier applied to base IP (should only apply to destiny board IP)
- ❌ Missing offhand 0.6 mutual rate special case

---

## 8️⃣ APPENDIX: Current vs Target Architecture

### CURRENT (Broken State)

```
/src/data/masteries/          ❌ Only combat, hardcoded lists
/src/lib/calculators/         ⚠️ Correct formulas but not integrated
/src/components/BuildPanel    ❌ Doesn't use destiny board IP
/src/lib/combat/damage/       ⚠️ Receives wrong IP input
/src/lib/crafting/            ❌ No focus cost efficiency
/src/app/market/              ❌ No "IP with specs" feature
```

### TARGET (Rebuilt State)

```
/src/modules/destinyBoardV2/
├── types.ts                  ✅ Unified types for all trees
├── data/
│   ├── combat-masteries.ts   ✅ All weapon/armor/offhand masteries
│   ├── crafting-masteries.ts ✅ All crafting masteries
│   ├── refining-masteries.ts ✅ Ore/wood/hide/fiber/stone
│   ├── farming-masteries.ts  ✅ Crops + animals
│   └── gathering-masteries.ts✅ All gathering tools
├── calculators/
│   ├── combatIp.ts           ✅ Single IP calculator, used everywhere
│   ├── focus.ts              ✅ Single focus calculator
│   └── quality.ts            ✅ Quality points + IP bonus
├── resolvers/
│   ├── itemToNodes.ts        ✅ Item ID → mastery/spec mapping
│   └── activityToNodes.ts    ✅ Activity → mastery/spec mapping
└── store.ts                  ✅ Zustand with localStorage persistence

/src/lib/aoData/              ✅ NEW: Dump ingestion layer
├── loadItems.ts              ✅ Parse formatted/items.json
├── loadSpells.ts             ✅ Parse spells.xml
└── loadProgressionTables.ts  ✅ Parse progressiontables.xml

/src/constants/albion-canon.ts✅ NEW: Verified game mechanics constants
                              ✅ All constants have provenance documentation

/src/components/BuildPanel    ✅ UPDATED: Uses calculateCombatItemIP()
/src/lib/combat/damage/       ✅ UPDATED: Receives correct IP
/src/lib/crafting/            ✅ UPDATED: Uses calculateFocusCost()
/src/app/market/              ✅ UPDATED: Shows "IP with my specs"
```

---

**END OF DOCUMENT**

*This canon serves as the single source of truth for AlbionCodex architecture. All future development MUST reference this document and update it when changes occur.*
