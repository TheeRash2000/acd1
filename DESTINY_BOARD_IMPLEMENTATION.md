# Destiny Board Implementation - Complete Reference

## ✅ COMPLETED COMPONENTS

### 1. Type Definitions (`src/types/destiny-board.ts`)
- ✅ MasteryNode interface
- ✅ SpecializationNode interface  
- ✅ CharacterSheet interface
- ✅ IPCalculationResult interface
- ✅ FocusCalculationResult interface
- ✅ All supporting types

### 2. Constants (`src/constants/albion-constants.ts`)
- ✅ MASTERY_MODIFIER_BY_TIER (T4=0%, T5=5%, T6=10%, T7=15%, T8=20%)
- ✅ BASE_IP_BY_TIER (T4=700, T5=800, etc.)
- ✅ MUTUAL_IP_RATES (armor/weapon/offhand rates)
- ✅ IP_CONSTANTS (mastery 0.2, spec unique 2.0)
- ✅ FOCUS_COSTS (by activity and tier)
- ✅ FCE_CONSTANTS (halving threshold, mastery/spec FCE)
- ✅ Helper functions (getMutualIPRate, getMasteryModifier, getBaseIP)

### 3. Calculators

#### IP Calculator (`src/lib/calculators/ip-calculator.ts`)
- ✅ `calculateItemIP()` - Main IP calculation with Wiki formula
- ✅ `calculateIPDifference()` - Compare current vs target levels
- ✅ `calculateIPPerLevel()` - IP gain per level for optimization
- ✅ `findOptimalSpecToLevel()` - Find best spec to level next

#### Focus Calculator (`src/lib/calculators/focus-calculator.ts`)
- ✅ `calculateFocusCost()` - FCE-based focus cost calculation
- ✅ `calculateDailyFocusSavings()` - Premium focus savings
- ✅ `calculateOptimalFCELevels()` - Sweet spot for diminishing returns
- ✅ `compareFocusCosts()` - Compare focus costs between levels

### 4. Data Files

#### Weapon Masteries (17) ✅
- ✅ Axe: Battleaxe, Greataxe, Halberd, Carrioncaller, Infernal Scythe, Bear Paws, Realmbreaker, Shadowcaller
- ✅ Sword: Broadsword, Claymore, Dual Swords, Clarent Blade, Carving Sword, Galatine Pair, Kingmaker, Ensis Bellator
- ✅ Hammer: Hammer, Polehammer, Great Hammer, Tombhammer, Forge Hammers, Grovekeeper, Hand of Justice, Camlann Mace
- ✅ Mace: Mace, Heavy Mace, Morning Star, Bedrock Mace, Incubus Mace, Camlann Hammer, Oaken Scepter, Spirithunter
- ✅ War Gloves: Brawler Gloves, Battle Bracers, Spiked Gauntlets, Ravenstrike Cestus, Hellish Handguards, Fists of Avalon, Bear Paws (Artifact), Ursine Maulers
- ✅ Bow: Bow, Warbow, Longbow, Whispering Bow, Wailing Bow, Bow of Badon, Energy Shaper, Avalonian Warbow
- ✅ Crossbow: Crossbow, Heavy Crossbow, Light Crossbow, Weeping Repeater, Boltcasters, Siegebow, Shadowdusk Piercer, Dawnsong Recurve
- ✅ Spear: Spear, Pike, Glaive, Heron Spear, Spirithunter, Trinity Spear, Daybreaker, Grailseeker
- ✅ Dagger: Dagger, Claws, Dagger Pair, Bloodletter, Black Hands, Deathgivers, Bridled Fury, Agonizing Orb
- ✅ Quarterstaff: Quarterstaff, Iron-clad Staff, Double Bladed Staff, Black Monk Stave, Soulscythe, Staff of Balance, Grailseeker (Artifact), Celestial Cane
- ✅ Nature Staff: Nature Staff, Great Nature Staff, Wild Staff, Rampant Staff, Druidic Staff, Blight Staff, Ironroot Staff, Keeper Staff
- ✅ Shapeshifter: Wildcat Staff, Bear Paws, Raven Staff, Werewolf Staff, Ursine Maulers, Everdusk Claws, Mistfang Staff, Saberfang Staff
- ✅ Fire Staff: Fire Staff, Great Fire Staff, Infernal Staff, Wildfire Staff, Blazing Staff, Brimstone Staff, Clarent Blade (Artifact), Inferno Shield
- ✅ Holy Staff: Holy Staff, Great Holy Staff, Divine Staff, Lifetouch Staff, Fallen Staff, Redemption Staff, Sacred Scepter, Hallowfall
- ✅ Arcane Staff: Arcane Staff, Great Arcane Staff, Enigmatic Staff, Witchwork Staff, Occult Staff, Malific Staff, Evensong, Arcane Polearm
- ✅ Frost Staff: Frost Staff, Great Frost Staff, Glacial Staff, Hoarfrost Staff, Icicle Staff, Permafrost Prism, Chillhowl, Icefall Staff
- ✅ Cursed Staff: Cursed Staff, Great Cursed Staff, Demonic Staff, Cursed Skull, Damnation Staff, Lifecurse Staff, Shadowcaller (Artifact), Taproot

