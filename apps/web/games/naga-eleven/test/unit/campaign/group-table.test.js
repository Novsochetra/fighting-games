import { describe, expect, it } from 'vitest';
import { groupRows, groupTable, rankOf } from '../../../src/campaign/group-table.js';

const result = (home, away, homeGoals, awayGoals) => ({ home, away, homeGoals, awayGoals });

const record = (results, teams = ['hero', 'a', 'b', 'c']) => ({ teams, results, replays: 0 });

describe('the group table', () => {
  it('counts each team’s matches, goals and points', () => {
    const rows = groupRows(record([result('hero', 'a', 2, 1), result('b', 'c', 0, 0)]));

    expect(rows[0]).toEqual({
      team: 'hero',
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 1,
      points: 3,
    });
    expect(rows.find((row) => row.team === 'a')).toMatchObject({ lost: 1, points: 0 });
    expect(rows.find((row) => row.team === 'c')).toMatchObject({ drawn: 1, points: 1 });
  });

  it('lists teams that have not played yet', () => {
    expect(groupRows(record([])).map((row) => row.played)).toEqual([0, 0, 0, 0]);
  });

  it('sorts by points, then goal difference, then goals scored', () => {
    const rows = groupRows(
      record([
        result('a', 'hero', 1, 0),
        result('b', 'c', 3, 1),
        result('hero', 'c', 4, 0),
        result('a', 'b', 0, 2),
      ]),
    );

    expect(rows.map((row) => row.team)).toEqual(['b', 'hero', 'a', 'c']);
  });

  it("keeps teams level on all three in the group's order, the hero's team first", () => {
    const rows = groupRows(record([result('c', 'hero', 1, 1)], ['hero', 'a', 'b', 'c']));

    expect(rows.map((row) => row.team)).toEqual(['hero', 'c', 'a', 'b']);
  });

  it('is empty for a cup the save has no table of', () => {
    expect(groupTable({ cups: {} }, 'asia-cup')).toEqual([]);
  });

  it('reads the table of a cup in the save, and a team’s place in it', () => {
    const cup = record([result('a', 'hero', 2, 0)]);

    expect(groupTable({ cups: { cup } }, 'cup')[0].team).toBe('a');
    expect(rankOf(cup, 'hero')).toBe(3);
  });
});
