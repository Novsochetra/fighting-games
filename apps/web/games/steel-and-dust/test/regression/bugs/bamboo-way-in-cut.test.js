import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the Old Grove tree that opens Bamboo Pass was cut out of the Old Grove's near strip along two
// straight columns, through its floor band and into the roots of the next tree, so both ends stood
// on the mist as hard edges with scraps of that next tree beside the right one
const WAY_IN = join(import.meta.dirname, '../../../assets/backdrops/bamboo-pass/way-in.png');

// a ragged end reaches its outermost column on a few rows at a time; a cut reaches it all the way down
const LONGEST_RAGGED_RUN = 4;

function rowEnds(strip) {
  const ends = [];

  for (let y = 0; y < strip.height; y++) {
    const painted = [];

    for (let x = 0; x < strip.width; x++) {
      if (strip.alpha(x, y)) {
        painted.push(x);
      }
    }

    ends.push(painted.length ? { first: painted[0], last: painted[painted.length - 1] } : null);
  }

  return ends;
}

function longestRun(ends, reaches) {
  let longest = 0;
  let run = 0;

  for (const end of ends) {
    run = end && reaches(end) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  return longest;
}

describe('the tree that opens Bamboo Pass', () => {
  it('slopes off at both ends instead of stopping on a straight cut', () => {
    const ends = rowEnds(readPngAlpha(WAY_IN));
    const painted = ends.filter(Boolean);
    const left = Math.min(...painted.map((end) => end.first));
    const right = Math.max(...painted.map((end) => end.last));

    expect(longestRun(ends, (end) => end.first === left)).toBeLessThanOrEqual(LONGEST_RAGGED_RUN);
    expect(longestRun(ends, (end) => end.last === right)).toBeLessThanOrEqual(LONGEST_RAGGED_RUN);
  });
});
