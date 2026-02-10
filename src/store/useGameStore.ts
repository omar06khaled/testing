import { create } from 'zustand';
import triviaData from '../data/trivia.json';
import type {
  Category,
  Clue,
  FinalData,
  Phase,
  Player,
  PlayerStats,
  RoundData,
  RoundKey
} from '../engine/types';
import { canTransition, getDailyDoubleLimits, isQuestionForm, validateWager } from '../engine/rules';

interface DailyDouble {
  round: RoundKey;
  categoryIndex: number;
  clueIndex: number;
}

interface CurrentClue {
  round: RoundKey;
  categoryIndex: number;
  clueIndex: number;
  data: Clue;
  isDailyDouble: boolean;
}

interface BuzzState {
  enabled: boolean;
  timeLeft: number;
  lockedOutIds: string[];
  buzzedPlayerId?: string;
}

interface FinalRoundState {
  category: string;
  clue: string;
  responses: Record<string, string>;
  wagers: Record<string, number>;
  judging: Record<string, boolean | null>;
}

interface AnswerState {
  text: string;
  needsRephrase: boolean;
}

interface GameState {
  phase: Phase;
  round: 1 | 2;
  rounds: {
    jeopardy: RoundData;
    doubleJeopardy: RoundData;
    final: FinalData;
  };
  players: Player[];
  currentSelectorId?: string;
  currentClue?: CurrentClue;
  clueStatus: {
    jeopardy: boolean[][];
    doubleJeopardy: boolean[][];
  };
  dailyDoubles: DailyDouble[];
  buzz: BuzzState;
  answer: AnswerState;
  dailyDoubleWager?: number;
  finalRound: FinalRoundState;
  showEndRoundConfirm: boolean;
}

interface GameActions {
  setupGame: (names: string[]) => void;
  selectClue: (categoryIndex: number, clueIndex: number) => void;
  startBuzzWindow: () => void;
  tickBuzz: () => void;
  registerBuzz: (playerId: string) => void;
  submitAnswer: (response: string) => void;
  judgeAnswer: (correct: boolean) => void;
  setDailyDoubleWager: (wager: number) => void;
  openFinalCategory: () => void;
  setFinalWager: (playerId: string, wager: number) => void;
  setFinalResponse: (playerId: string, response: string) => void;
  judgeFinal: (playerId: string, correct: boolean) => void;
  finalizeFinal: () => void;
  resetGame: () => void;
  toggleEndRoundConfirm: (open: boolean) => void;
  advanceRoundIfReady: () => void;
}

const initialStats: PlayerStats = {
  correct: 0,
  wrong: 0,
  totalAttempts: 0,
  dailyDoubleAttempts: 0,
  dailyDoubleCorrect: 0
};

const createEmptyBoard = () => Array.from({ length: 6 }, () => Array(5).fill(false));

const randomChoice = (max: number) => Math.floor(Math.random() * max);

const generateDailyDoubles = (): DailyDouble[] => {
  const used = new Set<string>();
  const results: DailyDouble[] = [];
  const pick = (round: RoundKey) => {
    let categoryIndex = randomChoice(6);
    let clueIndex = randomChoice(5);
    let key = `${round}-${categoryIndex}-${clueIndex}`;
    while (used.has(key)) {
      categoryIndex = randomChoice(6);
      clueIndex = randomChoice(5);
      key = `${round}-${categoryIndex}-${clueIndex}`;
    }
    used.add(key);
    results.push({ round, categoryIndex, clueIndex });
  };
  pick('jeopardy');
  pick('doubleJeopardy');
  pick('doubleJeopardy');
  return results;
};

const createFinalRoundState = (): FinalRoundState => ({
  category: triviaData.rounds.final.category,
  clue: triviaData.rounds.final.clue,
  responses: {},
  wagers: {},
  judging: {}
});

