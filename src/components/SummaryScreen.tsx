import type { Player } from '../engine/types';

interface SummaryScreenProps {
  players: Player[];
  onRestart: () => void;
}

export const SummaryScreen = ({ players, onRestart }: SummaryScreenProps) => {
  const winner = [...players].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="mx-auto max-w-5xl rounded-2xl bg-brand-800/80 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-accent-500">Final Scores</h2>
      <p className="mt-2 text-xl text-slate-200">
        Winner: <span className="font-bold text-accent-500">{winner?.name}</span>
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {players.map((player) => (
          <div key={player.id} className="rounded-xl border border-white/10 bg-brand-700 p-4">
            <h3 className="text-lg font-semibold">{player.name}</h3>
            <p className="mt-2 text-2xl font-bold text-accent-500">${player.score}</p>
            <div className="mt-3 text-sm text-slate-200">
              <p>Correct: {player.stats.correct}</p>
              <p>Wrong: {player.stats.wrong}</p>
              <p>Total attempts: {player.stats.totalAttempts}</p>
              <p>
                Daily Doubles: {player.stats.dailyDoubleAttempts} attempted,{' '}
                {player.stats.dailyDoubleCorrect} correct
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="mt-6 rounded-lg bg-accent-500 px-6 py-3 text-lg font-semibold text-brand-900"
      >
        Play Again
      </button>
    </div>
  );
};
