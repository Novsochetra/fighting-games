import { hash } from '../../../../../../src/render/duel/hash.js';
import { SHOT_ART } from '../../colors.js';
import { dithered, spark } from './kit.js';

// solid steps from deep to bright in toward the ball, the pixel-art stand-in for a glow
const BANDS = [
  { grow: 7, color: SHOT_ART.emerald[1], share: 0.5 },
  { grow: 5, color: SHOT_ART.emerald[2], share: 1 },
  { grow: 3.2, color: SHOT_ART.emerald[3], share: 1 },
  { grow: 1.6, color: SHOT_ART.emerald[4], share: 1 },
  { grow: 0.6, color: SHOT_ART.gold[3], share: 1 },
];

const BALL_RADIUS = 5.5;

// flames lick upward, so the aura reaches further above the ball than below it
const RISE = 1.35;

function row(pen, { x, top, half, band }) {
  if (band.share >= 1) {
    pen.rect([Math.round(x - half), top, Math.round(half * 2) + 1, 1], band.color);

    return;
  }

  for (let column = Math.round(x - half); column <= Math.round(x + half); column += 1) {
    if (dithered(column, top, band.share)) {
      pen.dot(column, top, band.color);
    }
  }
}

function flameBlob(pen, { x, y, radius, band, beat, salt }) {
  for (let top = Math.floor(y - radius * RISE); top <= Math.ceil(y + radius); top += 1) {
    const reach = top < y ? radius * RISE : radius;
    const down = (top + 0.5 - y) / reach;

    if (Math.abs(down) < 1) {
      const lick = top < y ? Math.floor(hash(top, beat, salt) * 3) : hash(top, beat, salt) < 0.35;
      const half = radius * Math.sqrt(1 - down * down) * (top < y ? 1 - 0.4 * -down : 1) + lick;

      row(pen, { x, top, half, band });
    }
  }
}

const TONGUES = [-4, -1, 2, 5];

function tongues(pen, { x, top, band, beat, salt, power }) {
  TONGUES.forEach((offset, i) => {
    const height = Math.round((1 + hash(beat, i, salt, 33) * 5) * power);

    if (height > 0 && band.share >= 1) {
      pen.rect([x + offset - 1, top - height + 1, 2, height], band.color);
    }
  });
}

export function drawBallAura(pen, { ball, power, tick }) {
  if (power <= 0) {
    return;
  }

  const beat = Math.floor(tick / 3);
  const x = Math.round(ball.x);
  const y = Math.round(ball.y);

  BANDS.forEach((band, salt) => {
    const flick = hash(beat, salt, 31) < 0.5 ? 0 : 1;
    const radius = BALL_RADIUS + band.grow * power + flick * Math.min(1, power * 2);

    tongues(pen, { x, top: Math.round(y - radius * RISE * 0.8), band, beat, salt, power });
    flameBlob(pen, { x, y, radius, band, beat, salt });
  });
}

export function drawBallGlint(pen, { ball, power, tick }) {
  const beat = Math.floor(tick / 4) % 6;

  if (power < 0.4 || beat > 1) {
    return;
  }

  spark(pen, {
    x: ball.x - 3,
    y: ball.y - 4,
    reach: beat === 0 ? 2 : 1,
    core: SHOT_ART.white,
    arm: SHOT_ART.gold[3],
  });
}
