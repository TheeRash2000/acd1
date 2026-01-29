'use client'

import Link from 'next/link'

const TOOLS = [
  {
    name: 'Material Price Finder',
    description: 'Compare material prices across all cities to find the best deals.',
    href: '/tools/materials',
    icon: '📊',
  },
  {
    name: 'Transport Calculator',
    description: 'Find the most profitable materials to haul between cities.',
    href: '/tools/transport',
    icon: '🚚',
  },
  {
    name: 'Item Flipper',
    description: 'Find arbitrage opportunities - buy low, sell high across cities.',
    href: '/tools/flipper',
    icon: '💱',
  },
  {
    name: 'Decision Maker',
    description: 'Analyze which items are profitable to craft with current prices.',
    href: '/tools/decision',
    icon: '🎯',
  },
  {
    name: 'Crafting Queue',
    description: 'Plan your crafting and generate a shopping list for materials.',
    href: '/tools/queue',
    icon: '📝',
  },
  {
    name: 'Black Market Flipper',
    description: 'Find profitable items to craft and sell to the Black Market.',
    href: '/tools/blackmarket',
    icon: '🏴',
  },
  {
    name: 'Island Management',
    description: 'Manage islands, workers, and track farming operations with input/output calculations.',
    href: '/tools/islands',
    icon: '🏝️',
  },
]

const CALCULATORS = [
  {
    name: 'Gear Crafting',
    description: 'Calculate profit for gear crafting with live market prices.',
    href: '/craft/gear',
  },
  {
    name: 'Food Crafting',
    description: 'Calculate profit for food crafting with live market prices.',
    href: '/craft/food',
  },
  {
    name: 'Potion Crafting',
    description: 'Calculate profit for potion crafting with live market prices.',
    href: '/craft/potions',
  },
  {
    name: 'Refining',
    description: 'Calculate profit for refining raw materials.',
    href: '/craft/refining',
  },
]

export default function ToolsPage() {
  return (
    <section className="grid gap-6">
      <header>
        <h1 className="font-display text-2xl text-text1-light dark:text-text1">
          Trading & Crafting Tools
        </h1>
        <p className="text-sm text-muted-light dark:text-muted">
          Tools to help you maximize profit in Albion Online.
        </p>
      </header>

      {/* Tools Section */}
      <div>
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">Trading Tools</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl border border-border-light bg-surface-light p-6 transition-colors hover:border-amber-400/50 hover:bg-amber-400/5 dark:border-border dark:bg-surface"
            >
              <div className="mb-2 text-3xl">{tool.icon}</div>
              <h3 className="mb-2 font-medium text-text1-light group-hover:text-amber-400 dark:text-text1">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-light dark:text-muted">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Calculators Section */}
      <div>
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">Crafting Calculators</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="group rounded-2xl border border-border-light bg-surface-light p-4 transition-colors hover:border-amber-400/50 hover:bg-amber-400/5 dark:border-border dark:bg-surface"
            >
              <h3 className="mb-1 font-medium text-text1-light group-hover:text-amber-400 dark:text-text1">
                {calc.name}
              </h3>
              <p className="text-xs text-muted-light dark:text-muted">
                {calc.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">Quick Start Guide</h2>
        <div className="space-y-3 text-sm text-muted-light dark:text-muted">
          <p>
            <span className="font-medium text-amber-400">1. Check Material Prices</span> - Use the Material Price Finder to see where materials are cheapest.
          </p>
          <p>
            <span className="font-medium text-amber-400">2. Plan Your Crafting</span> - Use the Decision Maker to find profitable items to craft.
          </p>
          <p>
            <span className="font-medium text-amber-400">3. Create Shopping List</span> - Add items to your Crafting Queue to generate a material shopping list.
          </p>
          <p>
            <span className="font-medium text-amber-400">4. Optimize Transport</span> - Use the Transport Calculator if you need to move materials between cities.
          </p>
          <p>
            <span className="font-medium text-amber-400">5. Find Flips</span> - Check the Item Flipper for quick arbitrage opportunities.
          </p>
        </div>
      </div>
    </section>
  )
}
