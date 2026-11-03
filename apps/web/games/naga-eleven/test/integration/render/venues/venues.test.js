import { describe, expect, it } from 'vitest';
import { createCamera, updateCamera } from '../../../../src/render/camera.js';
import { drawVenue, drawVenueFront, venueDrawables } from '../../../../src/render/venues/index.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { tick } from '../../../../src/sim/tick.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { createRecordingContext } from '../../../support/recording-context.js';

const VENUES = [
  'village-field',
  'provincial-ground',
  'city-school-stadium',
  'national-stadium',
  'asia-stadium',
  'world-stadium',
];
const options = (venue) => ({ venue, createCanvas: createPixelCanvas });

// a real match of the sim, played on for `ticks`, with the camera following it all the way
function matchAt(format, ticks) {
  const match = createMatch({ seed: 7, format });
  const camera = createCamera(match);

  for (let i = 0; i < ticks; i += 1) {
    tick(match);
    match.events.length = 0;
    updateCamera(camera, match);
  }

  return { match, camera };
}

function drawWhole(context, venue, { match, camera }) {
  drawVenue(context, camera, match, options(venue));

  for (const drawable of venueDrawables(camera, match, options(venue))) {
    drawable.draw(context);
  }

  drawVenueFront(context, camera, match, options(venue));
}

const numbersOf = (calls) =>
  calls.flatMap((call) => call.args).filter((arg) => typeof arg === 'number');

function averageColour(canvas) {
  const sums = [0, 0, 0];

  for (let i = 0; i < canvas.data.length; i += 4 * 97) {
    sums.forEach((_, channel) => {
      sums[channel] += canvas.data[i + channel];
    });
  }

  return sums;
}

// each venue for each format at kickoff and well into the match, made once: a venue is drawn
// once for a pitch and kept, so its moments are checked together
const SCENES = ['7', '11'].flatMap((format) => [
  { format, moment: 'kickoff', ...matchAt(format, 1) },
  { format, moment: 'mid-match', ...matchAt(format, 900) },
]);

function checkScene(venue, scene) {
  const canvas = createPixelCanvas(768, 432);
  const { context, calls } = createRecordingContext();

  drawVenue(canvas.getContext('2d'), scene.camera, scene.match, options(venue));
  drawWhole(context, venue, scene);

  const depths = venueDrawables(scene.camera, scene.match, options(venue)).map(
    (drawable) => drawable.depth,
  );

  return {
    opaque: canvas.data.filter((_, i) => i % 4 === 3).every((alpha) => alpha === 255),
    finite: numbersOf(calls).every(Number.isFinite),
    sorted: depths.every((depth, i) => i === 0 || depth >= depths[i - 1]),
  };
}

describe('the venues', () => {
  it.each(VENUES)(
    '%s fills the view at kickoff and mid-match, 7 and 11 a side, never at NaN',
    (venue) => {
      for (const scene of SCENES) {
        expect(checkScene(venue, scene), `${scene.format} a side, ${scene.moment}`).toEqual({
          opaque: true,
          finite: true,
          sorted: true,
        });
      }
    },
    30000,
  );

  it('look like six different places from the same seat', () => {
    const scene = SCENES[3];
    const looks = VENUES.map((venue) => {
      const canvas = createPixelCanvas(768, 432);

      drawWhole(canvas.getContext('2d'), venue, scene);

      return averageColour(canvas).join(',');
    });

    expect(new Set(looks).size).toBe(VENUES.length);
  }, 30000);
});
