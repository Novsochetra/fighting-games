import { describe, expect, it } from 'vitest';
import { MINIMAP } from '../../../src/art/venues/minimap.js';
import { minimapRect } from '../../../src/render/hud/layout.js';
import { drawMatchSession } from '../../../src/ui/flow/match-draw.js';
import {
  fillsIn,
  finalSession,
  skipIntro,
  spiedCanvas,
  stepSession,
} from '../../support/story-session.js';

// The narrator's band and the dialogue box of a story scene sit at the foot of the view, over the
// minimap, and its dots showed through the text (the chapter 1 final's losing-late narration at
// 32'). While a scene holds the match the minimap stands aside.
const NARRATION = [{ when: 'minute', at: 1, scene: 'ch1-final-naga' }];

function minimapDrawn(session) {
  const { context, calls } = spiedCanvas();
  const rect = minimapRect(session.match);

  drawMatchSession(context, session, { tick: 900 });

  return fillsIn(calls, MINIMAP.panel).some(
    (call) => call.args[0] === rect.x && call.args[1] === rect.y && call.args[2] === rect.width,
  );
}

describe('the minimap and a story scene over the match', () => {
  it('stands aside while the narration is up, and comes back after it', () => {
    const session = finalSession({ triggers: NARRATION });

    skipIntro(session);
    stepSession(session, { ticks: 2 });

    expect(minimapDrawn(session)).toBe(true);

    for (let i = 0; i < 6000 && !session.overlay; i += 1) {
      stepSession(session);
    }

    expect(session.overlay).toBeTruthy();
    stepSession(session, { ticks: 40 });
    expect(minimapDrawn(session)).toBe(false);

    session.overlay = null;
    stepSession(session);
    expect(minimapDrawn(session)).toBe(true);
  });
});
