import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, BookOpen, Clock, ArrowRight } from 'lucide-react'

const guides = [
  {
    title: 'Getting Started with Albion Codex',
    description: 'Learn how to use all the tools and features available',
    readTime: '3 min',
    category: 'Beginner',
  },
  {
    title: 'Market Flipping 101',
    description: 'The basics of buying low and selling high across cities',
    readTime: '5 min',
    category: 'Economy',
  },
  {
    title: 'Optimal Crafting Path',
    description: 'Which specializations to level first for maximum profit',
    readTime: '8 min',
    category: 'Crafting',
  },
  {
    title: 'PvP Build Tier List',
    description: 'Current meta builds ranked for different content',
    readTime: '10 min',
    category: 'PvP',
  },
  {
    title: 'Island Farming Guide',
    description: 'Maximize your island returns with crop rotations',
    readTime: '6 min',
    category: 'Economy',
  },
  {
    title: 'Heart Runs Explained',
    description: 'Efficient routes for heart farming in Albion',
    readTime: '4 min',
    category: 'PvE',
  },
]

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text1-light dark:text-text1">
          Guides
        </h1>
        <p className="mt-2 text-muted-light dark:text-muted">
          Learn from the community and master Albion Online
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-blue-400">Guides Coming Soon</h3>
            <p className="mt-1 text-sm text-muted-light dark:text-muted">
              We&apos;re working on comprehensive guides for all aspects of Albion Online.
              In the meantime, check out the community builds and tools!
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <div
            key={guide.title}
            className="rounded-xl border border-border-light bg-surface-light p-5 dark:border-border dark:bg-surface"
          >
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="secondary">{guide.category}</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-light dark:text-muted">
                <Clock className="h-3 w-3" />
                {guide.readTime}
              </div>
            </div>
            <h3 className="font-semibold text-text1-light dark:text-text1">
              {guide.title}
            </h3>
            <p className="mt-2 text-sm text-muted-light dark:text-muted">
              {guide.description}
            </p>
            <p className="mt-3 text-xs text-muted-light dark:text-muted italic">
              Coming soon...
            </p>
          </div>
        ))}
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
