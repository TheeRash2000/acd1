'use client';

import HeartRunsCalculator from '@/components/HeartRunsCalculator';

export default function HeartRunsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">Heart Runs</h1>
          <p className="text-slate-400 text-lg">Faction Trade Missions Profitability Calculator</p>
        </div>

        {/* Calculator */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
          <HeartRunsCalculator />
        </div>

        {/* Info Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded p-4">
            <h3 className="text-amber-400 font-semibold mb-2">📊 Market Data</h3>
            <p className="text-sm text-slate-400">
              Prices updated from Albion Online Data API. Last update shown in calculator.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded p-4">
            <h3 className="text-amber-400 font-semibold mb-2">🎯 How It Works</h3>
            <p className="text-sm text-slate-400">
              Select a faction, check item prices, and see estimated profit for each mission type.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded p-4">
            <h3 className="text-amber-400 font-semibold mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-slate-400">
              Override prices to simulate market scenarios and find best timing for runs.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
