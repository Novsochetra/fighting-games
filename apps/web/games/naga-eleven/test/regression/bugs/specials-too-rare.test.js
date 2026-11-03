import { describe, expect, it } from 'vitest';
import { createDecentHuman } from '../../support/decent-human/index.js';
import { playStoryMatch, storyMatch } from '../../support/story-matches.js';

// "During the play it's not fun at all: we don't use special skills much, players don't have
// them, and there are no special combos." Spirit came back only slowly, Sochetra struck two or
// three specials a match and nobody else had any. Now every player has a skill, good play fills
// the gauge, and passes, duos and chains combine: a decent player strikes five to eight cut-in
// shots a match (four to six in the shorter first chapter), and his teammates each play a skill
// or two.
const SEEDS = [11, 22, 33];

function playedBy(id) {
  const entry = storyMatch(id);

  return SEEDS.map((seed) => playStoryMatch(entry, { seed, human: createDecentHuman(seed) }));
}

const average = (runs, value) => runs.reduce((sum, run) => sum + value(run), 0) / runs.length;

// the skills each of Sochetra's teammates played, in each match: side 0 is the first `size`
const mateSkills = (runs, { size, hero }) =>
  runs.flatMap((run) =>
    Object.entries(run.skills)
      .filter(([index]) => Number(index) < size && Number(index) !== hero)
      .map(([, count]) => count),
  );

describe('specials and skills in a story match', { timeout: 60000 }, () => {
  it.each([
    ['ch1-final', 3, 7, { size: 7, hero: 6 }],
    ['ch3-final', 4, 9, { size: 11, hero: 9 }],
  ])(
    'let a decent player strike a few cut-ins in %s and his mates play skills',
    (id, least, most, side) => {
      const runs = playedBy(id);
      const mates = mateSkills(runs, side);

      expect(average(runs, (run) => run.heroCutins)).toBeGreaterThanOrEqual(least);
      expect(average(runs, (run) => run.heroCutins)).toBeLessThanOrEqual(most);
      expect(mates.length).toBeGreaterThan(2);
      expect(mates.reduce((sum, count) => sum + count, 0) / mates.length).toBeLessThanOrEqual(2.5);
    },
  );
});
