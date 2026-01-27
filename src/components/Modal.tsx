'use client'
import { useEffect, useRef } from 'react'

type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="w-full max-w-xl rounded-xl border border-border-light bg-surface-light p-5 shadow-xl dark:border-border dark:bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        {title && <h2 className="mb-4 text-lg font-semibold text-text1-light dark:text-text1">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
