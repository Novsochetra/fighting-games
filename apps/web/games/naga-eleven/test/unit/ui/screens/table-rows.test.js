import { describe, expect, it } from 'vitest';
import { tableRowsOf } from '../../../../src/ui/screens/table-rows.js';
import { CHREY, NEIGHBOR, ROYAL } from '../../../support/screen-fixtures.js';

const row = (
  team,
  { played = 2, won = 1, drawn = 0, lost = 1, goalsFor, goalsAgainst, points },
) => ({
  team,
  played,
  won,
  drawn,
  lost,
  goalsFor,
  goalsAgainst,
  points,
});

const ROWS = [
  row('royal-kids', { goalsFor: 4, goalsAgainst: 1, points: 4 }),
  row('chrey-school', { goalsFor: 2, goalsAgainst: 2, points: 3 }),
  row('neighbor-village', { goalsFor: 1, goalsAgainst: 4, points: 1 }),
];

describe('a group table row as the screen shows it', () => {
  it('ranks the rows, names each team and signs the goal difference', () => {
    const rows = tableRowsOf(ROWS, { teams: [CHREY, ROYAL, NEIGHBOR] });

    expect(rows.map(({ rank, short, diff }) => [rank, short, diff])).toEqual([
      [1, 'ROY', '+3'],
      [2, 'CHR', '0'],
      [3, 'NEI', '-3'],
    ]);
    expect(rows[0].name).toEqual(ROYAL.name);
  });

  it('marks the player’s team and the ones going through', () => {
    const rows = tableRowsOf(ROWS, { teams: [CHREY], own: 'chrey-school', advance: 1 });

    expect(rows.map((line) => [line.own, line.through])).toEqual([
      [false, true],
      [true, false],
      [false, false],
    ]);
  });

  it('names a team it has no record of by its id', () => {
    const [first] = tableRowsOf([row('mystery-fc', { goalsFor: 0, goalsAgainst: 0, points: 0 })]);

    expect(first).toMatchObject({ short: 'MYS', name: 'mystery-fc', through: true });
  });
});
