# Albion Codex

A comprehensive toolkit for Albion Online players featuring crafting calculators, market analysis, build planning, and economy tools.

## Features

### Crafting Calculators
- **Gear Crafting** (`/craft/gear`) - Equipment crafting with profit analysis, RRR calculations, quality chances
- **Food Crafting** (`/craft/food`) - Food recipes with ingredient costs and profit margins
- **Potion Crafting** (`/craft/potions`) - Potion recipes with profitability analysis
- **Refining Calculator** (`/craft/refining`) - Material refining with focus cost efficiency

### Economy Tools (`/tools`)
- **Material Price Finder** (`/tools/materials`) - Compare material prices across all cities with buy/sell orders, volume, and price history charts
- **Transport Calculator** (`/tools/transport`) - Calculate profitable material hauling routes with sell strategy options
- **Item Flipper** (`/tools/flipper`) - Find arbitrage opportunities between cities (includes Black Market support)
- **Black Market Flipper** (`/tools/blackmarket`) - Craft items specifically for selling to the Black Market in Caerleon
- **Island Management** (`/tools/islands`) - Manage island plots, workers, and farming calculations with city bonus support

### Build & Combat
- **Build Planner** (`/build`) - Create equipment loadouts with IP calculations
- **Market Browser** (`/market`) - Live prices from Albion Online Data Project
- **Destiny Board** (`/destiny-board`) - Track character progression, masteries, and specializations
- **Heart Runs** (`/heart-runs`) - Calculate Avalonian dungeon profitability

## Key Features

### Black Market Integration
The Black Market in Caerleon is fully supported:
- **Only accepts equipment** (weapons, armor, off-hands) - not food/potions
- **Buy orders only** - You sell TO it, cannot buy FROM it
- **No market tax** when selling to BM buy orders
- **Quality-aware** - Higher quality items can fill lower quality orders
- Available in Gear Crafting calculator and Item Flipper

### Resource Return Rate (RRR) System
Comprehensive RRR calculations including:
- City base bonuses (18% in royal cities)
- Crafting specialty bonus (+15% in bonus city)
- Focus bonus (+59%)
- Hideout power levels (1-9)
- Zone quality levels (1-6)
- Daily bonus multipliers

### Destiny Board Integration
Economy tree masteries properly connected to crafting:
- Crafting masteries (not combat) affect Focus Cost Efficiency
- Supports all crafting categories: weapons, armor, tools, cooking, alchemy
- Quality chances based on specialization level

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework |
| TypeScript | Type safety |
| Zustand | State management with persistence |
| Tailwind CSS | Styling with dark mode |
| TanStack Table | Data tables |
| Recharts | Price history charts |
| SWR | Data fetching |

## Data Sources

- **Item Data**: [ao-bin-dumps](https://github.com/broderickhyman/ao-bin-dumps) - Game data extraction
- **Market Prices**: [Albion Online Data Project](https://www.albion-online-data.com/) - Live market prices
- **Crafting Recipes**: Goldenium spreadsheet data

## Getting Started

```bash
# Install dependencies
npm install

# Fetch game data and start development server
npm run dev

# Production build
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js pages and routes
│   ├── craft/              # Crafting calculators (gear, food, potions, refining)
│   ├── tools/              # Economy tools (materials, transport, flipper, blackmarket, islands)
│   ├── build/              # Build planner
│   ├── market/             # Market browser
│   ├── destiny-board/      # Character progression
│   └── api/                # API routes (market, gold, killboard)
├── components/             # React components
├── lib/                    # Business logic
│   ├── crafting/           # Crafting calculations
│   ├── calculators/        # IP and Focus calculators
│   ├── combat/             # Damage calculations
│   ├── destiny-board/      # Mastery definitions
│   └── island/             # Island management
├── stores/                 # Zustand state stores
├── constants/              # Game constants and bonuses
└── types/                  # TypeScript definitions
```

## Market Servers

Supports all Albion Online servers:
- Americas (West)
- Europe
- Asia (East)

## Cities Supported

**Royal Cities** (with crafting bonuses):
- Bridgewatch (Stone)
- Fort Sterling (Wood)
- Lymhurst (Fiber/Cloth)
- Martlock (Hide/Leather)
- Thetford (Ore/Metal)

**Other Locations**:
- Caerleon (neutral city + Black Market)
- Brecilien (Roads hub)
- Black Market (equipment only, buy orders only)

## Documentation

- [Master Document](ALBIONCODEX_MASTER_DOCUMENT.md) - Complete system reference
- [System Architecture](SYSTEM_ARCHITECTURE_CANON.md) - Technical architecture
- [Data Provenance](DATA_PROVENANCE_AUDIT.md) - Data source audit
- [Destiny Board](DESTINY_BOARD_IMPLEMENTATION.md) - Destiny board details

## Contributing

This project uses data from the Albion Online game. Ensure any contributions:
1. Use economy/crafting masteries for crafting calculations (not combat masteries)
2. Handle Black Market correctly (sell only, no tax, equipment only)
3. Maintain separation between Caerleon city and Black Market
4. Calculate profit as: `revenue - cost` (sell price - buy/craft cost)

## License

This project is for educational and personal use. Albion Online is a trademark of Sandbox Interactive GmbH.
