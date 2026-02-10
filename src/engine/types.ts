export type RoundKey = 'jeopardy' | 'doubleJeopardy';

export interface Clue {
  value: number;
  clue: string;
  responses: string[];
  alt?: string[];
  notes?: string;
}

export interface Category {
  name: string;
  clues: Clue[];
}

export interface RoundData {
  categories: Category[];
}

export interface FinalData {
  category: string;
  clue: string;
  responses: string[];
  alt?: string[];
  notes?: string;
}

export interface PlayerStats {
  correct: number;
  wrong: number;
  totalAttempts: number;
  dailyDoubleAttempts: number;
  dailyDoubleCorrect: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  stats: PlayerStats;
}

export type Phase =
  | 'SETUP'
  | 'ROUND1_BOARD'
  | 'CLUE_OPEN'
  | 'BUZZING'
  | 'ANSWER_JUDGING'
  | 'ROUND2_BOARD'
  | 'FINAL_CATEGORY'
  | 'FINAL_WAGER'
  | 'FINAL_CLUE'
  | 'FINAL_JUDGING'
  | 'SUMMARY';