const createInitialState = (): GameState => ({
  phase: 'SETUP',
  round: 1,
  rounds: {
    jeopardy: triviaData.rounds.jeopardy as RoundData,
    doubleJeopardy: triviaData.rounds.doubleJeopardy as RoundData,
    final: triviaData.rounds.final as FinalData
  },
  players: [],
  currentSelectorId: undefined,
  currentClue: undefined,
  clueStatus: {
    jeopardy: createEmptyBoard(),
    doubleJeopardy: createEmptyBoard()
  },
  dailyDoubles: [],
  buzz: {
    enabled: false,
    timeLeft: 0,
    lockedOutIds: [],
    buzzedPlayerId: undefined
  },
  answer: {
    text: '',
    needsRephrase: false
  },
  dailyDoubleWager: undefined,
  finalRound: createFinalRoundState(),
  showEndRoundConfirm: false
});

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...createInitialState(),
  setupGame: (names) => {
    const players = names.map((name, index) => ({
      id: `player-${index}`,
      name,
      score: 0,
      stats: { ...initialStats }
    }));
    const selectorIndex = randomChoice(players.length);
    set({
      players,
      phase: 'ROUND1_BOARD',
      round: 1,
      currentSelectorId: players[selectorIndex]?.id,
      dailyDoubles: generateDailyDoubles(),
      clueStatus: {
        jeopardy: createEmptyBoard(),
        doubleJeopardy: createEmptyBoard()
      },
      finalRound: createFinalRoundState()
    });
  },
  selectClue: (categoryIndex, clueIndex) => {
    const state = get();
    const roundKey: RoundKey = state.round === 1 ? 'jeopardy' : 'doubleJeopardy';
    if (!canTransition(state.phase, 'CLUE_OPEN')) return;
    const alreadyUsed = state.clueStatus[roundKey][categoryIndex][clueIndex];
    if (alreadyUsed) return;
    const category = state.rounds[roundKey].categories[categoryIndex] as Category;
    const clue = category.clues[clueIndex];
    const isDailyDouble = state.dailyDoubles.some(
      (entry) =>
        entry.round === roundKey &&
        entry.categoryIndex === categoryIndex &&
        entry.clueIndex === clueIndex
    );
    const updatedStatus = state.clueStatus[roundKey].map((row, rowIndex) =>
      row.map((used, colIndex) =>
        rowIndex === categoryIndex && colIndex === clueIndex ? true : used
      )
    );

    set({
      phase: 'CLUE_OPEN',
      currentClue: { round: roundKey, categoryIndex, clueIndex, data: clue, isDailyDouble },
      clueStatus: {
        ...state.clueStatus,
        [roundKey]: updatedStatus
      },
      buzz: {
        enabled: false,
        timeLeft: 0,
        lockedOutIds: [],
        buzzedPlayerId: undefined
      },
      dailyDoubleWager: undefined,
      answer: { text: '', needsRephrase: false }
    });
  },
  startBuzzWindow: () => {
    const state = get();
    if (!state.currentClue) return;
    const nextPhase = state.currentClue.isDailyDouble ? 'ANSWER_JUDGING' : 'BUZZING';
    if (!canTransition(state.phase, nextPhase)) return;
    if (state.currentClue.isDailyDouble && state.dailyDoubleWager === undefined) return;

    set({
      phase: nextPhase,
      buzz: {
        enabled: !state.currentClue.isDailyDouble,
        timeLeft: 8,
        lockedOutIds: [],
        buzzedPlayerId: state.currentSelectorId
      },
      answer: { text: '', needsRephrase: false }
    });
  },
  tickBuzz: () => {
    const state = get();
    if (!state.buzz.enabled || state.phase !== 'BUZZING') return;
    const nextTime = Math.max(0, state.buzz.timeLeft - 1);
    if (nextTime === 0) {
      const boardPhase = state.round === 1 ? 'ROUND1_BOARD' : 'ROUND2_BOARD';
      set({
        phase: boardPhase,
        buzz: { ...state.buzz, timeLeft: 0, enabled: false, buzzedPlayerId: undefined }
      });
      return;
    }
    set({ buzz: { ...state.buzz, timeLeft: nextTime } });
  },
  registerBuzz: (playerId) => {
    const state = get();
    if (!state.buzz.enabled || state.phase !== 'BUZZING') return;
    if (state.buzz.lockedOutIds.includes(playerId)) return;
    set({
      phase: 'ANSWER_JUDGING',
      buzz: { ...state.buzz, enabled: false, buzzedPlayerId: playerId }
    });
  },
  submitAnswer: (response) => {
    const state = get();
    if (state.phase !== 'ANSWER_JUDGING') return;
    const isDailyDouble = state.currentClue?.isDailyDouble ?? false;
    const requiresQuestion =
      state.round === 2 || isDailyDouble || state.phase === 'FINAL_JUDGING';
    const isQuestion = isQuestionForm(response);
    if (!isQuestion && state.round === 1 && !isDailyDouble) {
      set({ answer: { text: response, needsRephrase: true } });
      return;
    }
    if (requiresQuestion && !isQuestion) {
      get().judgeAnswer(false);
      return;
    }
    set({ answer: { text: response, needsRephrase: false } });
  },
  judgeAnswer: (correct) => {
    const state = get();
    const responderId = state.buzz.buzzedPlayerId;
    if (!state.currentClue || !responderId) return;

    const playerIndex = state.players.findIndex((player) => player.id === responderId);
    if (playerIndex === -1) return;

    const player = state.players[playerIndex];
    const clueValue = state.currentClue.isDailyDouble
      ? state.dailyDoubleWager ?? state.currentClue.data.value
      : state.currentClue.data.value;
    const scoreDelta = correct ? clueValue : -clueValue;

    const updatedPlayers = state.players.map((p) => {
      if (p.id !== responderId) return p;
      const updatedStats = {
        ...p.stats,
        totalAttempts: p.stats.totalAttempts + 1,
        correct: p.stats.correct + (correct ? 1 : 0),
        wrong: p.stats.wrong + (correct ? 0 : 1),
        dailyDoubleAttempts: p.stats.dailyDoubleAttempts + (state.currentClue?.isDailyDouble ? 1 : 0),
        dailyDoubleCorrect:
          p.stats.dailyDoubleCorrect + (state.currentClue?.isDailyDouble && correct ? 1 : 0)
      };
      return {
        ...p,
        score: p.score + scoreDelta,
        stats: updatedStats
      };
    });

    const boardPhase = state.round === 1 ? 'ROUND1_BOARD' : 'ROUND2_BOARD';
    const remainingTime = state.buzz.timeLeft;
    const remainingPlayers = state.players
      .map((p) => p.id)
      .filter((id) => id !== responderId);

    if (!correct && !state.currentClue.isDailyDouble && remainingTime > 0) {
      set({
        players: updatedPlayers,
        phase: 'BUZZING',
        buzz: {
          enabled: true,
          timeLeft: remainingTime,
          lockedOutIds: [...state.buzz.lockedOutIds, responderId],
          buzzedPlayerId: undefined
        },
        answer: { text: '', needsRephrase: false }
      });
      return;
    }

    set({
      players: updatedPlayers,
      phase: boardPhase,
      currentSelectorId: correct ? responderId : state.currentSelectorId,
      buzz: { enabled: false, timeLeft: 0, lockedOutIds: [], buzzedPlayerId: undefined },
      answer: { text: '', needsRephrase: false }
    });
  },
  setDailyDoubleWager: (wager) => {
    const state = get();
    const selectorId = state.currentSelectorId;
    if (!state.currentClue || !state.currentClue.isDailyDouble || !selectorId) return;
    const player = state.players.find((p) => p.id === selectorId);
    if (!player) return;
    const highestValue = state.round === 1 ? 1000 : 2000;
    const { min, max } = getDailyDoubleLimits(player.score, highestValue);
    if (!validateWager(wager, min, max)) return;
    set({ dailyDoubleWager: wager });
  },
  openFinalCategory: () => {
    const state = get();
    if (!canTransition(state.phase, 'FINAL_CATEGORY')) return;
    set({ phase: 'FINAL_CATEGORY' });
  },
  setFinalWager: (playerId, wager) => {
    const state = get();
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return;
    if (!validateWager(wager, 0, player.score)) return;
    set({
      finalRound: {
        ...state.finalRound,
        wagers: { ...state.finalRound.wagers, [playerId]: wager }
      }
    });
  },
  setFinalResponse: (playerId, response) => {
    const state = get();
    set({
      finalRound: {
        ...state.finalRound,
        responses: { ...state.finalRound.responses, [playerId]: response }
      }
    });
  },
  judgeFinal: (playerId, correct) => {
    const state = get();
    const wager = state.finalRound.wagers[playerId] ?? 0;
    const updatedPlayers = state.players.map((p) => {
      if (p.id !== playerId) return p;
      return { ...p, score: p.score + (correct ? wager : -wager) };
    });
    set({
      players: updatedPlayers,
      finalRound: {
        ...state.finalRound,
        judging: { ...state.finalRound.judging, [playerId]: correct }
      }
    });
  },
  finalizeFinal: () => {
    const state = get();
    if (!canTransition(state.phase, 'SUMMARY')) return;
    set({ phase: 'SUMMARY' });
  },
  resetGame: () => {
    set(createInitialState());
  },
  toggleEndRoundConfirm: (open) => {
    set({ showEndRoundConfirm: open });
  },
  advanceRoundIfReady: () => {
    const state = get();
    const roundKey: RoundKey = state.round === 1 ? 'jeopardy' : 'doubleJeopardy';
    const allUsed = state.clueStatus[roundKey].every((row) => row.every(Boolean));
    if (!allUsed) return;
    if (state.round === 1) {
      set({ round: 2, phase: 'ROUND2_BOARD' });
      return;
    }
    set({ phase: 'FINAL_CATEGORY' });
  }
}));
