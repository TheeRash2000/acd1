import { DestinyBoardManager } from '@/components/DestinyBoard/DestinyBoardManager';

export default function DestinyBoardPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text1-light dark:text-text1">Destiny Board</h1>
        <p className="mt-2 text-muted-light dark:text-muted">
          Track your character's mastery and specialization progress. Calculate Item Power and
          Focus costs with Wiki-verified formulas.
        </p>
      </div>

      <DestinyBoardManager />
    </div>
  );
}
