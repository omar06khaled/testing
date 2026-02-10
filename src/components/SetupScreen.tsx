import { useState } from 'react';

interface SetupScreenProps {
  onStart: (names: string[]) => void;
}

export const SetupScreen = ({ onStart }: SetupScreenProps) => {
  const [names, setNames] = useState(['', '', '']);

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((name, idx) => (idx === index ? value : name)));
  };

  const canStart = names.every((name) => name.trim().length > 0);

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-brand-800/80 p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-accent-500">Trivia Board Showdown</h1>
      <p className="mt-2 text-slate-200">
        Enter player names to begin. Clues are shown as answers — respond in the form of a question.
      </p>
      <div className="mt-6 grid gap-4">
        {names.map((name, index) => (
          <label key={`player-${index}`} className="grid gap-2">
            <span className="text-sm uppercase tracking-wide text-slate-300">Player {index + 1}</span>
            <input
              value={name}
              onChange={(event) => updateName(index, event.target.value)}
              placeholder={`Contestant ${index + 1}`}
              className="rounded-lg border border-white/10 bg-brand-700 px-4 py-3 text-lg text-white"
              aria-label={`Player ${index + 1} name`}
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onStart(names.map((name) => name.trim()))}
        className="mt-6 w-full rounded-lg bg-accent-500 px-6 py-3 text-lg font-semibold text-brand-900 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canStart}
      >
        Start Game
      </button>
    </div>
  );
};
