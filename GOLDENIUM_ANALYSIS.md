# Goldenium Spreadsheet Analysis

**Source:** Copy of Goldenium All-In-One V2.6.0.xlsx
**Analyzed:** 2026-01-27

---

## Key Findings

The Goldenium spreadsheet contains comprehensive crafting data that can be directly integrated into AlbionCodex.

---

## 1. RRR (Return Rate) Calculation

### Formula
```
RRR = 1 - 100 / (100 + totalBonus * 100)
```
Which simplifies to:
```
RRR = totalBonus / (1 + totalBonus)
```

### Total Bonus Components
```
totalBonus = zoneQualityBonus
           + hideoutPowerBonus
           + cityBonus (if enabled)
           + focusBonus (if enabled)
           + islandPenalty (if on island)
```

---

## 2. Bonus Tables

### Zone Quality Bonus
| Level | Bonus |
|-------|-------|
| 1 | 1% |
| 2 | 6% |
| 3 | 11% |
| 4 | 16% |
| 5 | 21% |
| 6 | 26% |

### Hideout Power Bonus
| Level | Bonus |
|-------|-------|
| 1 | 0% |
| 2 | 9.75% |
| 3 | 18.5% |
| 4 | 26.25% |
| 5 | 33% |
| 6 | 38.75% |
| 7 | 44.5% |
| 8 | 50.25% |
| 9 | 56% |

### Fixed Bonuses
| Type | Value |
|------|-------|
| City Bonus (crafting in bonus city) | +15% |
| Focus Bonus (using focus) | +59% |
| Island Penalty (crafting on island) | -18% |

---

## 3. Item FCE Data Structure

Each craftable item has these FCE-related fields:

| Field | Description | Example Values |
|-------|-------------|----------------|
| `category` | Crafting category (1-4) | 1=Mage, 2=Hunter, 3=Warrior, 4=Tools |
| `baseFocus` | Base focus cost | 250, 310, 370 |
| `specUniqueFCE` | FCE per level (unique spec) | 2.15, 15, 30, 60 |
| `specMutualFCE` | FCE per level (mutual) | 30, 310 |

### Category Breakdown
- **Category 1 (Mage):** Cloth armor, staves - baseFocus=250, unique=30/2.15, mutual=30
- **Category 2 (Hunter):** Leather armor, bows, daggers - baseFocus=250, unique=30, mutual=30
- **Category 3 (Warrior):** Plate armor, swords, axes, maces - baseFocus=250, unique=30/15, mutual=30
- **Category 4 (Tools):** Bags, capes, gathering tools - baseFocus=250-370, unique=30-60, mutual=30-310

### Crystal Items
Crystal items have special FCE values:
- `specUniqueFCE` = 2.15 (very low)
- This means crystal items benefit less from spec leveling

### Artifact Items
Artifact items have reduced FCE rates:
- `specUniqueFCE` = 15 (vs 30 for simple)
- `specMutualFCE` = 30 (same as simple)

---

## 4. Sample Item Data

| Item | Category | Base Focus | Unique FCE | Mutual FCE |
|------|----------|------------|------------|------------|
| Arcane Staff | 1 | 250 | 30 | 30 |
| Assassin Hood | 2 | 250 | 30 | 30 |
| Bear Paws (Artifact) | 3 | 250 | 15 | 30 |
| Arctic Staff (Crystal) | 1 | 250 | 2.15 | 30 |
| Bag | 4 | 310 | 30 | 30 |
| Cape | 4 | 370 | 0 | 30 |
| Avalonian Pickaxe | 4 | 250 | 60 | 310 |

---

## 5. Focus Cost Calculation (from Wiki + Goldenium)

### FCE Formula
```
actualFocusCost = baseFocusCost / (2 ^ (totalFCE / 10000))
```

### Total FCE Calculation
```
totalFCE = (masteryLevel * masteryFCEPerLevel)
         + (specLevel * specUniqueFCE)
         + (mutualSpecLevels * specMutualFCE)
```

Where:
- `masteryFCEPerLevel` = 30 (for most activities)
- `specUniqueFCE` = varies by item (2.15 to 60)
- `specMutualFCE` = varies by item (30 to 310)

---

## 6. Integration Recommendations

### Update Constants File
Add to `src/constants/albion-constants.ts`:

```typescript
export const ZONE_QUALITY_BONUS = {
  1: 0.01, 2: 0.06, 3: 0.11, 4: 0.16, 5: 0.21, 6: 0.26
} as const

export const HIDEOUT_POWER_BONUS = {
  1: 0, 2: 0.0975, 3: 0.185, 4: 0.2625, 5: 0.33,
  6: 0.3875, 7: 0.445, 8: 0.5025, 9: 0.56
} as const

export const CRAFTING_BONUSES = {
  CITY_BONUS: 0.15,
  FOCUS_BONUS: 0.59,
  ISLAND_PENALTY: -0.18
} as const

export const calculateRRR = (totalBonus: number): number => {
  return totalBonus / (1 + totalBonus)
}
```

### Create FCE Data File
Create `src/data/crafting-fce.json` with item FCE data extracted from Goldenium.

### Update Crafting Calculator
Replace hardcoded RRR values with calculated values using:
1. Zone quality selection
2. Hideout power selection
3. City bonus toggle
4. Focus usage toggle
5. Island toggle

---

## 7. Sheets in Workbook

| Sheet | Purpose |
|-------|---------|
| Main Settings | User configuration |
| Backend Main Settings | Settings calculations |
| Gear Crafting | Main gear crafting UI |
| Backend Gear Crafting | Gear crafting data + formulas |
| Refining | Refining calculator |
| Backend Refining | Refining data + formulas |
| Food Crafting | Food crafting UI |
| Backend Food Crafting | Food data |
| Potion Crafting | Potion crafting UI |
| Backend Potion Crafting | Potion data |
| Focus & Fee | Item FCE reference |
| Spec Sheet | User spec input |
| Backend Spec Sheet | Spec calculations |
| Refining Spec | Refining spec input |
| Decision Maker | Profit optimization |

---

## 8. Data to Extract

The following data should be extracted from the spreadsheet:

1. **Gear Crafting Data** (~280 items)
   - Item ID, Name, Materials, Bonus City
   - Category, Base Focus, Spec Unique FCE, Spec Mutual FCE

2. **Refining Data** (5 material types x 7 tiers x 5 enchants)
   - Raw material ID, Refined material ID
   - Base focus cost, FCE rates

3. **Food/Potion Data**
   - Item IDs, Base focus, FCE rates

4. **Bonus Tables**
   - Zone Quality, Hideout Power
   - Fixed bonuses

---

## Next Steps

1. Create extraction script to pull all crafting data
2. Generate `crafting-fce.json` with FCE values per item
3. Update `calculateFocusCost()` to use actual FCE values
4. Update crafting UI with Zone Quality and Hideout Power selectors
5. Add RRR calculation using the Goldenium formula
