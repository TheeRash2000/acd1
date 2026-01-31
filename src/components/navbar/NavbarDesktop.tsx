'use client'

import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import {
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
  ListChecks,
  BookOpen,
  Map,
  Users,
} from 'lucide-react'
import React from 'react'

const toolsItems = [
  {
    title: 'Build Editor',
    href: '/build',
    description: 'Create and share equipment loadouts',
    icon: Sword,
  },
  {
    title: 'Calculator',
    href: '/calculator',
    description: 'Damage, DPS, and stats calculator',
    icon: Calculator,
  },
  {
    title: 'Crafting',
    href: '/craft',
    description: 'Profit calculator for all crafting',
    icon: Hammer,
  },
  {
    title: 'Market Browser',
    href: '/market',
    description: 'Live prices and trends',
    icon: TrendingUp,
  },
  {
    title: 'Heart Runs',
    href: '/heart-runs',
    description: 'Plan efficient heart farming',
    icon: Heart,
  },
  {
    title: 'PvP Tools',
    href: '/pvp',
    description: 'Combat analysis and builds',
    icon: Target,
  },
]

const dataItems = [
  {
    title: 'Destiny Board',
    href: '/destiny-board',
    description: 'Track specs and masteries',
    icon: Compass,
  },
  {
    title: 'Materials',
    href: '/tools/materials',
    description: 'Resource requirements lookup',
    icon: Package,
  },
  {
    title: 'Transport',
    href: '/tools/transport',
    description: 'Route and carry calculations',
    icon: Truck,
  },
  {
    title: 'Islands',
    href: '/tools/islands',
    description: 'Island profit calculator',
    icon: Building2,
  },
  {
    title: 'Flipper',
    href: '/tools/flipper',
    description: 'Find profitable flips',
    icon: Shuffle,
  },
  {
    title: 'Black Market',
    href: '/tools/blackmarket',
    description: 'Black market price analysis',
    icon: CircleDollarSign,
  },
]

const guidesItems = [
  {
    title: 'Guides',
    href: '/guides',
    description: 'Tutorials and strategy guides',
    icon: BookOpen,
  },
  {
    title: 'Community Builds',
    href: '/builds/community',
    description: 'Popular builds from players',
    icon: Users,
  },
  {
    title: 'Roadmap',
    href: '/roadmap',
    description: 'Upcoming features',
    icon: Map,
  },
]

export function NavbarDesktop() {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-text1-light dark:text-text1">
            Tools
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {toolsItems.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-text1-light dark:text-text1">
            Data
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {dataItems.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-text1-light dark:text-text1">
            Guides
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-3 p-4">
              {guidesItems.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/roadmap" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'text-text1-light dark:text-text1')}>
              Updates
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { icon?: React.ElementType }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-surface-light/80 hover:text-accent focus:bg-surface-light/80 focus:text-accent dark:hover:bg-surface/80 dark:focus:bg-surface/80',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-accent" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-light dark:text-muted">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'
