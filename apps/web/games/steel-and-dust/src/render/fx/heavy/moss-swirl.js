import { mossCoreOf } from '../../../sim/fx/heavy/moss-swing.js';

// in the air, spores swirl round the Shade's core on two tilted rings as it winds up, closing in as it
// gathers; the far side of each ring is drawn behind it, so the swirl wraps its body (on the ground
// the ring at its feet does this, moss-ring.js)
const MOTES = 6;
const RINGS = [
  { dy: -4, tilt: 0.35 },
  { dy: 3, tilt: 0.28 },
];
const TAIL = 3;
const SPIN = 0.42;
const FAR = 20;
const NEAR = 6;
// in the last ticks of the wind-up the swirl has closed into a seed of light at the core
const SEED_LEAD = 2;

function tailColor(step, art) {
  return [art.bloom, art.glow, art.thornLight, art.thorn][step];
}

function drawMote(painter, { core, ring, angle, radius, facing, art }) {
  for (let step = TAIL; step >= 0; step--) {
    const turn = angle - step * 0.24 * facing;
    const reach = radius + step;
    const x = core.x + Math.cos(turn) * reach;
    const y = core.y + ring.dy + Math.sin(turn) * reach * ring.tilt;
    painter.use(tailColor(step, art)).rect(x, y, step === 0 ? 2 : 1, 1);
  }
}

function drawSeed(painter, { core, art, tickCount }) {
  const big = (tickCount >> 1) & 1;
  painter.use(art.glow).rect(core.x - 1 - big, core.y, 3 + big * 2, 1);
  painter.rect(core.x, core.y - 1 - big, 1, 3 + big * 2);
  painter.use(art.bloom).rect(core.x, core.y, 1, 1);
}

export function drawSwirl(painter, layer, front) {
  const { fighter, move, time, art } = layer;
  const left = move.startup - time;
  if (left <= 0) {
    return;
  }
  const core = mossCoreOf(fighter);
  if (left <= SEED_LEAD) {
    if (front) {
      drawSeed(painter, { core, art, tickCount: layer.tickCount });
    }
    return;
  }
  if (!fighter.airborne) {
    return;
  }
  const share = time / Math.max(1, move.startup - SEED_LEAD);
  const radius = FAR - (FAR - NEAR) * share;
  for (let i = 0; i < MOTES; i++) {
    const ring = RINGS[i % RINGS.length];
    const angle = (i / MOTES) * Math.PI * 2 + time * SPIN * fighter.facing;
    if (Math.sin(angle) > 0 === front) {
      drawMote(painter, { core, ring, angle, radius, facing: fighter.facing, art });
    }
  }
}
