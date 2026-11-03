import { describe, expect, it } from 'vitest';
import { bedLevelOf, excitementOf } from '../../../../src/audio/hear/crowd-mood.js';
import { CROWD } from '../../../../src/data/audio.js';
import { createMatch } from '../../../../src/sim/create-match.js';

function matchAt({ minute = 10, score = [0, 0], x = 480, phase = 'play', format = '11' } = {}) {
  const match = createMatch({ seed: 1, humanTeam: 0, format });

  Object.assign(match, { minute, score, phase });
  match.ball.x = (x / 960) * match.pitch.length;

  return match;
}

describe('the crowd', () => {
  it('grows louder late in a match', () => {
    expect(excitementOf(matchAt({ minute: 85 }))).toBeGreaterThan(
      excitementOf(matchAt({ minute: 5 })),
    );
  });

  it('is on edge in a close game and calmer in a rout', () => {
    expect(excitementOf(matchAt({ score: [1, 1] }))).toBeGreaterThan(
      excitementOf(matchAt({ score: [4, 0] })),
    );
  });

  it('rises as the ball nears either goal', () => {
    const middle = excitementOf(matchAt({ x: 480 }));

    expect(excitementOf(matchAt({ x: 40 }))).toBeGreaterThan(middle);
    expect(excitementOf(matchAt({ x: 920 }))).toBeGreaterThan(middle);
  });

  it('counts a 7 v 7 match late at its own fortieth minute', () => {
    const late = matchAt({ minute: 38, format: '7' });
    const early = matchAt({ minute: 2, format: '7' });

    expect(excitementOf(late) - excitementOf(early)).toBeCloseTo(CROWD.late * 0.9, 1);
  });

  it('holds still in the phases it has its own level for', () => {
    for (const [phase, level] of Object.entries(CROWD.phases)) {
      expect(excitementOf(matchAt({ phase }))).toBe(level);
    }
  });

  it('stays within 0 and 1', () => {
    const wild = excitementOf(matchAt({ minute: 90, score: [2, 2], x: 950 }));

    expect(wild).toBeLessThanOrEqual(1);
    expect(wild).toBeGreaterThan(0.9);
  });

  it('murmurs at its floor when calm, and is silent with nobody there', () => {
    expect(bedLevelOf(1, 0)).toBe(CROWD.floor);
    expect(bedLevelOf(1, 1)).toBe(1);
    expect(bedLevelOf(0, 1)).toBe(0);
  });
});
