import { describe, expect, it } from 'vitest';

import { keeperResult } from '../../../../dev/camera-lab/src/forced.js';
import { CHOICES, sideOfWord } from '../../../../dev/camera-lab/src/options.js';
import { camMoment } from '../../../../src/render/save-cam/moment.js';

describe("the camera lab's outcomes", () => {
  it.each(CHOICES.outcome)('plays %s on the save cam as asked', (outcome) => {
    const result = keeperResult({ outcome, side: 0.5, height: 0.5, dive: 'auto' });
    const moment = camMoment({ result: result.word, style: result.style, aim: result.aim }, 1);

    expect(moment.outcome).toBe(outcome);
  });

  it('leaves the dive to the save cam on auto, and dives as told otherwise', () => {
    expect(keeperResult({ outcome: 'catch', side: 0, height: 0, dive: 'auto' }).dive).toBe(
      undefined,
    );
    expect(keeperResult({ outcome: 'catch', side: 0, height: 0, dive: '-1' }).dive).toBe(-1);
  });

  it("gives a field duel's word to the side it is the win of", () => {
    expect(sideOfWord('broke')).toBe('attack');
    expect(sideOfWord('passed')).toBe('attack');
    expect(sideOfWord('stolen')).toBe('defend');
    expect(sideOfWord('blocked')).toBe('defend');
  });
});
