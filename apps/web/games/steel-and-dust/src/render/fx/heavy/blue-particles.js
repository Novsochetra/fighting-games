import { BLUE_HEAVY_ART } from '../../../art/heavy-fx/blue.js';
import { COLORS } from '../../../art/colors.js';
import { point } from '../../painter.js';

const art = BLUE_HEAVY_ART;
// the arms of the cold flash over its four ticks: it snaps open, then closes
const FLASH_ARMS = [3, 6, 4, 2];
const MIST_ALPHA = [0.45, 0.7, 0.9];

function ageOf(particle) {
  return particle.maxLife - particle.life;
}

// light that steps down as it dies rather than fading smoothly
function steppedShare(particle, levels) {
  const share = particle.life / particle.maxLife;
  return levels[Math.min(levels.length - 1, Math.floor(share * levels.length))];
}

function plus(painter, { x, y, arm, color }) {
  painter
    .use(color)
    .rect(x - arm, y, arm * 2 + 1, 1)
    .rect(x, y - arm, 1, arm * 2 + 1);
}

// a wisp of cold mist: a flat streak, pale over blue so it reads on light skies and dark, that
// shrinks to a point as it arrives
function blueMist(painter, particle) {
  const length = Math.max(1, Math.round((5 * particle.life) / particle.maxLife));
  const x = Math.round(particle.vx >= 0 ? particle.x - length + 1 : particle.x);
  const y = Math.round(particle.y);
  painter.alpha(steppedShare(particle, MIST_ALPHA));
  painter.use(art.mistFar).rect(x, y + 1, length, 1);
  painter.use(particle.color).rect(x + (length > 2 ? 1 : 0), y, Math.max(1, length - 2), 1);
  painter.alpha(1);
}

// frost forming: a point, then a cross, then a six-armed flake whose heart glints
function blueCrystal(painter, particle) {
  const x = Math.round(particle.x);
  const y = Math.round(particle.y);
  const size = Math.min(3, 1 + (ageOf(particle) >> 1));
  if (size === 1) {
    painter.use(art.ice).rect(x, y, 1, 1);
    return;
  }
  plus(painter, { x, y, arm: size - 1, color: art.ice });
  if (size === 3) {
    painter
      .use(art.deep)
      .rect(x - 1, y - 1, 1, 1)
      .rect(x + 1, y + 1, 1, 1);
    painter.rect(x + 1, y - 1, 1, 1).rect(x - 1, y + 1, 1, 1);
  }
  const glint = (particle.life >> 1) % 3 === 0;
  painter.use(glint ? art.shard : COLORS.white).rect(x, y, 1, 1);
}

// an ice shard: a white point with a short blue tail along its flight; landed, it lies and winks
function blueShard(painter, particle) {
  painter.alpha(particle.life < 5 ? 0.5 : 1);
  if (particle.landed) {
    const wink = (particle.life >> 2) % 2 ? art.shard : COLORS.white;
    painter.use(art.deep).rect(particle.x - 1, particle.y, 3, 1);
    painter.use(wink).rect(particle.x, particle.y, 1, 1);
  } else {
    const tail = point(particle.x - particle.vx * 1.4, particle.y - particle.vy * 1.4);
    painter.use(art.ice).line(point(particle.x, particle.y), tail, 1);
    painter.use(COLORS.white).rect(particle.x, particle.y, 1, 1);
  }
  painter.alpha(1);
}

// a hanging flake of frost that twinkles between a point and a small cross
function blueFlake(painter, particle) {
  const x = Math.round(particle.x);
  const y = Math.round(particle.y);
  painter.alpha(particle.life < 6 ? 0.5 : 1);
  if ((particle.life >> 1) % 3 === 0) {
    plus(painter, { x, y, arm: 1, color: art.ice });
    painter.use(COLORS.white).rect(x, y, 1, 1);
  } else {
    painter.use(particle.life % 2 ? art.rime : art.glow).rect(x, y, 1, 1);
  }
  painter.alpha(1);
}

// the one cold flash of the draw: a four-pointed star, long along the cut, that snaps open and shut
function blueFlash(painter, particle) {
  const x = Math.round(particle.x);
  const y = Math.round(particle.y);
  const age = ageOf(particle);
  const arm = Math.round((FLASH_ARMS[age] ?? 1) * (particle.size / 5));
  const tall = Math.max(1, Math.round(arm * 0.5));
  if (age === 1) {
    painter.use(art.glow).rect(x - arm + 2, y - 1, arm * 2 - 3, 3);
  }
  painter
    .use(COLORS.white)
    .rect(x - arm, y, arm * 2 + 1, 1)
    .rect(x, y - tall, 1, tall * 2 + 1);
  if (age < 2) {
    painter.diamond(x, y, 1);
  }
}

// the cut a blow leaves through the raider, as Absolute Zero's do: a long line, thick and white as it
// lands, drawing out and thinning to a blue hair
function blueCut(painter, particle) {
  const age = ageOf(particle);
  const half = 12 + age * 2.5;
  const dx = Math.cos(particle.angle) * half;
  const dy = Math.sin(particle.angle) * half * 0.7;
  const from = point(particle.x - dx, particle.y - dy);
  const to = point(particle.x + dx, particle.y + dy);
  if (age < 3) {
    painter.use(art.deep).line(from, to, 3);
  }
  painter.use(age < 5 ? COLORS.white : art.ice).line(from, to, 1);
}

export const BLUE_PARTICLE_DRAWS = {
  blueMist,
  blueCrystal,
  blueShard,
  blueFlake,
  blueFlash,
  blueCut,
};
