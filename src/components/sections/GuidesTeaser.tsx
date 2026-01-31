'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ArrowRight, Clock } from 'lucide-react'

const guides = [
  {
    title: 'Getting Started with Market Flipping',
    description: 'Learn the basics of buying low and selling high across cities',
    readTime: '5 min',
    category: 'Economy',
    href: '/guides',
  },
  {
    title: 'Optimal Crafting Specialization Path',
    description: 'Which specs to level first for maximum profit efficiency',
    readTime: '8 min',
    category: 'Crafting',
    href: '/guides',
  },
  {
    title: 'PvP Build Tier List',
    description: 'Current meta builds ranked for different content types',
    readTime: '10 min',
    category: 'PvP',
    href: '/guides',
  },
]

export function GuidesTeaser() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-text1-light dark:text-text1">
                Guides
              </h2>
              <p className="text-sm text-muted-light dark:text-muted">
                Learn from the community
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/guides">
              View All Guides
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
              className="group rounded-xl border border-border-light bg-surface-light p-5 transition-all hover:border-accent/50 dark:border-border dark:bg-surface"
            >
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="secondary">{guide.category}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-light dark:text-muted">
                  <Clock className="h-3 w-3" />
                  {guide.readTime}
                </div>
              </div>
              <h3 className="font-semibold text-text1-light group-hover:text-accent dark:text-text1">
                {guide.title}
              </h3>
              <p className="mt-2 text-sm text-muted-light dark:text-muted">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
