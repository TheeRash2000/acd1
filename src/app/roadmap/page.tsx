import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, CheckCircle, Clock, Calendar, Sparkles } from 'lucide-react'

const roadmapSections = [
  {
    phase: 'Completed',
    icon: CheckCircle,
    status: 'success' as const,
    items: [
      { title: 'Build Editor', description: 'Create and share equipment loadouts with full IP calculation' },
      { title: 'Damage Calculator', description: 'DPS and damage rotation simulator' },
      { title: 'Crafting Profit Calculator', description: 'Real-time profit analysis for all craftable items' },
      { title: 'Market Browser', description: 'Live prices from all cities with history charts' },
      { title: 'Destiny Board Tracker', description: 'Track specializations and mastery levels' },
      { title: 'Heart Runs Calculator', description: 'Efficient heart farming route planner' },
      { title: 'Cloud Sync', description: 'Sync your data across devices' },
      { title: 'Community Builds', description: 'Browse and import builds from other players' },
    ],
  },
  {
    phase: 'In Progress',
    icon: Clock,
    status: 'warning' as const,
    items: [
      { title: 'Dashboard', description: 'Personalized command center for all your data' },
      { title: 'Guides Section', description: 'Comprehensive tutorials and strategy guides' },
      { title: 'Advanced Build Comparison', description: 'Side-by-side build analysis with stat diffs' },
    ],
  },
  {
    phase: 'Planned',
    icon: Calendar,
    status: 'outline' as const,
    items: [
      { title: 'Guild Tools', description: 'Member tracking, attendance, and ZvZ planning' },
      { title: 'Mobile App', description: 'Native iOS and Android applications' },
      { title: 'Public API', description: 'Developer access to Albion Codex data' },
      { title: 'Price Alerts', description: 'Get notified when items hit your target price' },
      { title: 'Loadout Presets', description: 'Quick-swap between saved equipment sets' },
      { title: 'Premium Features', description: 'Advanced analytics and unlimited storage' },
    ],
  },
]

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
          <Sparkles className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-text1-light dark:text-text1">
            Roadmap
          </h1>
          <p className="mt-1 text-muted-light dark:text-muted">
            What we&apos;re building for Albion Codex
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {roadmapSections.map((section) => (
          <div key={section.phase}>
            <div className="mb-4 flex items-center gap-2">
              <section.icon
                className={`h-5 w-5 ${
                  section.status === 'success'
                    ? 'text-success'
                    : section.status === 'warning'
                    ? 'text-amber-500'
                    : 'text-muted'
                }`}
              />
              <Badge variant={section.status}>{section.phase}</Badge>
              <span className="text-sm text-muted-light dark:text-muted">
                {section.items.length} items
              </span>
            </div>

            <div className="rounded-xl border border-border-light bg-surface-light dark:border-border dark:bg-surface">
              {section.items.map((item, index) => (
                <div
                  key={item.title}
                  className={`p-4 ${
                    index !== section.items.length - 1
                      ? 'border-b border-border-light dark:border-border'
                      : ''
                  }`}
                >
                  <h3 className="font-medium text-text1-light dark:text-text1">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-light dark:text-muted">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
        <h3 className="font-display text-lg text-accent">Have a Feature Request?</h3>
        <p className="mt-2 text-sm text-muted-light dark:text-muted">
          We&apos;d love to hear your ideas! Join our Discord community or submit
          feedback through the app.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
