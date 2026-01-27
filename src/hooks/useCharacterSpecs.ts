import { useCharacterSync } from '@/stores/characterSync'

export function useCharacterSpecs(characterName: string) {
  const { characters } = useCharacterSync()
  const character = characters.find((entry) => entry?.name === characterName)

  return {
    specs: character?.specs ?? {},
    hasCharacter: !!character,
    character,
  }
}