#### Armor Masteries (3) ✅
- ✅ Plate Armor: Knight Helmet, Soldier Helmet, Guardian Helmet, Judicator Helmet, Demon Helmet, Graveguard Helmet, Helmet of Valor, Royal Helmet | Knight Armor, Soldier Armor, Guardian Armor, Judicator Armor, Demon Armor, Graveguard Armor, Armor of Valor, Royal Armor | Knight Boots, Soldier Boots, Guardian Boots, Judicator Boots, Demon Boots, Graveguard Boots, Boots of Valor, Royal Boots
- ✅ Leather Armor: Mercenary Hood, Hunter Hood, Assassin Hood, Stalker Hood, Hellion Hood, Specter Hood, Mistwalker Hood, Hood of Tenacity | Mercenary Jacket, Hunter Jacket, Assassin Jacket, Stalker Jacket, Hellion Jacket, Specter Jacket, Mistwalker Jacket, Jacket of Tenacity | Mercenary Shoes, Hunter Shoes, Assassin Shoes, Stalker Shoes, Hellion Shoes, Specter Shoes, Mistwalker Shoes, Shoes of Tenacity
- ✅ Cloth Armor: Scholar Cowl, Cleric Cowl, Mage Cowl, Fiend Cowl, Cultist Cowl, Cowl of Purity, Cowl of Transcendence, Royal Cowl | Scholar Robe, Cleric Robe, Mage Robe, Fiend Robe, Cultist Robe, Robe of Purity, Robe of Transcendence, Royal Robe | Scholar Sandals, Cleric Sandals, Mage Sandals, Fiend Sandals, Cultist Sandals, Sandals of Purity, Sandals of Transcendence, Royal Sandals

#### Off-hand Masteries (3) ✅
- ✅ Shield: Shield (0.6 mutual), Sarcophagus, Caitiff Shield, Facebreaker, Astral Aegis, Unbreakable Ward
- ✅ Torch: Torch (0.6 mutual), Mistcaller, Leering Cane, Cryptcandle, Sacred Scepter (Artifact), Astral Lamp
- ✅ Tome: Tome of Spells (0.6 mutual), Eye of Secrets, Muisak, Taproot (Artifact), Celestial Censer, Astral Codex

#### Master Index ✅
- ✅ ALL_MASTERIES array (23 total: 17 weapons + 3 armor + 3 off-hand)
- ✅ ALL_SPECIALIZATIONS array (190+ combat specs)
- ✅ Lookup helpers (getMastery, getSpecialization, etc.)

### 5. State Management (`src/stores/destinyBoardStore.ts`)
- ✅ Zustand store with persistence
- ✅ Multi-character support
- ✅ Mastery/specialization level updates
- ✅ Import/export functionality

---

## 📋 TODO: DATA FILES

Create mastery definitions for all weapon/armor types based on `src/data/progressionTables.ts`:

### Non-Combat Data (Future)
- [ ] Refining masteries (ore/wood/hide/fiber/stone)
- [ ] Farming masteries (crops/animals)
- [ ] Crafting masteries (separate from combat fighting)
- [ ] Gathering masteries (optional - low value for PvP focus)

---

## 📋 TODO: UI COMPONENTS

### Core Components
- ✅ `src/components/DestinyBoard/DestinyBoardManager.tsx` - Main container (tabs live on /character-sync)
- ✅ `src/components/DestinyBoard/CharacterSelector.tsx` - Select/create characters
- ✅ `src/components/DestinyBoard/MasteryTree.tsx` - Mastery sidebar
- ✅ `src/components/DestinyBoard/SpecializationPanel.tsx` - Spec details for mastery
- [ ] `src/components/DestinyBoard/MasteryCard.tsx` - Individual mastery display (optional split-out)
- [ ] `src/components/DestinyBoard/SpecializationCard.tsx` - Individual spec display (optional split-out)
- [ ] `src/components/DestinyBoard/LevelSlider.tsx` - Adjust levels 0-100/120 (optional split-out)

