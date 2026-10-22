import { bodyPoint } from '../fighters/body-point.js';
import { groundAt } from '../stage/terrain.js';

const LANCE_SPEED = 6;
const LANCE_DAMAGE = 14;
const LANCE_LENGTH = 70;
// the burning core reaches this far above and below the lance's middle
const LANCE_CORE = 4;
// the flame in the furnace's open mouth on the firing frame, in his own units (body-point.js); a
// lance starts a little inside that flame's tip, so it grows out of it
export const FURNACE_MOUTH = { ahead: 4, up: 19 };
// his chest stands over a hero's head, so the lance dives over this stretch to run at a hero's
// waist, low enough to jump
const DIVE = 42;
const WAIST = 14;
const TIP_REACH = 6;

// a lance of flame leaves the open furnace, dives to a hero's waist and runs level down the arena
export function looseLance(game, boss) {
  const mouth = bodyPoint(boss, FURNACE_MOUTH);
  game.projectiles.push({
    kind: 'flameLance',
    x: mouth.x,
    y: mouth.y,
    mouth,
    bend: { x: mouth.x + boss.facing * DIVE, y: boss.y - WAIST },
    direction: boss.facing,
    speed: LANCE_SPEED,
    side: boss.side,
    time: 0,
    damage: LANCE_DAMAGE,
    hitTargets: new Set(),
  });
  game.io.sfx('flame', false, { x: boss.x, dir: boss.facing });
}

const diving = (lance) => Math.abs(lance.x - lance.mouth.x) < DIVE;
const diveAngle = (lance) => Math.atan2(lance.bend.y - lance.mouth.y, DIVE);

// the stretches of the lance's path its body lies along, tip first: each is drawn as the beam with
// its tip at `tip`, turned by `angle`, showing what lies `from` to `to` behind that tip; behind the
// bend the beam goes on up its dive to the furnace's mouth, never past it
export function lanceParts(lance) {
  const angle = diveAngle(lance);
  const run = Math.abs(lance.x - lance.mouth.x);
  if (diving(lance)) {
    return [{ tip: lance, angle, from: 0, to: Math.min(LANCE_LENGTH, run / Math.cos(angle)) }];
  }
  const level = Math.abs(lance.x - lance.bend.x);
  const parts = [{ tip: lance, angle: 0, from: 0, to: Math.min(LANCE_LENGTH, level) }];
  if (level < LANCE_LENGTH) {
    const past = { x: Math.cos(angle) * level * lance.direction, y: Math.sin(angle) * level };
    const tip = { x: lance.bend.x + past.x, y: lance.bend.y + past.y };
    const to = Math.min(LANCE_LENGTH, level + DIVE / Math.cos(angle));
    parts.push({ tip, angle, from: level, to });
  }
  return parts;
}

// what burns: the tip as it dives, then the level stretch behind it
export function lanceArea(lance) {
  const height = LANCE_CORE * 2;
  if (diving(lance)) {
    return { x: lance.x - TIP_REACH, y: lance.y - LANCE_CORE, width: TIP_REACH * 2, height };
  }
  const [{ to }] = lanceParts(lance);
  const left = lance.direction > 0 ? lance.x - to : lance.x;
  return { x: left, y: lance.y - LANCE_CORE, width: to, height };
}

// it dives from his chest to the bend, then flies level and burns out against a rise in the road
// that comes up to its core
export function runLance(game, lance) {
  const run = Math.min(1, Math.abs(lance.x - lance.mouth.x) / DIVE);
  lance.y = lance.mouth.y + (lance.bend.y - lance.mouth.y) * run;
  lance.dead = groundAt(game.terrain, lance.x) <= lance.y + LANCE_CORE;
}
