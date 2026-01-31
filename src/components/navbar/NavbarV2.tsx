'use client'

import Link from 'next/link'
import { NavbarDesktop } from './NavbarDesktop'
import { NavbarMobile } from './NavbarMobile'
import { SearchDialog } from './SearchDialog'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/auth'
import { GoldTicker } from '@/components/GoldTicker'

export function NavbarV2() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-surface-light/95 backdrop-blur supports-[backdrop-filter]:bg-surface-light/60 dark:border-border dark:bg-surface/95 dark:supports-[backdrop-filter]:bg-surface/60">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-xl text-accent logo-emboss">
            Albion Codex
          </Link>
          <NavbarDesktop />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />
          <UserMenu />
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
          <NavbarMobile />
        </div>
      </div>

      {/* Gold Ticker */}
      <div className="border-t border-border-light/50 dark:border-border/50">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-1.5 text-xs text-muted-light dark:text-muted">
          <GoldTicker />
        </div>
      </div>
    </header>
  )
}
