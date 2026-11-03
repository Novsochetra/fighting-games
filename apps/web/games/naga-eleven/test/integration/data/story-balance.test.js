import { describe, expect, it } from 'vitest';
import { teamStrength } from '../../../src/campaign/team-strength.js';
import { createDecentHuman } from '../../support/decent-human/index.js';
import { playStoryMatch, sidesOf, storyMatch } from '../../support/story-matches.js';

const seedsOf = (count) => Array.from({ length: count }, (_, i) => (i + 1) * 7919 + 13);

// the decent player plays 32 whole matches here; under a full parallel run in the commit hook they
// took 64 s on a laptop, and alone about 10
const SLOW = { timeout: 180000 };

const OPENERS_AND_FINALS = [
  ['ch3-group-japan', 'ch3-final'],
  ['ch4-group-brazil', 'ch4-final'],
];

// the story match played over a few seeds, by the computer on both sides or by a decent player
function playMany(id, { seeds, halfShare = 1, human = false }) {
  const entry = storyMatch(id);

  return seedsOf(seeds).map((seed) =>
    playStoryMatch(entry, { seed, halfShare, human: human ? createDecentHuman(seed) : null }),
  );
}

function tally(runs) {
  const won = runs.filter(({ score }) => score[0] > score[1]).length;
  const lost = runs.filter(({ score }) => score[0] < score[1]).length;
  const sum = (field) => runs.reduce((total, run) => total + run[field], 0);

  return { won, lost, heroGoals: sum('heroGoals'), mateGoals: sum('mateGoals') };
}

const average = (runs, value) => runs.reduce((total, run) => total + value(run), 0) / runs.length;

describe('the story matches, as a player who plays every stage once meets them', () => {
  it('puts the rivals of the two group openers above Sochetra’s side, the friendly below it', () => {
    const [chrey, svay] = sidesOf(storyMatch('ch1-friendly')).map(teamStrength);
    const [cambodiaYouth, japan] = sidesOf(storyMatch('ch3-group-japan')).map(teamStrength);
    const [cambodia, brazil] = sidesOf(storyMatch('ch4-group-brazil')).map(teamStrength);

    expect(svay).toBeLessThan(chrey);
    expect(japan).toBeGreaterThan(cambodiaYouth + 8);
    expect(brazil).toBeGreaterThan(cambodia + 8);
  });

  it('plays Japan and Brazil above their tables in the openers, not in the finals', () => {
    for (const [opener, final] of OPENERS_AND_FINALS) {
      const [, inOpener] = sidesOf(storyMatch(opener)).map(teamStrength);
      const [, inFinal] = sidesOf(storyMatch(final)).map(teamStrength);

      expect(inOpener, opener).toBeGreaterThan(inFinal + 5);
    }
  });

  it('lets Chrey win the friendly, Sochetra scoring most and with a few specials', SLOW, () => {
    const computer = tally(playMany('ch1-friendly', { seeds: 10 }));
    const decentRuns = playMany('ch1-friendly', { seeds: 6, human: true });
    const decent = tally(decentRuns);
    const specials = average(decentRuns, (run) => run.specials[0]);

    expect(computer.won).toBeGreaterThan(computer.lost * 2);
    expect(decent.won).toBeGreaterThan(decent.lost * 2);
    expect(computer.heroGoals).toBeGreaterThan(computer.mateGoals);
    expect(decent.heroGoals).toBeGreaterThan(decent.mateGoals);
    expect(specials).toBeGreaterThanOrEqual(1);
    expect(specials).toBeLessThan(average(decentRuns, (run) => run.shots[0]) / 2);
  });

  it('has Japan and then Brazil beat Sochetra’s side more often than it beats them', SLOW, () => {
    for (const id of ['ch3-group-japan', 'ch4-group-brazil']) {
      const { won, lost } = tally(playMany(id, { seeds: 6, halfShare: 0.6 }));

      expect(lost, id).toBeGreaterThan(won);
    }
  });

  // eight short matches each: five could not tell an opener lost three times in five from a toss
  it(
    'has a decent player lose the openers more often than he wins them or loses the finals',
    SLOW,
    () => {
      for (const [opener, final] of OPENERS_AND_FINALS) {
        const first = tally(playMany(opener, { seeds: 8, halfShare: 0.6, human: true }));
        const again = tally(playMany(final, { seeds: 8, halfShare: 0.6, human: true }));

        expect(first.lost, opener).toBeGreaterThan(first.won);
        expect(first.lost, opener).toBeGreaterThan(again.lost);
      }
    },
  );

  // the cut-ins of a match (README "Balance targets"): Sochetra four to six in the first
  // chapter, eight to fourteen duels in all at most, the rival spending his specials too
  it('gives a final its cut-ins, the rival spending his specials too', SLOW, () => {
    const runs = playMany('ch1-final', { seeds: 5, human: true });
    const duels = average(runs, (run) => run.duels);
    const hero = average(runs, (run) => run.heroCutins);

    expect(duels).toBeGreaterThanOrEqual(3);
    expect(duels).toBeLessThanOrEqual(14);
    expect(hero).toBeGreaterThanOrEqual(3);
    expect(hero).toBeLessThanOrEqual(8);
    expect(average(runs, (run) => run.specials[1])).toBeGreaterThan(0.5);
  });
});
