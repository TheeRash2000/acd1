'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Menu,
  Sword,
  Calculator,
  Hammer,
  TrendingUp,
  Heart,
  Compass,
  Package,
  Truck,
  Building2,
  Shuffle,
  CircleDollarSign,
  Target,
  BookOpen,
  Map,
  Users,
  ChevronDown,
  Home,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuSections = [
  {
    title: 'Tools',
    items: [
      { title: 'Build Editor', href: '/build', icon: Sword },
      { title: 'Calculator', href: '/calculator', icon: Calculator },
      { title: 'Crafting', href: '/craft', icon: Hammer },
      { title: 'Market', href: '/market', icon: TrendingUp },
      { title: 'Heart Runs', href: '/heart-runs', icon: Heart },
      { title: 'PvP Tools', href: '/pvp', icon: Target },
    ],
  },
  {
    title: 'Data',
    items: [
      { title: 'Destiny Board', href: '/destiny-board', icon: Compass },
      { title: 'Materials', href: '/tools/materials', icon: Package },
      { title: 'Transport', href: '/tools/transport', icon: Truck },
      { title: 'Islands', href: '/tools/islands', icon: Building2 },
      { title: 'Flipper', href: '/tools/flipper', icon: Shuffle },
      { title: 'Black Market', href: '/tools/blackmarket', icon: CircleDollarSign },
    ],
  },
  {
    title: 'Resources',
    items: [
      { title: 'Guides', href: '/guides', icon: BookOpen },
      { title: 'Community Builds', href: '/builds/community', icon: Users },
      { title: 'Roadmap', href: '/roadmap', icon: Map },
    ],
  },
]

export function NavbarMobile() {
  const [open, setOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="font-display text-accent">AlbionCodex</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text1-light hover:bg-surface-light dark:text-text1 dark:hover:bg-surface"
          >
            <Home className="h-4 w-4 text-accent" />
            Home
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/20"
          >
            <Compass className="h-4 w-4" />
            Open Dashboard
          </Link>

          <div className="my-2 h-px bg-border-light dark:bg-border" />

          {menuSections.map((section) => (
            <div key={section.title}>
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.title ? null : section.title
                  )
                }
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-text1-light hover:bg-surface-light dark:text-text1 dark:hover:bg-surface"
              >
                {section.title}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    expandedSection === section.title && 'rotate-180'
                  )}
                />
              </button>
              {expandedSection === section.title && (
                <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-border-light pl-3 dark:border-border">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-light hover:text-accent dark:text-muted dark:hover:text-accent"
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="my-2 h-px bg-border-light dark:bg-border" />

          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text1-light hover:bg-surface-light dark:text-text1 dark:hover:bg-surface"
          >
            <User className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
