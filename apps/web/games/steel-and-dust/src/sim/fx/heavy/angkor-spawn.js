import { ANGKOR_HEAVY_ART as ART } from '../../../art/heavy-fx/angkor.js';
import { fxBetween, fxRandom } from '../fx-random.js';

const GRIT_COLORS = [ART.gold, ART.rim, ART.sand];
const CHIP_COLORS = [ART.stone, ART.sand, ART.stoneShade];
const SAND_COLORS = [ART.sand, ART.gold, ART.stone];
const PETAL_COLORS = [ART.lotus, ART.lotusDeep, ART.hot];

function pick(game, colors) {
  return colors[Math.floor(fxRandom(game) * colors.length)];
}

function push(game, particle) {
  game.particles.push({ ...particle, maxLife: particle.life });
}

// a grain of sandstone lifting off the ground about the rim of the seal under his feet
export function liftGrit(game, { x, y, spread }) {
  const side = fxRandom(game) < 0.5 ? -1 : 1;
  push(game, {
    kind: 'angkorGrit',
    x: x + side * fxBetween(game, spread * 0.7, spread * 1.05),
    y: y + 1,
    vx: fxBetween(game, -0.15, 0.15),
    vy: -fxBetween(game, 1, 1.8),
    life: Math.round(fxBetween(game, 14, 20)),
    size: fxRandom(game) < 0.5 ? 2 : 1,
    color: pick(game, GRIT_COLORS),
  });
}

// pink light drawn in to a point from a ring round it, turning the way he faces
export function swirlPetal(game, { x, y, facing }) {
  push(game, {
    kind: 'angkorSwirl',
    x,
    y,
    centerX: x,
    centerY: y,
    angle: fxRandom(game) * Math.PI * 2,
    radius: fxBetween(game, 16, 22),
    spin: facing * 0.26,
    life: 7,
    size: 1,
    color: pick(game, PETAL_COLORS),
  });
}

// chips of stone thrown up from a point, `direction` 1 or -1 or 0 for either way
export function kickChips(game, { x, y, count, direction, speed = 1.6 }) {
  for (let i = 0; i < count; i++) {
    const side = direction || (i % 2 ? 1 : -1);
    push(game, {
      kind: 'angkorChip',
      x: x + fxBetween(game, -2, 2),
      y: y - 1,
      vx: side * fxBetween(game, speed * 0.3, speed),
      vy: -fxBetween(game, 1.2, 2.6),
      life: Math.round(fxBetween(game, 18, 26)),
      size: i % 3 === 0 ? 2 : 1,
      color: CHIP_COLORS[i % CHIP_COLORS.length],
    });
  }
}

// petals flung from a point in a fan the way the blow goes
export function scatterPetals(game, { x, y, count, direction }) {
  for (let i = 0; i < count; i++) {
    const angle = fxBetween(game, -1.1, 0.7);
    const speed = fxBetween(game, 1.4, 2.8);
    push(game, {
      kind: 'angkorPetal',
      x,
      y,
      vx: direction * Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: Math.round(fxBetween(game, 12, 18)),
      size: i % 2 ? 1 : 2,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
    });
  }
}

// a grain of sand poured off the blade where it passes
export function pourSand(game, { x, y, direction }) {
  push(game, {
    kind: 'angkorSand',
    x: x + fxBetween(game, -2, 2),
    y: y + fxBetween(game, -2, 2),
    vx: direction * fxBetween(game, 0.2, 0.8),
    vy: -fxBetween(game, 0, 0.6),
    life: Math.round(fxBetween(game, 14, 20)),
    size: 1,
    color: pick(game, SAND_COLORS),
  });
}

// a petal shed behind the blade, drifting back
export function shedPetal(game, { x, y, direction }) {
  push(game, {
    kind: 'angkorPetal',
    x,
    y,
    vx: direction * fxBetween(game, 0.4, 1),
    vy: -fxBetween(game, 0.2, 0.6),
    life: Math.round(fxBetween(game, 14, 18)),
    size: 1,
    color: pick(game, PETAL_COLORS),
  });
}

export function openBloom(game, { x, y, small }) {
  push(game, {
    kind: 'angkorBloom',
    x,
    y,
    vx: 0,
    vy: 0,
    life: small ? 9 : 13,
    small,
    spin: fxRandom(game),
  });
}
