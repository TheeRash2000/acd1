'use client'
import Link from 'next/link'
import { CharacterSwitch } from './CharacterSwitch'
import { GoldTicker } from './GoldTicker'
import { ThemeToggle } from './ThemeToggle'
export function Navbar() {
  return (
    <header className="parchment border-b border-amber-400/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-xl text-accent logo-emboss">
            AlbionCodex
          </Link>
          <nav className="flex items-center gap-3 text-xs text-text1-light dark:text-text1">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <Link href="/character-sync" className="hover:text-accent">
              Destiny Board
            </Link>
            <div className="group relative">
              <button
                type="button"
                className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs text-text1-light hover:text-accent dark:border-border dark:bg-bg dark:text-text1"
              >
                Tools
              </button>
              <div className="absolute left-0 top-full z-30 mt-2 hidden w-44 rounded-lg border border-border-light bg-surface-light p-2 text-xs shadow-lg group-hover:block group-focus-within:block dark:border-border dark:bg-surface">
                <div className="grid gap-1">
                  <Link href="/calculator" className="rounded px-2 py-1 hover:bg-bg-light dark:hover:bg-bg">
                    Calculator
                  </Link>
                  <Link href="/craft" className="rounded px-2 py-1 hover:bg-bg-light dark:hover:bg-bg">
                    Craft
                  </Link>
                  <Link href="/build" className="rounded px-2 py-1 hover:bg-bg-light dark:hover:bg-bg">
                    Build
                  </Link>
                  <Link href="/pvp" className="rounded px-2 py-1 hover:bg-bg-light dark:hover:bg-bg">
                    PvP
                  </Link>
                  <Link href="/market" className="rounded px-2 py-1 hover:bg-bg-light dark:hover:bg-bg">
                    Market
                  </Link>
                  <Link href="/heart-runs" className="rounded px-2 py-1 hover:bg-bg-light dark:hover:bg-bg">
                    Heart Runs
                  </Link>
                  <Link href="/character-sync" className="rounded px-2 py-1 hover:bg-bg-light dark:hover:bg-bg">
                    Destiny Board
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <CharacterSwitch />
          <ThemeToggle />
        </div>
      </div>
      <div className="border-t border-amber-400/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-muted-light dark:text-muted">
          <GoldTicker />
        </div>
      </div>
    </header>
  )
}
