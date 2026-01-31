import { useMemo } from 'react'
import { useCharacterSync } from '@/stores/characterSync'

const EMPTY_SPECS: Record<string, number> = {}

export function useCharacterSpecs(characterName: string) {
  const { characters } = useCharacterSync()
  const character = useMemo(
    () => characters.find((entry) => entry?.name === characterName),
    [characters, characterName]
  )

  const specs = useMemo(
    () => character?.specs ?? EMPTY_SPECS,
    [character?.specs]
  )

  return {
    specs,
    hasCharacter: !!character,
    character,
  }
}
