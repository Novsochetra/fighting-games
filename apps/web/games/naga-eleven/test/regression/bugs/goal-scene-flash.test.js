import { describe, expect, it } from 'vitest';
import { EFFECT_COLOURS } from '../../../src/art/actors.js';
import { HUD } from '../../../src/art/hud.js';
import { VIEW } from '../../../src/config.js';
import { BANNER_TEXT } from '../../../src/render/hud/labels.js';
import { drawMatchSession } from '../../../src/ui/flow/match-draw.js';
import {
  fillsIn,
  finalSession,
  skipIntro,
  spiedCanvas,
  stepSession,
  textsOf,
} from '../../support/story-session.js';

// A goal that opened a story scene (the Naga Shot's "WHAT WAS THAT?!" in the chapter 1 final)
// froze its own show for the whole dialogue: the scene holds the match at the goal's first tick,
// and the flash and the GOAL banner are timed by the match's ticks, so the pitch stayed washed
// white and the banner was an empty dark plate. Under a scene the flash is gone and the banner
// either reads in full or waits.
const GOAL_SCENE = [{ when: 'goalFor', scene: 'ch1-final-naga-goal' }];

function scoreForChrey(session) {
  const { match } = session;

  skipIntro(session);

  while (match.phase !== 'play') {
    stepSession(session);
  }

  const hero = match.players.find((player) => player.team === 0 && player.star === 'sochetra');
  const keeper = match.players.find((player) => player.team === 1 && player.role === 'keeper');
  const { length, width } = match.pitch;

  keeper.y = 40;
  Object.assign(match.ball, { owner: null, kick: null, x: length - 12, y: width / 2 + 15 });
  Object.assign(match.ball, { z: 8, vx: 7, vy: 0, vz: 0, lastTouch: hero.index });

  for (let i = 0; i < 40 && !session.overlay; i += 1) {
    stepSession(session);
  }
}

const isFullView = (call) =>
  call.args[0] === 0 &&
  call.args[1] === 0 &&
  call.args[2] === VIEW.width &&
  call.args[3] === VIEW.height;

function drawnFrame(session) {
  const { context, calls } = spiedCanvas();

  drawMatchSession(context, session, { tick: 500 });

  const goalLetters = [...BANNER_TEXT.goal.en];
  const texts = new Set(textsOf(calls));

  return {
    flash: fillsIn(calls, EFFECT_COLOURS.flash).filter(isFullView).length,
    plate: fillsIn(calls, HUD.banner).length > 0,
    words: goalLetters.every((letter) => texts.has(letter)),
  };
}

describe('a goal that opens a story scene', () => {
  it('shows no frozen flash and no empty GOAL plate under the scene', () => {
    const session = finalSession({ triggers: GOAL_SCENE });

    scoreForChrey(session);

    expect(session.match.score).toEqual([1, 0]);
    expect(session.overlay).toBeTruthy();

    for (const ticks of [1, 30, 200]) {
      stepSession(session, { ticks });

      const drawn = drawnFrame(session);

      expect(session.overlay).toBeTruthy();
      expect(drawn.flash).toBe(0);
      expect(drawn.plate && !drawn.words).toBe(false);
    }
  });

  it('flashes and raises its GOAL banner once the scene is over', () => {
    const session = finalSession({ triggers: GOAL_SCENE });

    scoreForChrey(session);
    session.overlay = null;
    stepSession(session, { ticks: 20 });

    const drawn = drawnFrame(session);

    expect(drawn.plate && drawn.words).toBe(true);
  });
});
