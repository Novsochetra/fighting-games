import { VILLAGE_FIELD } from '../../../art/venues/village-field.js';
import { WORLD_VIEW } from '../../../config.js';
import { rowAt, scaleAt } from '../../camera/lens.js';
import { bayer, hash2 } from '../kit/hash.js';

// now and then a drop falls in the puddle and sends out three rings that grow slowly and fade, lit
// on their far side and shaded on their near one. A drop is a hash of the tick alone, so a replay
// and a frame drawn twice show the same rings
export const DROPS = { every: 330, jitter: 150, gap: 28, rings: 3, speed: 0.09, most: 10 };

// where in the puddle a drop may land, from its home spot: where its widest ring stays on the water
export const DROP_SPOTS = [
  [0, 2],
  [-8, 4],
  [-16, 2],
  [-24, 4],
];

// a ring is `ACROSS` times as wide as it is deep, as a circle on the water looks from the stand
const ACROSS = 2.3;
const SPLASH_TICKS = 6;
// the screen pixels round the view a drop may fall in and still show a ring in it
const CULL = 40;
// samples a screen pixel of a ring's edge, so the ring is drawn whole with no gap in it
const SAMPLES_A_PIXEL = 1.3;
const WATER = VILLAGE_FIELD.water;

// a ring fades a step of the water's ramp at a time, and only its last steps break up, as a ring
// dithered all its life read as a string of dots
const TONES = [
  { from: 0.7, lit: 5, shade: 1, share: 1 },
  { from: 0.45, lit: 4, shade: 1, share: 1 },
  { from: 0.3, lit: 4, shade: 2, share: 0.5 },
  { from: 0, lit: 4, shade: 2, share: 0.25 },
];

export const toneOf = (strength) => TONES.find((tone) => strength >= tone.from);

const lifeOf = () => DROPS.gap * (DROPS.rings - 1) + DROPS.most / DROPS.speed;

// the drop falling at `tick`, or null between drops: where it fell and how long ago
export function dropAt(puddle, tick) {
  const cycle = Math.floor(tick / DROPS.every);
  const age = tick - cycle * DROPS.every - Math.floor(hash2(cycle, 0, 31) * DROPS.jitter);

  if (age < 0 || age >= lifeOf()) {
    return null;
  }

  const [dx, dy] = DROP_SPOTS[Math.floor(hash2(cycle, 1, 32) * DROP_SPOTS.length)];

  return { x: puddle.drop.x + dx, y: puddle.drop.y + dy, age };
}

// the rings out at a drop's age: each a radius and how much of it still shows, less as it grows
export function ringsOf(drop) {
  return Array.from({ length: DROPS.rings }, (_, ring) => ({
    ring,
    radius: 1 + (drop.age - ring * DROPS.gap) * DROPS.speed,
  }))
    .filter(({ radius }) => radius >= 1 && radius <= DROPS.most)
    .map(({ ring, radius }) => ({
      radius,
      strength: (1 - (radius / DROPS.most) * 0.7) * (1 - ring * 0.2),
    }));
}

// the screen pixel a point of the water lies in: the row the ground was baked with for its depth,
// at that row's own scale, so the rings lean with the ground as the camera slides
function pixelOf({ view }, x, y) {
  return {
    x: Math.floor(view.left + (x - view.x) * scaleAt(view.lens, y)),
    y: Math.floor(rowAt(view.lens, y)) + Math.round(view.top),
  };
}

// a ring's edge, a pixel at a time
function drawRing(context, { scene, drop, ring }) {
  const tone = toneOf(ring.strength);
  const wide = ACROSS * ring.radius * scaleAt(scene.view.lens, drop.y);
  const samples = Math.ceil(2 * Math.PI * wide * SAMPLES_A_PIXEL);
  let last = null;
  let shown = null;

  for (let i = 0; i < samples; i += 1) {
    const turn = (i / samples) * 2 * Math.PI;
    const pixel = pixelOf(
      scene,
      drop.x + Math.cos(turn) * ACROSS * ring.radius,
      drop.y + Math.sin(turn) * ring.radius,
    );

    if ((last?.x !== pixel.x || last?.y !== pixel.y) && bayer(pixel.x, pixel.y) < tone.share) {
      const colour = WATER[Math.sin(turn) < 0 ? tone.lit : tone.shade];

      // the canvas parses a colour each time one is set, and a ring changes its colour only twice
      if (colour !== shown) {
        context.fillStyle = colour;
        shown = colour;
      }

      context.fillRect(pixel.x, pixel.y, 1, 1);
    }

    last = pixel;
  }
}

// the drop striking the water, then the little jet it throws up
function drawSplash(context, scene, drop) {
  const pixel = pixelOf(scene, drop.x, drop.y);

  context.fillStyle = WATER[5];
  context.fillRect(pixel.x, pixel.y - (drop.age < 3 ? 0 : 2), drop.age < 3 ? 2 : 1, 1);
}

const onScreen = (pixel) =>
  pixel.x > -CULL &&
  pixel.x < WORLD_VIEW.width + CULL &&
  pixel.y > -CULL &&
  pixel.y < WORLD_VIEW.height + CULL;

// the drop's rings over the baked puddle, under the players
export function drawRipple(context, scene, puddle) {
  const drop = dropAt(puddle, scene.tick);

  if (!drop || !onScreen(pixelOf(scene, drop.x, drop.y))) {
    return;
  }

  if (drop.age < SPLASH_TICKS) {
    drawSplash(context, scene, drop);
  }

  for (const ring of ringsOf(drop)) {
    drawRing(context, { scene, drop, ring });
  }
}
