'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sword, Calculator, Hammer, TrendingUp, CheckCircle } from 'lucide-react'

const topTools = [
  { name: 'Build Editor', href: '/build', icon: Sword },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
  { name: 'Crafting', href: '/craft', icon: Hammer },
  { name: 'Market', href: '/market', icon: TrendingUp },
]

const trustPoints = [
  'Accurate formulas',
  'Fast tools',
  'Updated frequently',
]

export function HeroHybrid() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 dark:from-accent/10 dark:to-accent/5" />

      {/* Faint AC watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
        <span className="font-display text-[20rem] text-accent">AC</span>
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Content */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-display text-4xl text-accent md:text-5xl lg:text-6xl">
                Albion Codex
              </h1>
              <p className="mt-4 text-lg text-muted-light dark:text-muted md:text-xl">
                Builds, damage, economy, and PvP tools — all in one place.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/calculator">Try Calculator</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/guides">Browse Guides</Link>
              </Button>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-light dark:text-muted">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {point}
                </div>
              ))}
            </div>

            {/* Tool pills */}
            <div className="flex flex-wrap gap-2">
              {topTools.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-accent/10 hover:border-accent transition-colors cursor-pointer"
                  >
                    <tool.icon className="h-3.5 w-3.5 text-accent" />
                    {tool.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Preview cards */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <PreviewCard
                title="Build Editor"
                value="1,247 IP"
                subtitle="Claymore Build"
                delay={0}
              />
              <PreviewCard
                title="Damage Calc"
                value="3,482 DPS"
                subtitle="6.3 Rotation"
                delay={100}
              />
              <PreviewCard
                title="Crafting"
                value="+284k"
                subtitle="Daily profit"
                delay={200}
              />
              <PreviewCard
                title="Market"
                value="↑ 12.4%"
                subtitle="Royal Cowl trend"
                delay={300}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PreviewCard({
  title,
  value,
  subtitle,
  delay,
}: {
  title: string
  value: string
  subtitle: string
  delay: number
}) {
  return (
    <div
      className="rounded-xl border border-border-light bg-surface-light/80 p-4 backdrop-blur transition-transform hover:-translate-y-1 hover:border-accent/50 dark:border-border dark:bg-surface/80"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-xs text-muted-light dark:text-muted">{title}</div>
      <div className="mt-1 font-display text-xl text-accent">{value}</div>
      <div className="mt-0.5 text-xs text-muted-light dark:text-muted">
        {subtitle}
      </div>
    </div>
  )
}
