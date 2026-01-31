'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Sword, Calculator, Hammer, TrendingUp, Compass, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const quickLinks = [
  { title: 'Build Editor', href: '/build', icon: Sword },
  { title: 'Calculator', href: '/calculator', icon: Calculator },
  { title: 'Crafting', href: '/craft', icon: Hammer },
  { title: 'Market', href: '/market', icon: TrendingUp },
  { title: 'Destiny Board', href: '/destiny-board', icon: Compass },
  { title: 'Guides', href: '/guides', icon: BookOpen },
]

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const filteredLinks = query
    ? quickLinks.filter((link) =>
        link.title.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks

  const handleSelect = (href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-light dark:text-muted">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search AlbionCodex</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Input
            placeholder="Search tools, guides, items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-4"
            autoFocus
          />
          <div className="text-xs text-muted-light dark:text-muted mb-2">
            {query ? 'Results' : 'Quick Links'}
          </div>
          <div className="flex flex-col gap-1">
            {filteredLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleSelect(link.href)}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-text1-light hover:bg-surface-light dark:text-text1 dark:hover:bg-surface"
              >
                <div className="flex items-center gap-2">
                  <link.icon className="h-4 w-4 text-accent" />
                  {link.title}
                </div>
                <ArrowRight className="h-3 w-3 text-muted-light dark:text-muted" />
              </button>
            ))}
            {query && filteredLinks.length === 0 && (
              <div className="py-4 text-center text-sm text-muted-light dark:text-muted">
                No results found for &quot;{query}&quot;
              </div>
            )}
          </div>
          {query && (
            <Link
              href={`/market?search=${encodeURIComponent(query)}`}
              onClick={() => setOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/20"
            >
              <Search className="h-4 w-4" />
              Search &quot;{query}&quot; in Market
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
