'use client'
import { useEffect, useRef, useState } from 'react'
import { useCharacters } from '@/stores/characters'
import { CharacterImport } from './CharacterImport'
import { Modal } from './Modal'

export function CharacterSwitch() {
  const [open, setOpen] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const { characters, activeName, setActiveName } = useCharacters((s) => ({
    characters: s.characters,
    activeName: s.activeName,
    setActiveName: s.setActiveName,
  }))
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [open])

  const active = characters.find((item) => item.name === activeName) ?? characters[0]
  const label = active ? `${active.name} · ${active.server}` : 'No character'

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
          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border-light bg-surface-light p-2 text-sm shadow-lg dark:border-border dark:bg-surface">
            {characters.length === 0 && (
              <div className="px-2 py-2 text-muted-light dark:text-muted">No saved characters</div>
            )}
            {characters.map((character) => (
              <button
                key={`${character.name}-${character.server}`}
                onClick={() => {
                  setActiveName(character.name)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-text1-light hover:bg-bg-light dark:text-text1 dark:hover:bg-bg"
                type="button"
              >
                <span className="truncate">{character.name}</span>
                <span className="text-xs text-muted-light dark:text-muted">{character.server}</span>
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false)
                setShowImport(true)
              }}
              className="btn-forge mt-1 w-full text-left"
              type="button"
            >
              + Add new
            </button>
          </div>
        )}
      </div>

      <Modal open={showImport} onClose={() => setShowImport(false)} title="Add Character">
        <CharacterImport onImported={() => setShowImport(false)} />
      </Modal>
    </>
  )
}
