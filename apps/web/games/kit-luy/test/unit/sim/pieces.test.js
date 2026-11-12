import { describe, expect, it } from 'vitest';
import { RIEL } from '../../../src/data/currency.js';
import { STAGES } from '../../../src/data/stages.js';
import {
  clothCount,
  clothPieces,
  clothTotal,
  fewestPieces,
  piecesFor,
} from '../../../src/sim/pieces.js';

const MOST = 20000;
const PIECE_SETS = [
  STAGES[0].pieces,
  STAGES[1].pieces,
  STAGES[2].pieces,
  RIEL.pieces,
  [100, 300, 400],
  [300, 700],
  [2000, 500],
  [1500],
];

// Every amount k pieces can make, a layer at a time: slower than the table and nothing like it.
function fewestByLayers(pieces, most) {
  const fewest = new Map([[0, 0]]);
  let layer = [0];

  for (let count = 1; layer.length > 0; count++) {
    const reached = layer.flatMap((amount) => pieces.map((value) => amount + value));

    layer = [...new Set(reached)].filter((amount) => amount <= most && !fewest.has(amount));
    layer.forEach((amount) => fewest.set(amount, count));
  }

  return fewest;
}

const sum = (values) => values.reduce((total, value) => total + value, 0);

describe('the cloth', () => {
  it('adds up what lies on it', () => {
    expect(clothTotal({ 500: 3, 2000: 1 })).toBe(3500);
    expect(clothCount({ 500: 3, 2000: 1 })).toBe(4);
  });

  it('is nothing when empty or missing', () => {
    expect(clothTotal({})).toBe(0);
    expect(clothCount({})).toBe(0);
    expect(clothTotal(undefined)).toBe(0);
    expect(clothCount(null)).toBe(0);
  });

  it('lists its pieces largest first', () => {
    expect(clothPieces({ 500: 2, 5000: 1, 1000: 1 })).toEqual([5000, 1000, 500, 500]);
    expect(clothPieces({})).toEqual([]);
  });
});

describe('fewestPieces', () => {
  it.each(PIECE_SETS.map((pieces) => [pieces]))(
    'agrees with brute force up to 20,000 for the pieces %j',
    (pieces) => {
      const expected = fewestByLayers(pieces, MOST);

      for (let amount = 0; amount <= MOST; amount += 100) {
        const wanted = expected.has(amount) ? expected.get(amount) : Infinity;

        expect(fewestPieces(amount, pieces), `${amount}`).toBe(wanted);
      }
    },
  );

  it('finds the way a greedy count misses', () => {
    expect(fewestPieces(600, [100, 300, 400])).toBe(2);
    expect(fewestPieces(8500, STAGES[0].pieces)).toBe(4);
    expect(fewestPieces(9000, STAGES[0].pieces)).toBe(3);
  });

  it('gives Infinity for an amount the pieces cannot make', () => {
    expect(fewestPieces(300, [500, 1000])).toBe(Infinity);
    expect(fewestPieces(1100, [300, 700])).toBe(Infinity);
    expect(fewestPieces(150, [100])).toBe(Infinity);
    expect(fewestPieces(1000, [])).toBe(Infinity);
  });

  it('gives Infinity for an amount that is no amount, and none for nothing', () => {
    for (const odd of [-500, 0.5, NaN, undefined, null, '1000']) {
      expect(fewestPieces(odd, RIEL.pieces)).toBe(Infinity);
    }

    expect(fewestPieces(0, RIEL.pieces)).toBe(0);
    expect(fewestPieces(1000, undefined)).toBe(Infinity);
    expect(fewestPieces(1000, [0, -500, 'a'])).toBe(Infinity);
  });
});

describe('piecesFor', () => {
  it.each(PIECE_SETS.map((pieces) => [pieces]))(
    'counts every amount out in the fewest of the pieces %j, largest first',
    (pieces) => {
      for (let amount = 100; amount <= MOST; amount += 100) {
        const way = piecesFor(amount, pieces);
        const fewest = fewestPieces(amount, pieces);

        expect(way.length, `${amount}`).toBe(fewest === Infinity ? 0 : fewest);
        expect(sum(way), `${amount}`).toBe(fewest === Infinity ? 0 : amount);
        expect(way).toEqual([...way].sort((one, other) => other - one));
        expect(pieces).toEqual(expect.arrayContaining(way));
      }
    },
  );

  it('counts change out as a seller would', () => {
    expect(piecesFor(8000, STAGES[0].pieces)).toEqual([5000, 2000, 1000]);
    expect(piecesFor(600, [100, 300, 400])).toEqual([300, 300]);
    expect(piecesFor(72500, RIEL.pieces)).toEqual([50000, 20000, 2000, 500]);
  });

  it('gives no pieces for what cannot be made', () => {
    expect(piecesFor(300, [500, 1000])).toEqual([]);
    expect(piecesFor(0, RIEL.pieces)).toEqual([]);
    expect(piecesFor(NaN, RIEL.pieces)).toEqual([]);
    expect(piecesFor(1000, null)).toEqual([]);
  });
});
