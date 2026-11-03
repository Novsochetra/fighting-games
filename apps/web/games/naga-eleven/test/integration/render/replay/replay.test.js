import { describe, expect, it } from 'vitest';
import { CINE } from '../../../../src/art/cinematics/palette.js';
import { WORLD_VIEW } from '../../../../src/config.js';
import { createActorArt } from '../../../../src/render/actors/index.js';
import { project } from '../../../../src/render/camera.js';
import { drawFrame } from '../../../../src/render/draw-frame.js';
import { createEffects, updateEffects } from '../../../../src/render/effects/index.js';
import { drawReplayChrome } from '../../../../src/render/replay/chrome.js';
import { createRecorder, recordFrame } from '../../../../src/render/replay/recorder.js';
import {
  createReplay,
  isReplayDone,
  replayCamera,
  replayFrameMatch,
  stepReplay,
} from '../../../../src/render/replay/replay.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { drainEvents } from '../../../../src/sim/events.js';
import { tick } from '../../../../src/sim/tick.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { numbersOf, recorder, strays } from '../cinematics/view-checks.js';

// the sim plays on, the recorder taping every tick, until a goal and a second after it
function tapeOfAGoal(seed) {
  const match = createMatch({ seed });
  const tape = createRecorder();
  let after = -1;

  for (let i = 0; i < 30000 && after !== 0; i += 1) {
    tick(match);
    recordFrame(tape, match);
    after = match.events.some((event) => event.type === 'goal') ? 60 : after - 1;
    drainEvents(match);
  }

  return { match, tape };
}

const { match, tape } = tapeOfAGoal(8);

const hexAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;

  return `#${[0, 1, 2].map((i) => canvas.data[at + i].toString(16).padStart(2, '0')).join('')}`;
};

describe('a goal replay of a real match', () => {
  it('was taped up to a goal', () => {
    expect(match.score[0] + match.score[1]).toBe(1);
    expect(tape.count).toBe(300);
  });

  it('keeps the ball in view with its camera all the way through', () => {
    const replay = createReplay(tape);
    const camera = replayCamera(replay);
    let steps = 0;

    while (!isReplayDone(replay)) {
      const { ball } = replayFrameMatch(replay);
      const spot = project(camera, ball.x, ball.y, ball.z);

      if (steps > 30) {
        expect(spot.x).toBeGreaterThan(0);
        expect(spot.x).toBeLessThan(WORLD_VIEW.width);
      }

      stepReplay(replay);
      steps += 1;
    }

    expect(steps).toBeGreaterThan(300);
  });

  it('draws through the real drawFrame, its chrome over it, with no NaN', () => {
    const replay = createReplay(tape);
    const art = createActorArt({ createCanvas: createPixelCanvas });
    let steps = 0;

    while (!isReplayDone(replay)) {
      if (steps % 25 === 0) {
        const { context, calls } = recorder();

        drawFrame(context, replayFrameMatch(replay), replayCamera(replay), {
          venue: 'national-stadium',
          createCanvas: createPixelCanvas,
          actors: art,
        });
        drawReplayChrome(context, replay, { tick: steps, lang: steps % 2 ? 'km' : 'en' });
        expect(numbersOf(calls).every(Number.isFinite)).toBe(true);
      }

      stepReplay(replay);
      steps += 1;
    }
  });

  it('tells the effects what happened once, so the goal is cheered once in the replay', () => {
    const replay = createReplay(tape);
    const effects = createEffects();
    const goals = new Set();

    while (!isReplayDone(replay)) {
      const frame = replayFrameMatch(replay);

      updateEffects(effects, frame, { camera: replayCamera(replay) });

      if (frame.events.some((event) => event.type === 'goal')) {
        goals.add(frame.tick);
      }

      stepReplay(replay);
    }

    expect(goals.size).toBe(1);
    expect(effects.goal).not.toBeNull();
  });

  it('frames the pitch in letterbox bars with the REPLAY tag in its corner', () => {
    const replay = createReplay(tape);
    const canvas = createPixelCanvas(768, 432);
    const context = canvas.getContext('2d');

    for (let i = 0; i < 40; i += 1) {
      stepReplay(replay);
    }

    drawFrame(context, replayFrameMatch(replay), replayCamera(replay), {
      venue: 'national-stadium',
      createCanvas: createPixelCanvas,
      actors: createActorArt({ createCanvas: createPixelCanvas }),
    });
    drawReplayChrome(context, replay, { tick: 0 });

    expect(hexAt(canvas, 400, 2)).toBe(CINE.letterbox);
    expect(hexAt(canvas, 400, 428)).toBe(CINE.letterbox);
    expect(hexAt(canvas, 14, 15)).toBe(CINE.replay[1]);
  });
});

describe('the replay chrome', () => {
  it('stays inside the view from the opening slash to the closing one', () => {
    const replay = createReplay(tape);

    while (!isReplayDone(replay)) {
      const { context, calls } = recorder();

      drawReplayChrome(context, replay, { tick: replay.age });
      expect(strays(calls)).toEqual([]);
      expect(numbersOf(calls).every(Number.isFinite)).toBe(true);
      stepReplay(replay);
    }
  });

  it('covers the view at the start and at the end, so the cut to and from it is hidden', () => {
    const replay = createReplay(tape);
    const covered = () => {
      const canvas = createPixelCanvas(768, 432);

      drawReplayChrome(canvas.getContext('2d'), replay, { tick: 0 });

      return [10, 380, 760].every((x) => canvas.data[(200 * 768 + x) * 4 + 3] === 255);
    };

    expect(covered()).toBe(true);

    while (replay.frames.length - 1 - replay.position > 1) {
      stepReplay(replay);
    }

    expect(covered()).toBe(true);
  });
});
