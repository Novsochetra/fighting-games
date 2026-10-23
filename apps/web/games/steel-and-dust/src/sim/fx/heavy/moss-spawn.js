import { MOSS_HEAVY_ART as ART } from '../../../art/heavy-fx/moss.js';
import { fxBetween, fxRandom } from '../fx-random.js';

function pick(game, colors) {
  return colors[Math.floor(fxRandom(game) * colors.length)];
}

function lifeBetween(game, low, high) {
  return Math.round(fxBetween(game, low, high));
}

// a glowing spore drifting up with a sway, as moss sheds them
export function addSpore(game, { x, y, vx = 0, vy = -0.5, life = 20 }) {
  game.particles.push({
    kind: 'mossSpore',
    x,
    y,
    vx,
    vy,
    phase: fxRandom(game) * Math.PI * 2,
    life: lifeBetween(game, life * 0.75, life),
    maxLife: life,
    color: pick(game, ART.spores),
  });
}

// a leaf thrown off the swing that slows, then flutters down and settles where it lands
export function addLeaf(game, { x, y, vx, vy, life = 26 }) {
  game.particles.push({
    kind: 'mossLeaf',
    x,
    y,
    vx,
    vy,
    turn: Math.floor(fxRandom(game) * 4),
    phase: fxRandom(game) * Math.PI * 2,
    life: lifeBetween(game, life * 0.75, life),
    maxLife: life,
    color: pick(game, ART.leaves),
  });
}

// a leaf torn from the air round the Shade and drawn into its core, arriving as the strike lands
export function addPulledLeaf(game, { at, ticks }) {
  const angle = -fxBetween(game, 0.2, Math.PI - 0.2);
  const distance = fxBetween(game, 20, 26);
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance * 0.7;
  game.particles.push({
    kind: 'mossLeaf',
    pulled: true,
    x: at.x + dx,
    y: at.y + dy,
    vx: -dx / ticks,
    vy: -dy / ticks,
    turn: Math.floor(fxRandom(game) * 4),
    phase: fxRandom(game) * Math.PI * 2,
    life: ticks,
    maxLife: ticks,
    color: pick(game, ART.leaves),
  });
}

// a thorn torn out of the grove's power where a blow lands, shooting out and slowing hard
export function addThorn(game, { x, y, angle, speed }) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  game.particles.push({
    kind: 'mossThorn',
    x,
    y,
    dx,
    dy,
    vx: dx * speed,
    vy: dy * speed,
    life: lifeBetween(game, 11, 15),
    maxLife: 15,
  });
}

// a bramble spike that pushes up out of the ground, stands a moment and sinks back
export function addBramble(game, { x, y, height, lean }) {
  const life = lifeBetween(game, 13, 17);
  game.particles.push({ kind: 'mossBramble', x, y, height, lean, life, maxLife: life });
}

// a burst of leaves or spores thrown along an angle off the way the Shade faces
export function throwSpray(game, add, { at, facing, angle, spread, speed, count, life }) {
  for (let i = 0; i < count; i++) {
    const heading = angle + fxBetween(game, -spread, spread);
    const velocity = fxBetween(game, speed * 0.5, speed);
    const vx = Math.cos(heading) * velocity * facing;
    const vy = Math.sin(heading) * velocity;
    add(game, { x: at.x, y: at.y, vx, vy, life });
  }
}
