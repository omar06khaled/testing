import { useState } from 'react';
import type { Player } from '../engine/types';

interface FinalWagerScreenProps {
  players: Player[];
  wagers: Record<string, number>;
  onSetWager: (playerId: string, wager: number) => void;
  onContinue: () => void;
}

export const FinalWagerScreen = ({
  players,
  wagers,
  onSetWager,
  onContinue
}: FinalWagerScreenProps) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const eligiblePlayers = players.filter((player) => player.score > 0);

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-brand-800/80 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-accent-500">Final Wagers</h2>
      <p className="mt-2 text-slate-200">
        Players with positive scores can wager up to their current total.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {eligiblePlayers.map((player) => (
          <div key={player.id} className="rounded-xl border border-white/10 bg-brand-700 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{player.name}</h3>
              <span className="text-sm text-slate-300">Max: ${player.score}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={inputs[player.id] ?? ''}
                onChange={(event) =>
                  setInputs((prev) => ({ ...prev, [player.id]: event.target.value }))
                }
                placeholder="Enter wager"
                className="w-40 rounded-lg border border-white/10 bg-brand-600 px-3 py-2 text-lg"
                aria-label={`Wager for ${player.name}`}
              />
              <button
                type="button"
                onClick={() => onSetWager(player.id, Number(inputs[player.id]))}
                className="rounded-lg bg-accent-500 px-4 py-2 font-semibold text-brand-900"
              >
                Lock
              </button>
              {wagers[player.id] !== undefined && (
                <span className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-slate-200">
                  Locked: ${wagers[player.id]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="mt-6 rounded-lg bg-accent-500 px-6 py-3 text-lg font-semibold text-brand-900"
      >
        Reveal Final Clue
      </button>
    </div>
  );
};
