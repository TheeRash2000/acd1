'use client'

import { Zap, Shield, RefreshCw } from 'lucide-react'

const features = [
  {
    title: 'Accurate Data',
    description:
      'Verified formulas from game files. IP calculations, damage values, and crafting costs are always correct.',
    icon: Shield,
  },
  {
    title: 'Fast & Lightweight',
    description:
      'No bloat, no ads. Just clean tools that load instantly and work offline when possible.',
    icon: Zap,
  },
  {
    title: 'Always Updated',
    description:
      'Automatic updates with every Albion patch. Market data refreshes every 5 minutes from live APIs.',
    icon: RefreshCw,
  },
]

export function WhyCodex() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl text-text1-light dark:text-text1 md:text-3xl">
            Why Albion Codex?
          </h2>
          <p className="mt-2 text-muted-light dark:text-muted">
            Built by players, for players
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border-light bg-surface-light p-6 text-center dark:border-border dark:bg-surface"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <feature.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-text1-light dark:text-text1">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-light dark:text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
