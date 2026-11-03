import { afterEach, describe, expect, it } from 'vitest';
import { drawDuelShow } from '../../../src/render/duel/draw-show.js';
import { fitDuelMenu } from '../../../src/render/duel/layout.js';
import { createDuelShow } from '../../../src/render/duel/show.js';
import { fakeMatch, startMeeting } from '../../support/duel-fixtures.js';
import { spiedCanvas, textsOf } from '../../support/story-session.js';

// On a phone the duel menu's rows take taps, yet its foot still read "UP DOWN   PASS: GO", keys a
// finger has none of
const HINT = 'UP DOWN   PASS: GO';

function menuTexts() {
  const match = fakeMatch();

  startMeeting(match, { at: 850, attacker: { moves: ['naga-shot', 'power-shot'], spirit: 100 } });

  const show = createDuelShow(match);
  const { context, calls } = spiedCanvas();

  show.stage = 'menu';
  drawDuelShow(context, show, { lang: 'en' });

  return textsOf(calls);
}

describe('the duel menu’s key hint', () => {
  afterEach(() => fitDuelMenu({ touch: false, stageHeight: 864 }));

  it('names the keys on a screen with keys', () => {
    fitDuelMenu({ touch: false, stageHeight: 375 });

    expect(menuTexts()).toContain(HINT);
  });

  it('is gone from a phone’s finger menu', () => {
    fitDuelMenu({ touch: true, stageHeight: 375 });

    expect(menuTexts()).not.toContain(HINT);
  });
});
