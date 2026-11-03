import { describe, expect, it } from 'vitest';
import { CINE } from '../../../src/art/cinematics/palette.js';
import { drawIntro, updateIntro } from '../../../src/render/cinematics/index.js';
import { wordsOf } from '../../../src/render/cinematics/shared/words.js';
import { matchScreen, stillScreen } from '../../../src/ui/app/canvas-screens.js';
import {
  fillsIn,
  finalSession,
  spiedCanvas,
  stepSession,
  textsOf,
} from '../../support/story-session.js';

// Behind the line-up card of every story match, television's cup title ("NATIONAL PRIMARY SCHOOLS
// CUP") was written over the score bug ("CHR 0-0 RYK") and the player card: the still match under
// the card drew the HUD and the opening card's first frame, its words not yet on their band. The
// HUD has nothing to say before kick off, so it waits for the opening card to go, and the cup's
// title rides in on its band instead of standing on bare sky ahead of the wipe.
const APP = { actors: undefined };

function drawnWords(screen, session) {
  const { context, calls } = spiedCanvas();

  screen.draw(context, 0, APP);

  const texts = textsOf(calls);
  const cup = wordsOf(session.tv?.intro?.cup ?? '', 'en');

  return { score: texts.includes('0-0'), cup: Boolean(cup) && texts.includes(cup) };
}

describe('before a story match kicks off', () => {
  it('shows no score bug behind the line-up card', () => {
    const session = finalSession();
    const drawn = drawnWords(stillScreen(session), session);

    expect(drawn.score).toBe(false);
  });

  it('never writes the cup title over the score while the opening card plays', () => {
    const session = finalSession();
    const screen = matchScreen(session);
    const clashes = [];

    // a frame in every few is enough to see the band come in, stand and go
    for (let frame = 0; session.tv.intro; frame += 1) {
      const drawn = frame % 8 === 0 ? drawnWords(screen, session) : {};

      if (drawn.score && drawn.cup) {
        clashes.push(frame);
      }

      stepSession(session);
    }

    expect(clashes).toEqual([]);
  });

  it('shows the score once play is under way', () => {
    const session = finalSession();
    const screen = matchScreen(session);

    while (session.tv.intro) {
      stepSession(session);
    }

    stepSession(session, { ticks: 2 });

    expect(drawnWords(screen, session).score).toBe(true);
  });

  it('brings the cup title in on its band, never ahead of it', () => {
    const intro = finalSession().tv.intro;
    const title = wordsOf(intro.cup, 'en');
    const bare = [];

    while (intro.tick < intro.beats.teams) {
      const { context, calls } = spiedCanvas();

      drawIntro(context, intro, { tick: intro.tick });

      const written = calls.findLast((call) => call.name === 'fillText' && call.args[0] === title);
      const band = fillsIn(calls, CINE.panel[1])[0];

      context.font = written?.font ?? context.font;

      if (
        written &&
        (band?.args[2] ?? 0) < written.args[1] + context.measureText(title).width / 2
      ) {
        bare.push(intro.tick);
      }

      updateIntro(intro);
    }

    expect(bare).toEqual([]);
  });
});
