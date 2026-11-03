import { describe, expect, it } from 'vitest';
import { groupTable } from '../../../src/campaign/group-table.js';
import { newSave } from '../../../src/campaign/save.js';
import { settleStage } from '../../../src/campaign/settle.js';
import { FIXTURE_CHAPTERS, matchResult, stageAt } from '../../support/campaign-fixtures.js';

const HERO = 'nation-youth';

const groupStage = (stage) => stageAt(FIXTURE_CHAPTERS, 2, stage);

function playGroup(results, save = { ...newSave({ seed: 11 }), chapter: 2, stage: 1 }) {
  const settled = [];
  let current = save;

  for (const [index, result] of results.entries()) {
    const stage = groupStage([1, 2, 4][index]);
    const step = settleStage({ ...current, stage: stage.at.stage }, stage, result);

    settled.push(step);
    current = step.save;
  }

  return settled;
}

const heroRow = (save) => groupTable(save, 'asia-cup').find((row) => row.team === HERO);

describe('a group match', () => {
  it("goes on whatever the score, putting the result in the cup's table", () => {
    const [first] = playGroup([matchResult(0, 2)]);

    expect(first).toMatchObject({ passed: true, scenes: ['c3-2-lose'] });
    expect(first.save.stage).toBe(2);
    expect(heroRow(first.save)).toMatchObject({ played: 1, lost: 1, goalsFor: 0, goalsAgainst: 2 });
  });

  it('plays out the other group matches of the round', () => {
    const [first] = playGroup([matchResult(1, 0)]);
    const table = groupTable(first.save, 'asia-cup');

    expect(table.map((row) => row.played).sort()).toEqual([1, 1, 1, 1]);
    expect(first.save.cups['asia-cup'].results).toHaveLength(2);
  });

  it('plays the other matches the same way for the same seed, another way for another', () => {
    const results = [matchResult(1, 0), matchResult(1, 0), matchResult(1, 0)];
    const one = playGroup(results).at(-1).save.cups['asia-cup'];
    const again = playGroup(results).at(-1).save.cups['asia-cup'];
    const seeds = [12, 13, 14, 15].map(
      (seed) =>
        playGroup(results, { ...newSave({ seed }), chapter: 2, stage: 1 }).at(-1).save.cups[
          'asia-cup'
        ],
    );

    expect(again).toEqual(one);
    expect(seeds.some((record) => JSON.stringify(record) !== JSON.stringify(one))).toBe(true);
  });

  it('has every team play each other once when the group is done', () => {
    const last = playGroup([matchResult(1, 0), matchResult(1, 0), matchResult(1, 0)]).at(-1);
    const pairs = last.save.cups['asia-cup'].results.map((result) =>
      [result.home, result.away].sort().join(' v '),
    );

    expect(new Set(pairs).size).toBe(6);
    expect(groupTable(last.save, 'asia-cup').every((row) => row.played === 3)).toBe(true);
  });
});

describe("the group's last match", () => {
  it('takes the hero on when his team ends in the top places', () => {
    const last = playGroup([matchResult(0, 2), matchResult(3, 0), matchResult(2, 0)]).at(-1);

    expect(last).toMatchObject({ passed: true, scenes: ['c3-5-win'] });
    expect(last.save).toMatchObject({ chapter: 2, stage: 5, attempts: 0 });
  });

  it("plays the group again from its first match, the cup's fail scene after the result", () => {
    const last = playGroup([matchResult(0, 2), matchResult(0, 1), matchResult(1, 1)]).at(-1);

    expect(last).toMatchObject({ passed: false, scenes: ['c3-5-draw', 'c3-asia-cup-fail'] });
    expect(last.save).toMatchObject({ chapter: 2, stage: 1, attempts: 1 });
  });

  it('starts a fresh table when the first match is played again', () => {
    const failed = playGroup([matchResult(0, 2), matchResult(0, 1), matchResult(0, 1)]).at(-1);
    const [replayed] = playGroup([matchResult(2, 0)], failed.save);
    const record = replayed.save.cups['asia-cup'];

    expect(heroRow(failed.save)).toMatchObject({ played: 3, lost: 3 });
    expect(record.replays).toBe(1);
    expect(heroRow(replayed.save)).toMatchObject({ played: 1, won: 1 });
  });
});
