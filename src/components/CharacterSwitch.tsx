'use client'
import { useEffect, useRef, useState } from 'react'
import { useDestinyBoardStore } from '@/stores/destinyBoardStore'
import { Modal } from './Modal'
import Link from 'next/link'

export function CharacterSwitch() {
  const [open, setOpen] = useState(false)
  const { characters, activeCharacter, setActiveCharacter, createCharacter } = useDestinyBoardStore((s) => ({
    characters: s.characters,
    activeCharacter: s.activeCharacter,
    setActiveCharacter: s.setActiveCharacter,
    createCharacter: s.createCharacter,
  }))
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newCharName, setNewCharName] = useState('')

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [open])

  const label = activeCharacter ? activeCharacter.name : 'No character'

  const handleCreateCharacter = () => {
    if (newCharName.trim()) {
      createCharacter(newCharName.trim())
      setNewCharName('')
      setShowCreate(false)
      setOpen(false)
    }
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          className="btn-secondary flex min-w-[160px] items-center justify-between gap-2"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <span className="truncate">{label}</span>
          <span className="text-muted-light dark:text-muted">{open ? '^' : 'v'}</span>
        </button>
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border-light bg-surface-light p-2 text-sm shadow-lg dark:border-border dark:bg-surface">
            {characters.length === 0 && (
              <div className="px-2 py-2 text-muted-light dark:text-muted">No saved characters</div>
            )}
            {characters.map((character) => (
              <button
                key={character.id}
                onClick={() => {
                  setActiveCharacter(character.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded px-2 py-2 text-left hover:bg-bg-light dark:hover:bg-bg ${
                  activeCharacter?.id === character.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-text1-light dark:text-text1'
                }`}
                type="button"
              >
                <span className="truncate">{character.name}</span>
                {activeCharacter?.id === character.id && (
                  <span className="text-xs text-accent">active</span>
                )}
              </button>
            ))}
            <div className="mt-1 border-t border-border-light pt-1 dark:border-border">
              <button
                onClick={() => {
                  setShowCreate(true)
                }}
                className="btn-forge w-full text-left"
                type="button"
              >
                + Create new
              </button>
              <Link
                href="/destiny-board"
                className="mt-1 block w-full rounded px-2 py-2 text-left text-accent hover:bg-accent/10"
                onClick={() => setOpen(false)}
              >
                Manage in Destiny Board
              </Link>
            </div>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Character">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-light dark:text-muted">
              Character Name
            </label>
            <input
              type="text"
              value={newCharName}
              onChange={(e) => setNewCharName(e.target.value)}
              placeholder="Enter character name"
              className="w-full rounded-lg border border-border-light bg-bg-light px-3 py-2 text-text1-light dark:border-border dark:bg-bg dark:text-text1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCharacter()
                }
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="btn-secondary"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCharacter}
              className="btn-primary"
              disabled={!newCharName.trim()}
              type="button"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
