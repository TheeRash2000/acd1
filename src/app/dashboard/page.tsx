import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Compass, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Compass className="h-8 w-8 text-accent" />
        </div>
        <h1 className="font-display text-3xl text-text1-light dark:text-text1">
          Dashboard
        </h1>
        <p className="mt-4 text-muted-light dark:text-muted">
          Your personalized command center is coming soon. Track your characters,
          builds, market favorites, and more — all in one place.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/build">
              Try Build Editor
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
