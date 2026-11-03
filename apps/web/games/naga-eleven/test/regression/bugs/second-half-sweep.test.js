import { describe, expect, it } from 'vitest';
import { createCamera, project, updateCamera } from '../../../src/render/camera.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { isOnView } from '../../support/camera-watch.js';

// the second half opens on a sweep from one end of the ground to the centre spot that takes twice
// as long as the wait for the whistle, and the camera kept sweeping on past the kick off, the ball
// already played, before it looked for the ball again
function step(match, camera) {
  tick(match);
  updateCamera(camera, match);
  drainEvents(match);
}

function playUntil(match, camera, isDone) {
  while (!isDone(match) && match.phase !== 'over') {
    step(match, camera);
  }
}

describe('the sweep that opens the second half', () => {
  it.each(['7', '11'])('gives way to the ball once the %s a side kick off is played', (format) => {
    const match = createMatch({ seed: 3, format, halfSeconds: 20 });
    const camera = createCamera(match);

    playUntil(match, camera, (each) => each.half === 2 && each.phase === 'kickoff');

    expect(camera.pan).not.toBeNull();

    playUntil(match, camera, (each) => each.phase === 'play');

    expect(camera.pan).toBeNull();

    for (let i = 0; i < 120; i += 1) {
      step(match, camera);

      expect(isOnView(project(camera, match.ball.x, match.ball.y), 40)).toBe(true);
    }
  });
});
