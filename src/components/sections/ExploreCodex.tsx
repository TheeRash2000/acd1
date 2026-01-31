'use client'

import Link from 'next/link'
import { Compass, Package, Building2, CircleDollarSign, ArrowRight } from 'lucide-react'

const dataPages = [
  {
    title: 'Destiny Board',
    description: 'Track your specializations and calculate IP gains',
    href: '/destiny-board',
    icon: Compass,
  },
  {
    title: 'Materials Database',
    description: 'Browse all crafting materials and requirements',
    href: '/tools/materials',
    icon: Package,
  },
  {
    title: 'Island Calculator',
    description: 'Calculate farming and housing profits',
    href: '/tools/islands',
    icon: Building2,
  },
  {
    title: 'Black Market',
    description: 'Analyze black market prices and demand',
    href: '/tools/blackmarket',
    icon: CircleDollarSign,
  },
]

export function ExploreCodex() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl text-text1-light dark:text-text1 md:text-3xl">
            Explore Data
          </h2>
          <p className="mt-2 text-muted-light dark:text-muted">
            Deep dive into Albion&apos;s game systems
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dataPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group flex flex-col rounded-xl border border-border-light bg-surface-light p-5 transition-all hover:border-accent/50 dark:border-border dark:bg-surface"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <page.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-text1-light dark:text-text1">
                {page.title}
              </h3>
              <p className="mt-1 flex-1 text-sm text-muted-light dark:text-muted">
                {page.description}
              </p>
              <div className="mt-3 flex items-center gap-1 text-sm font-medium text-accent">
                Explore
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
