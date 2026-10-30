import { describe, expect, it } from 'vitest';
import { podiumOf, rankByAmount, sortSupporters, totalOf } from '@/screens/supporters/ranking.js';

const supporter = (name, amount, date = '') => ({ name, amount, date });
const names = (list) => list.map(({ name }) => name);
const ranks = (list) => list.map(({ rank }) => rank);

describe('rankByAmount', () => {
  it('puts the biggest gift first and breaks ties by name', () => {
    const ranked = rankByAmount([
      supporter('Mey', 10),
      supporter('Bopha', 50),
      supporter('Arun', 10),
    ]);
    expect(names(ranked)).toEqual(['Bopha', 'Arun', 'Mey']);
  });

  it('gives the same place to the same amount and skips the places they share', () => {
    const ranked = rankByAmount([
      supporter('A1', 50),
      supporter('B1', 20),
      supporter('B2', 20),
      supporter('C1', 5),
    ]);
    expect(ranks(ranked)).toEqual([1, 2, 2, 4]);
  });

  it('leaves the list it was given alone', () => {
    const list = [supporter('Small', 1), supporter('Big', 9)];
    rankByAmount(list);
    expect(names(list)).toEqual(['Small', 'Big']);
  });
});

describe('sortSupporters', () => {
  const ranked = rankByAmount([
    supporter('Old', 90, '2026-01-02'),
    supporter('New', 5, '2026-10-20'),
    supporter('Undated', 40),
    supporter('Middle', 10, '2026-06-01'),
  ]);

  it('keeps the ranking for the top list', () => {
    expect(names(sortSupporters(ranked, 'top'))).toEqual(['Old', 'Undated', 'Middle', 'New']);
  });

  it('lists the newest gifts first and the undated ones last', () => {
    expect(names(sortSupporters(ranked, 'recent'))).toEqual(['New', 'Middle', 'Old', 'Undated']);
  });

  it('orders gifts of the same day by their place', () => {
    const sameDay = rankByAmount([
      supporter('Less', 5, '2026-10-20'),
      supporter('More', 9, '2026-10-20'),
    ]);
    expect(names(sortSupporters(sameDay, 'recent'))).toEqual(['More', 'Less']);
  });
});

describe('podiumOf and totalOf', () => {
  it('puts the first three places on the podium', () => {
    const ranked = rankByAmount([1, 2, 3, 4].map((amount) => supporter(`S${amount}`, amount)));
    expect(names(podiumOf(ranked))).toEqual(['S4', 'S3', 'S2']);
  });

  it('adds the gifts up to the cent', () => {
    expect(totalOf([supporter('A', 0.1), supporter('B', 0.2)])).toBe(0.3);
    expect(totalOf([])).toBe(0);
  });
});
