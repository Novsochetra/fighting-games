import { describe, expect, it } from 'vitest';
import { UI_SCALE } from '../../../src/config.js';
import { createCamera, project, updateCamera } from '../../../src/render/camera.js';
import { rowAt, scaleAt } from '../../../src/render/camera/lens.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { isOnView } from '../../support/camera-watch.js';

// The sweep that opens a half took 150 ticks and the kick off waits 75: the ball was off the view
// for 71 of them, it was kicked mid-sweep, and the hold that keeps it in view jerked the view 90
// to 100 pixels in a tick to catch it; the first kick off did the same when the opening card was
// skipped. The sweep now runs on the kick off's own clock and rests on the spot before the whistle:
// it glides, never jumps, and its pace changes gently. In the world's pixels.
const MOST_STEP = 20 * UI_SCALE;
const MOST_CHANGE = UI_SCALE;

const viewAt = (camera) => ({
  x: camera.along.value * scaleAt(camera.lens, camera.depth.value),
  y: rowAt(camera.lens, camera.depth.value),
});

// steps through a kick off and the first second of play after it, as the app does
function kickOff(match, camera) {
  const steps = [];
  const changes = [];
  let at = viewAt(camera);
  let last = null;
  let offView = 0;

  while (match.phase === 'kickoff' || (match.phase === 'play' && match.phaseTicks < 60)) {
    tick(match);
    updateCamera(camera, match);
    drainEvents(match);

    const now = viewAt(camera);
    const step = { x: now.x - at.x, y: now.y - at.y };

    steps.push(Math.hypot(step.x, step.y));
    changes.push(last ? Math.hypot(step.x - last.x, step.y - last.y) : 0);
    offView += isOnView(project(camera, match.ball.x, match.ball.y), 0) ? 0 : 1;
    at = now;
    last = step;
  }

  return { mostStep: Math.max(...steps), mostChange: Math.max(...changes), offView };
}

function expectCalm(kick) {
  expect(kick.offView).toBe(0);
  expect(kick.mostStep).toBeLessThan(MOST_STEP);
  expect(kick.mostChange).toBeLessThan(MOST_CHANGE);
}

describe('the sweep that opens a half', () => {
  it.each(['7', '11'])('rests on the ball before the %s a side kick off is played', (format) => {
    const match = createMatch({ seed: 3, format, halfSeconds: 20 });
    const camera = createCamera(match);

    expectCalm(kickOff(match, camera));
  });

  it.each(['7', '11'])(
    'waits out an opening card, then sweeps in on time (%s a side)',
    (format) => {
      const match = createMatch({ seed: 4, format, halfSeconds: 20 });
      const camera = createCamera(match);

      // the card plays over the view while the match waits at its kick off; skipped after a second
      for (let i = 0; i < 60; i += 1) {
        updateCamera(camera, match);
      }

      expectCalm(kickOff(match, camera));
    },
  );

  it.each(['7', '11'])('opens the %s a side second half the same way', (format) => {
    const match = createMatch({ seed: 3, format, halfSeconds: 20 });
    const camera = createCamera(match);

    while (!(match.half === 2 && match.phase === 'kickoff')) {
      tick(match);
      updateCamera(camera, match);
      drainEvents(match);
    }

    // the half's first tick cuts to the far end under the half-time board; the sweep runs from it
    tick(match);
    updateCamera(camera, match);
    drainEvents(match);
    expectCalm(kickOff(match, camera));
  });
});
