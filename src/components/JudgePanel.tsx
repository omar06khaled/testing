import type { RoundData } from '../engine/types';

interface GameBoardProps {
  roundLabel: string;
  roundData: RoundData;
  clueStatus: boolean[][];
  onSelect: (categoryIndex: number, clueIndex: number) => void;
}

export const GameBoard = ({ roundLabel, roundData, clueStatus, onSelect }: GameBoardProps) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-800/60 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-accent-500">{roundLabel}</h2>
        <p className="text-sm text-slate-300">Select an available clue.</p>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-2 text-center text-sm uppercase text-slate-200">
        {roundData.categories.map((category) => (
          <div key={category.name} className="rounded-lg bg-brand-700 p-3 font-semibold">
            {category.name}
          </div>
        ))}
        {roundData.categories.map((category, categoryIndex) =>
          category.clues.map((clue, clueIndex) => {
            const used = clueStatus[categoryIndex][clueIndex];
            return (
              <button
                key={`${category.name}-${clue.value}`}
                type="button"
                onClick={() => onSelect(categoryIndex, clueIndex)}
                disabled={used}
                className={`rounded-lg border border-white/10 p-4 text-lg font-bold transition md:text-xl ${
                  used
                    ? 'bg-brand-900/60 text-brand-300 line-through'
                    : 'bg-brand-700 text-accent-500 hover:bg-brand-600'
                }`}
                aria-label={`Clue value ${clue.value} in ${category.name}`}
              >
                ${clue.value}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