### Calculator Components
- ✅ `src/components/DestinyBoard/IPCalculatorPanel.tsx` - IP breakdown display (combat only)
- ✅ `src/components/DestinyBoard/FocusCalculatorPanel.tsx` - Focus cost display (crafting/refining only)
- [ ] `src/components/DestinyBoard/OptimizationPanel.tsx` - "What to level next?"

### Integration Components (Update Existing)
- [ ] Update `src/components/BuildPanel.tsx` - Use calculateItemIP()
- [ ] Update `src/components/CraftingCalculator.tsx` - Use calculateFocusCost() (if exists)
- [ ] Add "View in Destiny Board" links everywhere

### Page
- ✅ `src/app/character-sync/page.tsx` - Primary Destiny Board dashboard (fighting vs crafting tabs)
- ✅ `src/app/destiny-board/page.tsx` - Legacy route remains

---

## 📋 TODO: TESTING

### Unit Tests
- [ ] `__tests__/ip-calculator.test.ts` - Test Wiki example (T5 Knight Boots = 924 IP)
- [ ] `__tests__/focus-calculator.test.ts` - Test FCE halving formula
- [ ] Test mastery modifier edge cases
- [ ] Test off-hand 0.6 mutual rate

### Integration Tests
- [ ] Test full Axe build IP calculation
- [ ] Test multi-character switching
- [ ] Test import/export

---

## 🎯 DEPLOYMENT CHECKLIST

### Phase 1: Core Infrastructure ✅ DONE
- [x] Create type definitions
- [x] Create constants
- [x] Create IP calculator
- [x] Create Focus calculator
- [x] Create Zustand store
- [x] Create sample data (Axe)

### Phase 2: Data Population ✅ COMPLETE (Combat)
- [x] Generate weapon mastery definitions (17 weapon types)
- [x] Generate armor mastery definitions (3 armor types: plate/leather/cloth)
- [x] Generate off-hand mastery definitions (shield/torch/tome with 0.6 mutual rate)
- [x] Generate specialization definitions for all combat masteries (190+ specs)
- [x] Create master index (23 masteries: 17 weapons + 3 armor + 3 off-hand)
- [ ] Verify item IDs match items.json
- [ ] Add crafting/refining/farming masteries (separate system - future)

### Phase 3: UI Components
- [x] Create Destiny Board Manager
- [x] Create Mastery Tree
- [x] Create Specialization Panel
- [x] Create calculator displays (IP + Focus)
- [x] Add routing and navigation (/character-sync primary, /destiny-board legacy)

### Phase 4: Integration
- [ ] Update BuildPanel to use calculateItemIP()
- [ ] Show IP breakdown with mastery/spec contributions
- [ ] Add "Optimize" button to suggest best specs to level
- [ ] Link to Destiny Board from all equipment displays

### Phase 5: Polish
- [ ] Add keyboard shortcuts (number keys to adjust levels)
- [ ] Add preset builds (import from community)
- [ ] Add learning points calculator
- [ ] Add fame requirements display
- [ ] Add silver cost for elite levels (100-120)

### Phase 6: Testing & Validation
- [ ] Verify calculations match in-game values
- [ ] Test with real player data
- [ ] Community feedback
- [ ] Iterate on UX

---

## 🔧 QUICK START GUIDE

### To Add a New Mastery:

```typescript
// 1. Create file: src/data/masteries/sword-mastery.ts
import type { MasteryNode, SpecializationNode } from '@/types/destiny-board';

export const SWORD_MASTERY: MasteryNode = {
  id: 'mastery_sword',
  name: 'Sword Fighter',
  category: 'weapon_warrior',
  maxLevel: 100,
  ipPerLevel: 0.2,
  focusPerLevel: 30,
  craftingFocusTotal: 3000,
  specializationIds: ['spec_broadsword', 'spec_claymore', /* ... */],
};

export const SWORD_SPECIALIZATIONS: SpecializationNode[] = [
  {
    id: 'spec_broadsword',
    name: 'Broadsword Combat Specialist',
    masteryId: 'mastery_sword',
    itemId: 'T4_MAIN_SWORD', // From items.json
    type: 'simple',
    maxLevel: 120,
    uniqueIpPerLevel: 2.0,
    mutualIpPerLevel: 0.2, // 0.2 for simple, 0.1 for artifact
    uniqueFocusPerLevel: 250,
    mutualFocusPerLevel: 30,
  },
  // ... more specs
];

// 2. Add to index
// src/data/masteries/index.ts
export * from './axe-mastery';
export * from './sword-mastery';
// ...
```

