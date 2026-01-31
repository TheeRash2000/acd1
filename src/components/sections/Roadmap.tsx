'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Calendar } from 'lucide-react'

const roadmapItems = [
  {
    phase: 'Now',
    status: 'success' as const,
    icon: CheckCircle,
    items: [
      { title: 'Build Editor', description: 'Full loadout creator with IP calc' },
      { title: 'Market Browser', description: 'Live prices from all cities' },
      { title: 'Crafting Calculator', description: 'Profit analysis for all items' },
    ],
  },
  {
    phase: 'Next',
    status: 'warning' as const,
    icon: Clock,
    items: [
      { title: 'Guild Tools', description: 'Member tracking and ZvZ planner' },
      { title: 'Mobile App', description: 'Native iOS and Android apps' },
      { title: 'API Access', description: 'Public API for developers' },
    ],
  },
  {
    phase: 'Later',
    status: 'outline' as const,
    icon: Calendar,
    items: [
      { title: 'Loadout Sharing', description: 'Public build database' },
      { title: 'Alert System', description: 'Price and event notifications' },
      { title: 'Premium Features', description: 'Advanced analytics and storage' },
    ],
  },
]

export function Roadmap() {
  return (
    <section className="py-12 md:py-16 bg-surface-light/50 dark:bg-surface/50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="font-display text-2xl text-text1-light dark:text-text1 md:text-3xl">
              Roadmap
            </h2>
            <p className="mt-1 text-muted-light dark:text-muted">
              What&apos;s coming to Albion Codex
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/roadmap">View Full Roadmap</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roadmapItems.map((column) => (
            <div
              key={column.phase}
              className="rounded-xl border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface"
            >
              <div className="mb-4 flex items-center gap-2">
                <column.icon
                  className={`h-5 w-5 ${
                    column.status === 'success'
                      ? 'text-success'
                      : column.status === 'warning'
                      ? 'text-amber-500'
                      : 'text-muted'
                  }`}
                />
                <Badge variant={column.status}>{column.phase}</Badge>
              </div>
              <div className="space-y-4">
                {column.items.map((item) => (
                  <div key={item.title}>
                    <h4 className="font-medium text-text1-light dark:text-text1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-light dark:text-muted">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
