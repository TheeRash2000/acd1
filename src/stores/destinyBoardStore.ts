/**
 * Destiny Board Store
 * Manages character sheets with mastery and specialization levels
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterSheet, DestinyBoardState } from '@/types/destiny-board';

interface DestinyBoardStore extends DestinyBoardState {
  // Additional helper methods
  getCharacter: (characterId: string) => CharacterSheet | undefined;
  getMasteryLevel: (characterId: string, masteryId: string) => number;
  getSpecializationLevel: (characterId: string, specId: string) => number;
}

export const useDestinyBoardStore = create<DestinyBoardStore>()(
  persist(
    (set, get) => ({
      activeCharacter: null,
      characters: [],

      setActiveCharacter: (characterId: string) => {
        const character = get().characters.find((c) => c.id === characterId);
        if (character) {
          set({ activeCharacter: character });
        }
      },

      createCharacter: (name: string) => {
        const newCharacter: CharacterSheet = {
          id: `char_${Date.now()}`,
          name,
          masteries: {},
          specializations: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          characters: [...state.characters, newCharacter],
          activeCharacter: newCharacter,
        }));

        return newCharacter;
      },

      deleteCharacter: (characterId: string) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== characterId),
          activeCharacter:
            state.activeCharacter?.id === characterId
              ? state.characters[0] || null
              : state.activeCharacter,
        }));
      },

      updateMastery: (characterId: string, masteryId: string, level: number) => {
        set((state) => ({
          characters: state.characters.map((char) =>
            char.id === characterId
              ? {
                  ...char,
                  masteries: {
                    ...char.masteries,
                    [masteryId]: Math.max(0, Math.min(100, level)),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : char
          ),
          activeCharacter:
            state.activeCharacter?.id === characterId
              ? {
                  ...state.activeCharacter,
                  masteries: {
                    ...state.activeCharacter.masteries,
                    [masteryId]: Math.max(0, Math.min(100, level)),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : state.activeCharacter,
        }));
      },

      updateSpecialization: (characterId: string, specId: string, level: number) => {
        set((state) => ({
          characters: state.characters.map((char) =>
            char.id === characterId
              ? {
                  ...char,
                  specializations: {
                    ...char.specializations,
                    [specId]: Math.max(0, Math.min(120, level)),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : char
          ),
          activeCharacter:
            state.activeCharacter?.id === characterId
              ? {
                  ...state.activeCharacter,
                  specializations: {
                    ...state.activeCharacter.specializations,
                    [specId]: Math.max(0, Math.min(120, level)),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : state.activeCharacter,
        }));
      },

      importCharacterData: (data: Partial<CharacterSheet>) => {
        const imported: CharacterSheet = {
          id: `char_${Date.now()}`,
          name: data.name || 'Imported Character',
          masteries: data.masteries || {},
          specializations: data.specializations || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          characters: [...state.characters, imported],
          activeCharacter: imported,
        }));
      },

      exportCharacterData: (characterId: string) => {
        const character = get().characters.find((c) => c.id === characterId);
        if (!character) return '';

        return JSON.stringify(character, null, 2);
      },

      // Helper methods
      getCharacter: (characterId: string) => {
        return get().characters.find((c) => c.id === characterId);
      },

      getMasteryLevel: (characterId: string, masteryId: string) => {
        const character = get().getCharacter(characterId);
        return character?.masteries[masteryId] || 0;
      },

      getSpecializationLevel: (characterId: string, specId: string) => {
        const character = get().getCharacter(characterId);
        return character?.specializations[specId] || 0;
      },
    }),
    {
      name: 'destiny-board-storage',
      version: 1,
    }
  )
);
