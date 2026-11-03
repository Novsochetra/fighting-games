import { describe, expect, it } from 'vitest';
import { confettiPieces } from '../../../../src/render/cinematics/boards/confetti.js';
import { winnerOf } from '../../../../src/render/cinematics/boards/draw-boards.js';
import { VIEW } from '../../../../src/config.js';

describe('the winner of a match', () => {
  it('is the side with more goals', () => {
    expect(winnerOf({ score: [2, 1] })).toBe(0);
    expect(winnerOf({ score: [0, 3] })).toBe(1);
  });

  it('is no one after a draw, unless penalties settled it', () => {
    expect(winnerOf({ score: [1, 1] })).toBeNull();
    expect(winnerOf({ score: [1, 1] }, { goals: [3, 4] })).toBe(1);
    expect(winnerOf({ score: [2, 1] }, { goals: [3, 4] })).toBe(0);
  });
});

describe('the confetti', () => {
  it('falls the same way every time', () => {
    expect(confettiPieces(90, { colours: 5 })).toEqual(confettiPieces(90, { colours: 5 }));
  });

  it('starts above the view and comes down into it, a little at a time', () => {
    const early = confettiPieces(2);
    const later = confettiPieces(300);

    expect(early.length).toBeLessThan(later.length);
    expect(later.some((piece) => piece.y > VIEW.height / 2)).toBe(true);
    expect(later.every((piece) => piece.y <= VIEW.height + 12)).toBe(true);
  });

  it('keeps falling on a loop, in whole pixels and colours it was given', () => {
    const pieces = confettiPieces(5000, { colours: 4 });

    expect(pieces.length).toBeGreaterThan(100);

    for (const piece of pieces) {
      expect(Number.isInteger(piece.x) && Number.isInteger(piece.y)).toBe(true);
      expect(piece.colour).toBeGreaterThanOrEqual(0);
      expect(piece.colour).toBeLessThan(4);
    }
  });
});
