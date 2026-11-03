import { describe, expect, it } from 'vitest';
import { createCamera } from '../../../src/render/camera.js';
import { venueLayers } from '../../../src/render/venues/cache.js';
import { VENUES } from '../../../src/render/venues/catalog.js';
import { venueDrawables } from '../../../src/render/venues/index.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { createRecordingContext } from '../../support/recording-context.js';

// The photographers behind the goals fired their flashes only while the crowd cheered a goal, and
// knelt dark through all the open play of a match. They fire now and then in open play too, and
// most with the play near the goal they kneel behind.

const VENUE = 'national-stadium';
const match = createMatch({ seed: 3, format: '11' });
const camera = createCamera(match);

camera.along.value = match.pitch.length * 0.1;
match.phase = 'play';

const { canvases } = venueLayers(VENUES[VENUE], camera, match, createPixelCanvas).sprites
  .photographer;
// each drawing, then the same mirrored: the second of each fires the flash
const FLASHES = new Set([canvases[1], canvases[3]]);

// the ticks of a minute of open play, with the ball at `x`, that a flash shows in
function flashTicks(x, from) {
  const lit = [];

  match.ball.x = x;

  for (let tick = from; tick < from + 3600; tick += 1) {
    const { context, calls } = createRecordingContext();
    const options = { venue: VENUE, tick, createCanvas: createPixelCanvas };

    for (const drawable of venueDrawables(camera, match, options)) {
      drawable.draw(context);
    }

    if (calls.some(({ name, args }) => name === 'drawImage' && FLASHES.has(args[0]))) {
      lit.push(tick);
    }
  }

  return lit;
}

describe('the photographers behind the goal', () => {
  it('fire in open play, with no goal to cheer, and most with the play near their goal', () => {
    const near = flashTicks(match.pitch.length * 0.06, 1000);
    const far = flashTicks(match.pitch.length * 0.5, 5000);

    expect(match.score).toEqual([0, 0]);
    expect(far.length).toBeGreaterThan(0);
    expect(near.length).toBeGreaterThan(far.length * 3);
  }, 30000);
});
