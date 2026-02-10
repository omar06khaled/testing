import { useMemo, useState } from 'react';
import type { Clue } from '../engine/types';
import { QUESTION_PREFIXES } from '../engine/rules';

interface ClueModalProps {
  clue: Clue;
  isDailyDouble: boolean;
  dailyDoubleWager?: number;
  canReveal: boolean;
  buzzTime: number;
  buzzEnabled: boolean;
  buzzedPlayerName?: string;
  responseDisabled: boolean;
  answerNeedsRephrase: boolean;
  onSetWager: (wager: number) => void;
  onReveal: () => void;
  onSubmitResponse: (response: string) => void;
}

export const ClueModal = ({
  clue,
  isDailyDouble,
  dailyDoubleWager,
  canReveal,
  buzzTime,
  buzzEnabled,
  buzzedPlayerName,
  responseDisabled,
  answerNeedsRephrase,
  onSetWager,
  onReveal,
  onSubmitResponse
}: ClueModalProps) => {
  const [wagerInput, setWagerInput] = useState('');
  const [responseInput, setResponseInput] = useState('');

  const questionHint = useMemo(
    () => QUESTION_PREFIXES.map((prefix) => `“${prefix}...”`).join(', '),
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-brand-800 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-accent-500">
            {isDailyDouble ? 'Daily Double!' : 'Clue'}
          </h3>
          {buzzEnabled && (
            <span className="rounded-full bg-brand-700 px-3 py-1 text-sm font-semibold text-slate-200">
              Buzz window: {buzzTime}s
            </span>
          )}
        </div>
        <p className="mt-4 text-xl leading-relaxed">{clue.clue}</p>

        {isDailyDouble && (
          <div className="mt-6 rounded-xl border border-accent-500/40 bg-brand-700/60 p-4">
            <p className="text-sm uppercase tracking-wide text-slate-300">Daily Double Wager</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <input
                value={wagerInput}
                onChange={(event) => setWagerInput(event.target.value)}
                placeholder="Enter wager"
                className="w-48 rounded-lg border border-white/10 bg-brand-700 px-3 py-2 text-lg"
                aria-label="Daily Double wager"
              />
              <button
                type="button"
                onClick={() => onSetWager(Number(wagerInput))}
                className="rounded-lg bg-accent-500 px-4 py-2 font-semibold text-brand-900"
              >
                Lock Wager
              </button>
              {dailyDoubleWager !== undefined && (
                <span className="rounded-lg bg-brand-700 px-4 py-2 text-sm text-slate-200">
                  Wager locked: ${dailyDoubleWager}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onReveal}
            className="rounded-lg bg-accent-500 px-5 py-2 text-lg font-semibold text-brand-900 disabled:opacity-50"
            disabled={!canReveal}
          >
            {isDailyDouble ? 'Reveal & Answer' : 'Reveal & Open Buzz'}
          </button>
          {buzzedPlayerName && (
            <span className="text-sm text-slate-300">Buzzed: {buzzedPlayerName}</span>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm uppercase tracking-wide text-slate-300">
            Response (form of a question)
          </label>
          <div className="mt-2 flex flex-wrap gap-3">
            <input
              value={responseInput}
              onChange={(event) => setResponseInput(event.target.value)}
              placeholder="Type response"
              className="flex-1 rounded-lg border border-white/10 bg-brand-700 px-4 py-2 text-lg disabled:opacity-50"
              aria-label="Player response"
              disabled={responseDisabled}
            />
            <button
              type="button"
              onClick={() => {
                onSubmitResponse(responseInput);
                setResponseInput('');
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              disabled={responseDisabled}
            >
              Submit Response
            </button>
          </div>
          {answerNeedsRephrase && (
            <p className="mt-2 text-sm text-amber-300">
              Please rephrase as a question. Accepted starters include {questionHint}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
