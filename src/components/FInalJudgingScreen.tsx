import type { Player } from '../engine/types';
import { isQuestionForm } from '../engine/rules';

interface FinalJudgingScreenProps {
  players: Player[];
  responses: Record<string, string>;
  wagers: Record<string, number>;
  judging: Record<string, boolean | null>;
  onJudge: (playerId: string, correct: boolean) => void;
  onFinish: () => void;
}

export const FinalJudgingScreen = ({
  players,
  responses,
  wagers,
  judging,
  onJudge,
  onFinish
}: FinalJudgingScreenProps) => {
  const eligiblePlayers = players.filter((player) => player.score > 0);
  const allJudged = eligiblePlayers.every((player) => judging[player.id] !== undefined);

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-brand-800/80 p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-accent-500">Final Judging</h2>
      <div className="mt-6 grid gap-4">
        {eligiblePlayers.map((player) => {
          const response = responses[player.id] ?? '';
          const questionFormOk = response ? isQuestionForm(response) : false;
          return (
            <div key={player.id} className="rounded-xl border border-white/10 bg-brand-700 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{player.name}</h3>
                  <p className="text-sm text-slate-300">Wager: ${wagers[player.id] ?? 0}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onJudge(player.id, true)}
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-50"
                    disabled={!questionFormOk}
                  >
                    Correct
                  </button>
                  <button
                    type="button"
                    onClick={() => onJudge(player.id, false)}
                    className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-rose-950"
                  >
                    Incorrect
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-200">
                <p>
                  <span className="font-semibold">Response:</span> {response || '—'}
                </p>
                {!questionFormOk && response && (
                  <p className="mt-1 text-amber-300">
                    Response not in question form (treated as incorrect by rule).
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onFinish}
        className="mt-6 rounded-lg bg-accent-500 px-6 py-3 text-lg font-semibold text-brand-900 disabled:opacity-50"
        disabled={!allJudged}
      >
        Show Final Results
      </button>
    </div>
  );
};
