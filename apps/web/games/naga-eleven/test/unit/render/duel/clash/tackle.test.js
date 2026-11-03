import { describe, expect, it } from 'vitest';

import { KNOCK_BACK } from '../../../../../src/render/duel/clash/knock-back.js';
import { tackleOf } from '../../../../../src/render/duel/clash/tackle.js';
import { TRIP_OVER } from '../../../../../src/render/duel/clash/trip-over.js';

const by = (kind, walled = false) => tackleOf({ defend: { kind }, walled });

describe('how a won tackle brings the dribbler down', () => {
  it('trips him over a plain slide', () => {
    expect(by('tackle')).toBe(TRIP_OVER);
  });

  it('stops him dead at a block, a stretch or a wall', () => {
    expect(by('block')).toBe(KNOCK_BACK);
    expect(by('intercept')).toBe(KNOCK_BACK);
    expect(by('tackle', true)).toBe(KNOCK_BACK);
  });
});
