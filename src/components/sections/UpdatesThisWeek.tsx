'use client'

import { Badge } from '@/components/ui/badge'
import { Sparkles, Bug, Wrench } from 'lucide-react'

const updates = [
  {
    type: 'feature',
    title: 'Build sharing added',
    description: 'Share your builds with the community',
    icon: Sparkles,
    badge: 'New',
    badgeVariant: 'success' as const,
  },
  {
    type: 'fix',
    title: 'Market data accuracy',
    description: 'Fixed price discrepancies in Caerleon',
    icon: Bug,
    badge: 'Fix',
    badgeVariant: 'outline' as const,
  },
  {
    type: 'improvement',
    title: 'Faster calculations',
    description: 'DPS calculator now 3x faster',
    icon: Wrench,
    badge: 'Improved',
    badgeVariant: 'warning' as const,
  },
]

export function UpdatesThisWeek() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-display text-2xl text-text1-light dark:text-text1">
              This Week
            </h2>
            <p className="mt-2 text-muted-light dark:text-muted">
              Latest updates and improvements
            </p>
          </div>

          <div className="rounded-xl border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
            <div className="space-y-4">
              {updates.map((update, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 border-b border-border-light pb-4 last:border-0 last:pb-0 dark:border-border"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <update.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-text1-light dark:text-text1">
                        {update.title}
                      </h4>
                      <Badge variant={update.badgeVariant} className="text-[10px]">
                        {update.badge}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-light dark:text-muted">
                      {update.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
