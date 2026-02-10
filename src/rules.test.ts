import { describe, expect, it } from 'vitest';
import { canTransition, getDailyDoubleLimits, isQuestionForm, validateWager } from '../engine/rules';

describe('rules engine', () => {
  it('validates question form prefixes', () => {
    expect(isQuestionForm('What is a comet')).toBe(true);
    expect(isQuestionForm('who are the Beatles?')).toBe(true);
    expect(isQuestionForm('This is not a question')).toBe(false);
  });

  it('validates wagers within min and max', () => {
    expect(validateWager(50, 5, 200)).toBe(true);
    expect(validateWager(0, 5, 200)).toBe(false);
    expect(validateWager(250, 5, 200)).toBe(false);
  });

  it('calculates daily double wager limits', () => {
    expect(getDailyDoubleLimits(200, 1000)).toEqual({ min: 5, max: 1000 });
    expect(getDailyDoubleLimits(2500, 1000)).toEqual({ min: 5, max: 2500 });
  });

  it('allows core state transitions', () => {
    expect(canTransition('SETUP', 'ROUND1_BOARD')).toBe(true);
    expect(canTransition('ROUND1_BOARD', 'FINAL_CATEGORY')).toBe(false);
    expect(canTransition('FINAL_CLUE', 'FINAL_JUDGING')).toBe(true);
  });
});