### To Use IP Calculator:

```typescript
import { calculateItemIP } from '@/lib/calculators/ip-calculator';
import { useDestinyBoardStore } from '@/stores/destinyBoardStore';

function MyComponent() {
  const { activeCharacter } = useDestinyBoardStore();

  const ipResult = calculateItemIP({
    itemTier: 'T6',
    equipmentType: 'simple',
    slot: 'mainhand',
    masteryLevel: activeCharacter?.masteries['mastery_axe'] || 0,
    equippedSpecId: 'spec_battleaxe',
    equippedSpecLevel: activeCharacter?.specializations['spec_battleaxe'] || 0,
    allSpecsInMastery: {
      'spec_greataxe': { level: 63, type: 'simple' },
      'spec_halberd': { level: 50, type: 'simple' },
      // ... other specs
    },
  });

  return (
    <div>
      <p>Base IP: {ipResult.baseIP}</p>
      <p>Mastery IP: {ipResult.masteryIP}</p>
      <p>Specialization IP: {ipResult.specializationIP.unique + ipResult.specializationIP.mutual}</p>
      <p>Mastery Modifier ({ipResult.masteryModifierPercent}%): {ipResult.masteryModifierBonus}</p>
      <p><strong>Total IP: {ipResult.finalIP}</strong></p>
    </div>
  );
}
```

---

## ⚠️ CRITICAL REMINDERS

1. **NEVER** use 0.4 for IP scaling - Mastery is 0.2, Spec unique is 2.0
2. Mastery Modifier only applies to Destiny Board IP - NOT base IP
3. Mutual rates vary by equipment type - Check the constants!
4. Off-hand has 3× mutual bonus - 0.6 instead of 0.2
5. Elite levels (100-120) cost silver - Not just fame
6. Focus halves every 10,000 FCE - Exponential reduction
7. Max FCE varies by activity - 40k for refining, 43-47.5k for equipment
8. Premium gives 10,000 Focus daily - Max storage 30,000

---

## 📚 REFERENCES

- [Albion Wiki: Item Power](https://wiki.albiononline.com/wiki/Item_Power)
- [Albion Wiki: Mastery Modifier](https://wiki.albiononline.com/wiki/Mastery_Modifier)
- [Albion Wiki: Specializations](https://wiki.albiononline.com/wiki/Specializations)
- [Albion Wiki: Crafting Focus](https://wiki.albiononline.com/wiki/Focus)
- [ao-bin-dumps GitHub](https://github.com/ao-data/ao-bin-dumps)

---

## 🎨 UI MOCKUP

```
┌─────────────────────────────────────────────────────────────┐
│ Destiny Board - Character: MyCharacter        [New] [Import] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────┐  ┌──────────────────────────────────┐   │
│ │ Warrior         │  │ Axe Fighter (Mastery 100/100) ✓ │   │
│ │ ├─ Sword        │  │                                  │   │
│ │ ├─ Axe     [●]  │  │ IP Bonus: 20.0                   │   │
│ │ ├─ Mace         │  │ Focus (Crafting): 3000 FCE       │   │
│ │ ├─ Hammer       │  │                                  │   │
│ │ └─ War Gloves   │  │ Specializations:                 │   │
│ │                 │  │ ├─ Battleaxe      100/120  ✓    │   │
│ │ Hunter          │  │ ├─ Greataxe        63/120       │   │
│ │ ├─ Crossbow     │  │ ├─ Halberd         50/120       │   │
│ │ ├─ Bow          │  │ ├─ Carrioncaller   30/120       │   │
│ │ └─ ...          │  │ └─ ...                           │   │
│ └─────────────────┘  └──────────────────────────────────┘   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ IP Calculator: T6 Greataxe                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Base IP (T6):          900                              │ │
│ │ Mastery (100):         +20    (100 × 0.2)               │ │
│ │ Greataxe Spec (63):    +126   (63 × 2.0)                │ │
│ │ Mutual IP (all):       +52    (various specs)           │ │
│ │ ├─ Battleaxe (100):   +20    (100 × 0.2)                │ │
│ │ ├─ Halberd (50):      +10    (50 × 0.2)                 │ │
│ │ └─ Carrioncaller(30): +3     (30 × 0.1 artifact)        │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ Destiny Board Total:   198                              │ │
│ │ Mastery Modifier (10%):+19.8  (T6 = 10%)                │ │
│ │ ═════════════════════════════════════════════════════   │ │
│ │ FINAL IP:              1117 ⚔                           │ │
│ │                                                         │ │
│ │ [Optimize: Level Greataxe to 100 for +74 IP]           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
