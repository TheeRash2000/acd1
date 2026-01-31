'use client'

import Link from 'next/link'
import { Sword, Calculator, Hammer, TrendingUp, ArrowRight } from 'lucide-react'

const tools = [
  {
    title: 'Build Editor',
    description: 'Create, compare, and share equipment loadouts with IP calculation',
    href: '/build',
    icon: Sword,
    color: 'from-red-500/20 to-orange-500/20',
  },
  {
    title: 'Damage Calculator',
    description: 'Calculate DPS, damage combos, and optimal spell rotations',
    href: '/calculator',
    icon: Calculator,
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    title: 'Crafting Profit',
    description: 'Find the most profitable items to craft with live market data',
    href: '/craft',
    icon: Hammer,
    color: 'from-amber-500/20 to-yellow-500/20',
  },
  {
    title: 'Market Browser',
    description: 'Track prices, trends, and find arbitrage opportunities',
    href: '/market',
    icon: TrendingUp,
    color: 'from-green-500/20 to-emerald-500/20',
  },
]

export function QuickTools() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl text-text1-light dark:text-text1 md:text-3xl">
            Essential Tools
          </h2>
          <p className="mt-2 text-muted-light dark:text-muted">
            Everything you need to master Albion&apos;s economy and combat
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative overflow-hidden rounded-xl border border-border-light bg-surface-light p-6 transition-all hover:border-accent/50 hover:shadow-lg dark:border-border dark:bg-surface"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <tool.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-text1-light dark:text-text1">
                  {tool.title}
                </h3>
                <p className="mt-2 text-sm text-muted-light dark:text-muted">
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                  Open tool
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
