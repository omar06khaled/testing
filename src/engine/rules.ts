import type { Phase } from './types';

const questionPrefixes = [
  'what is',
  'what are',
  'who is',
  'who are',
  'where is',
  'where are',
  'when is',
  'when are'
];

export const QUESTION_PREFIXES = questionPrefixes;

export const normalizeResponse = (response: string) =>
  response.trim().toLowerCase().replace(/[?.!]+$/, '');

export const isQuestionForm = (response: string) => {
  const normalized = normalizeResponse(response);
  return questionPrefixes.some((prefix) => normalized.startsWith(prefix));
};

export const validateWager = (wager: number, min: number, max: number) => {
  if (Number.isNaN(wager)) return false;
  return wager >= min && wager <= max;
};

export const getDailyDoubleLimits = (score: number, highestValue: number) => {
  const min = 5;
  const max = Math.max(score, highestValue);
  return { min, max };
};

const allowedTransitions: Record<Phase, Phase[]> = {
  SETUP: ['ROUND1_BOARD'],
  ROUND1_BOARD: ['CLUE_OPEN', 'ROUND2_BOARD'],
  CLUE_OPEN: ['BUZZING', 'ANSWER_JUDGING'],
  BUZZING: ['ANSWER_JUDGING', 'ROUND1_BOARD', 'ROUND2_BOARD'],
  ANSWER_JUDGING: ['ROUND1_BOARD', 'ROUND2_BOARD'],
  ROUND2_BOARD: ['CLUE_OPEN', 'FINAL_CATEGORY'],
  FINAL_CATEGORY: ['FINAL_WAGER'],
  FINAL_WAGER: ['FINAL_CLUE'],
  FINAL_CLUE: ['FINAL_JUDGING'],
  FINAL_JUDGING: ['SUMMARY'],
  SUMMARY: ['SETUP']
};

export const canTransition = (from: Phase, to: Phase) =>
  allowedTransitions[from].includes(to);
