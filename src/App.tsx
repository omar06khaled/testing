import { useEffect, useMemo, useState } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { Scoreboard } from './components/Scoreboard';
import { GameBoard } from './components/GameBoard';
import { ClueModal } from './components/ClueModal';
import { JudgePanel } from './components/JudgePanel';
import { FinalCategoryScreen } from './components/FinalCategoryScreen';
import { FinalWagerScreen } from './components/FinalWagerScreen';
import { FinalClueScreen } from './components/FinalClueScreen';
import { FinalJudgingScreen } from './components/FinalJudgingScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { useGameStore } from './store/useGameStore';

const keyMap = ['a', 'l', 'p'];

const App = () => {
  const {
    phase,
    round,
    rounds,
    players,
    currentSelectorId,
    currentClue,
    clueStatus,
    buzz,
    answer,
    dailyDoubleWager,
    finalRound,
    showEndRoundConfirm,
    setupGame,
    selectClue,
    startBuzzWindow,
    tickBuzz,
    registerBuzz,
    submitAnswer,
    judgeAnswer,
    setDailyDoubleWager,
    setFinalWager,
    setFinalResponse,
    judgeFinal,
    finalizeFinal,
    resetGame,
    toggleEndRoundConfirm,
    advanceRoundIfReady
  } = useGameStore();

  const [finalTimer, setFinalTimer] = useState(30);

  useEffect(() => {
    if (phase !== 'BUZZING') return undefined;
    const timer = setInterval(() => {
      tickBuzz();
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, tickBuzz]);

  useEffect(() => {
    if (phase !== 'BUZZING') return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const index = keyMap.indexOf(key);
      if (index === -1) return;
      const playerId = players[index]?.id;
      if (playerId) registerBuzz(playerId);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, players, registerBuzz]);

  useEffect(() => {
    if (phase !== 'FINAL_CLUE') return undefined;
    setFinalTimer(30);
    const timer = setInterval(() => {
      setFinalTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (finalTimer === 0 && phase === 'FINAL_CLUE') {
      useGameStore.setState({ phase: 'FINAL_JUDGING' });
    }
  }, [finalTimer, phase]);

  const roundLabel = round === 1 ? 'Jeopardy Round' : 'Double Jeopardy Round';
  const roundKey = round === 1 ? 'jeopardy' : 'doubleJeopardy';
  const roundData = rounds[roundKey];

  const currentResponder = useMemo(() => {
    if (!buzz.buzzedPlayerId) return undefined;
    return players.find((player) => player.id === buzz.buzzedPlayerId);
  }, [buzz.buzzedPlayerId, players]);

  useEffect(() => {
    if (phase === 'ROUND1_BOARD' || phase === 'ROUND2_BOARD') {
      advanceRoundIfReady();
    }
  }, [phase, advanceRoundIfReady]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-900 to-brand-800 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Original Trivia Game</p>
            <h1 className="text-4xl font-bold text-accent-500">Trivia Board Showdown</h1>
          </div>
          {phase !== 'SETUP' && (
            <div className="rounded-full border border-white/10 bg-brand-700 px-4 py-2 text-sm">
              {roundLabel}
            </div>
          )}
        </header>

        {phase === 'SETUP' && <SetupScreen onStart={setupGame} />}

        {phase !== 'SETUP' && (
          <>
            <Scoreboard players={players} currentSelectorId={currentSelectorId} />
            <div className="rounded-2xl border border-white/10 bg-brand-800/70 p-4 text-sm text-slate-200">
              <p className="font-semibold text-accent-500">Buzz-in keys</p>
              <p>Player 1: A • Player 2: L • Player 3: P</p>
              <p className="mt-2">
                Round 1 allows a rephrase if the response is not a question. Later rounds require
                responses like “What is/Who is/Where is...”.
              </p>
            </div>

            {(phase === 'ROUND1_BOARD' || phase === 'ROUND2_BOARD') && (
              <>
                <GameBoard
                  roundLabel={roundLabel}
                  roundData={roundData}
                  clueStatus={clueStatus[roundKey]}
                  onSelect={selectClue}
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleEndRoundConfirm(true)}
                    className="rounded-lg border border-white/10 bg-brand-700 px-4 py-2 text-sm"
                  >
                    End Round Early
                  </button>
                </div>
              </>
            )}

            {phase === 'FINAL_CATEGORY' && (
              <FinalCategoryScreen
                category={finalRound.category}
                onContinue={() => useGameStore.setState({ phase: 'FINAL_WAGER' })}
              />
            )}

            {phase === 'FINAL_WAGER' && (
              <FinalWagerScreen
                players={players}
                wagers={finalRound.wagers}
                onSetWager={setFinalWager}
                onContinue={() => useGameStore.setState({ phase: 'FINAL_CLUE' })}
              />
            )}

            {phase === 'FINAL_CLUE' && (
              <FinalClueScreen
                clue={finalRound.clue}
                players={players}
                responses={finalRound.responses}
                timeLeft={finalTimer}
                onSetResponse={setFinalResponse}
                onContinue={() => useGameStore.setState({ phase: 'FINAL_JUDGING' })}
              />
            )}

            {phase === 'FINAL_JUDGING' && (
              <FinalJudgingScreen
                players={players}
                responses={finalRound.responses}
                wagers={finalRound.wagers}
                judging={finalRound.judging}
                onJudge={judgeFinal}
                onFinish={finalizeFinal}
              />
            )}

            {phase === 'SUMMARY' && <SummaryScreen players={players} onRestart={resetGame} />}
          </>
        )}
      </div>

      {currentClue && (phase === 'CLUE_OPEN' || phase === 'BUZZING' || phase === 'ANSWER_JUDGING') && (
        <ClueModal
          clue={currentClue.data}
          isDailyDouble={currentClue.isDailyDouble}
          dailyDoubleWager={dailyDoubleWager}
          canReveal={!currentClue.isDailyDouble || dailyDoubleWager !== undefined}
          buzzTime={buzz.timeLeft}
          buzzEnabled={phase === 'BUZZING'}
          buzzedPlayerName={currentResponder?.name}
          responseDisabled={phase === 'BUZZING'}
          answerNeedsRephrase={answer.needsRephrase}
          onSetWager={setDailyDoubleWager}
          onReveal={startBuzzWindow}
          onSubmitResponse={submitAnswer}
        />
      )}

      {phase === 'ANSWER_JUDGING' && currentClue && (
        <div className="mx-auto mt-4 max-w-4xl">
          <JudgePanel
            clueValue={currentClue.isDailyDouble ? dailyDoubleWager ?? currentClue.data.value : currentClue.data.value}
            isDailyDouble={currentClue.isDailyDouble}
            responseText={answer.text}
            notes={currentClue.data.notes}
            onCorrect={() => judgeAnswer(true)}
            onIncorrect={() => judgeAnswer(false)}
            onMinorTypo={() => judgeAnswer(true)}
          />
        </div>
      )}

      {showEndRoundConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="rounded-2xl bg-brand-800 p-6 text-center shadow-xl">
            <h3 className="text-xl font-semibold">End Round?</h3>
            <p className="mt-2 text-sm text-slate-300">
              This will skip remaining clues and advance to the next phase.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  toggleEndRoundConfirm(false);
                  if (round === 1) {
                    useGameStore.setState({ round: 2, phase: 'ROUND2_BOARD' });
                  } else {
                    useGameStore.setState({ phase: 'FINAL_CATEGORY' });
                  }
                }}
                className="rounded-lg bg-rose-500 px-4 py-2 font-semibold text-rose-950"
              >
                Yes, End Round
              </button>
              <button
                type="button"
                onClick={() => toggleEndRoundConfirm(false)}
                className="rounded-lg bg-brand-700 px-4 py-2 font-semibold text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
