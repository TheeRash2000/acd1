'use client';

import { useState } from 'react';
import { useDestinyBoardStore } from '@/stores/destinyBoardStore';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';

export function CharacterSelector() {
  const { characters, activeCharacter, setActiveCharacter, createCharacter, deleteCharacter } =
    useDestinyBoardStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      createCharacter(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this character? This cannot be undone.')) {
      deleteCharacter(id);
    }
  };

  return (
    <div className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-text1-light dark:text-text1">Character</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-accent hover:bg-accent/10"
        >
          <Plus size={16} />
          New
        </button>
      </div>

      {isCreating ? (
        <div className="space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Character name"
            className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewName('');
              }}
              className="flex-1 rounded border border-border-light px-3 py-1.5 text-sm dark:border-border"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {characters.length === 0 ? (
            <p className="text-sm text-muted-light dark:text-muted">
              No characters yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-1">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
                    activeCharacter?.id === char.id
                      ? 'bg-accent/10 text-accent'
                      : 'hover:bg-bg-light/50 dark:hover:bg-bg/50'
                  }`}
                >
                  <button
                    onClick={() => setActiveCharacter(char.id)}
                    className="flex-1 text-left"
                  >
                    {char.name}
                  </button>
                  <button
                    onClick={() => handleDelete(char.id)}
                    className="ml-2 text-muted-light hover:text-red-500 dark:text-muted"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
