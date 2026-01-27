'use client'
import Link from 'next/link'
import { useState } from 'react'
import { CharacterImport } from './CharacterImport'
import { Icon } from './Icon'
import { Modal } from './Modal'

export function LandingEmpty() {
  const [showTutorial, setShowTutorial] = useState(false)
  const [showCharacterImport, setShowCharacterImport] = useState(false)

  return (
    <div className="grid gap-6 rounded-xl border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
      <h1 className="font-display text-2xl text-text1-light dark:text-text1">Welcome to AlbionCodex</h1>
      <p className="text-muted-light dark:text-muted">Track every silver.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardAction
          iconName="T4_BAG"
          title="Add Character"
          desc="Import from killboard in 10 s"
          onClick={() => setShowCharacterImport(true)}
        />
        <CardLink iconName="T4_MAIN_SWORD" title="Browse Market" desc="Pick your first item to watch" href="/market" />
        <CardLink
          iconName="T4_2H_HAMMER"
          title="Crafting Calc"
          desc="Find profit before you craft"
          href="/craft"
        />
        <CardAction
          iconName="T4_OFF_BOOK"
          title="Tutorial"
          desc="30 sec intro video"
          onClick={() => setShowTutorial(true)}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EmptyCard title="Focus Timers" />
        <EmptyCard title="Market Faves" />
        <EmptyCard title="Recent Activity" />
        <EmptyCard title="Silver Trend (7 d)" />
      </div>

      <Modal open={showCharacterImport} onClose={() => setShowCharacterImport(false)} title="Add Character">
        <CharacterImport onImported={() => setShowCharacterImport(false)} />
      </Modal>

      <Modal open={showTutorial} onClose={() => setShowTutorial(false)} title="AlbionCodex Tutorial">
        <div className="relative w-full overflow-hidden rounded-lg border border-border-light pt-[56.25%] dark:border-border">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/VIDEO_ID"
            title="AlbionCodex tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Modal>
    </div>
  )
}

function CardLink({
  iconName,
  title,
  desc,
  href,
}: {
  iconName: string
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="parchment rune-border glow-accent p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon itemName={iconName} size={36} className="rounded bg-surface-light p-1 dark:bg-surface" />
        <div className="font-semibold text-text1-light dark:text-text1">{title}</div>
      </div>
      <div className="text-sm text-muted-light dark:text-muted">{desc}</div>
    </Link>
  )
}

function CardAction({
  iconName,
  title,
  desc,
  onClick,
}: {
  iconName: string
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      className="parchment rune-border glow-accent p-4 text-left"
      onClick={onClick}
      type="button"
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon itemName={iconName} size={36} className="rounded bg-surface-light p-1 dark:bg-surface" />
        <div className="font-semibold text-text1-light dark:text-text1">{title}</div>
      </div>
      <div className="text-sm text-muted-light dark:text-muted">{desc}</div>
    </button>
  )
}

function EmptyCard({ title }: { title: string }) {
  return (
    <div className="parchment rune-border p-4">
      <div className="mb-2 text-sm text-muted-light dark:text-muted">{title}</div>
      <div className="text-xs text-muted-light dark:text-muted">Empty - data will appear here</div>
    </div>
  )
}
