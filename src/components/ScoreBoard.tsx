import type { Player } from '../engine/types';

const playerKeyMap: Record<number, string> = {
  0: 'A',
  1: 'L',
  2: 'P'
};

interface ScoreboardProps {
  players: Player[];
  currentSelectorId?: string;
}

export const Scoreboard = ({ players, currentSelectorId }: ScoreboardProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {players.map((player, index) => (
        <div
          key={player.id}
          className={`rounded-xl border border-white/10 bg-brand-800 p-4 shadow-md transition ${
            currentSelectorId === player.id ? 'ring-2 ring-accent-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-300">Player {index + 1}</p>
              <h3 className="text-xl font-semibold">{player.name}</h3>
            </div>
            <div className="rounded-full bg-brand-700 px-3 py-1 text-sm font-semibold">
              Key: {playerKeyMap[index]}
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-accent-500">${player.score}</p>
        </div>
      ))}
    </div>
  );
};
