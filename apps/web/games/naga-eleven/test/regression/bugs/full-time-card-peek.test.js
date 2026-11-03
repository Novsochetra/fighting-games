import { describe, expect, it } from 'vitest';
import { LABELS } from '../../../src/render/cinematics/shared/labels.js';
import { wordsOf } from '../../../src/render/cinematics/shared/words.js';
import { enter } from '../../../src/sim/phase-state.js';
import { matchScreen, stillScreen } from '../../../src/ui/app/canvas-screens.js';
import { finalSession, skipIntro, spiedCanvas, textsOf } from '../../support/story-session.js';

// At full time television's FULL TIME board stays drawn on the canvas under the result card, and
// it is wider and taller than the card, so its edges peeked out round it. The still match behind
// the result card leaves the board out; the card says it all.
const FULL_TIME = wordsOf(LABELS.fullTime, 'en');

function fullTimeSession() {
  const session = finalSession();

  skipIntro(session);
  enter(session.match, 'over');
  session.match.phaseTicks = 300;

  return session;
}

function drawsBoard(screen) {
  const { context, calls } = spiedCanvas();

  screen.draw(context, 600, { actors: undefined });

  return textsOf(calls).includes(FULL_TIME);
}

describe('the match at full time', () => {
  it('shows television’s FULL TIME board while the match is on screen', () => {
    expect(drawsBoard(matchScreen(fullTimeSession()))).toBe(true);
  });

  it('leaves the board out behind the result card', () => {
    expect(drawsBoard(stillScreen(fullTimeSession()))).toBe(false);
  });
});
