import { fxLength } from '../../../data/fx-sprites.js';
import { addBurst } from '../../summons/bursts.js';
import { shedLeaf } from './bokator-particles.js';

// the gold flame his ultimate opens with burns fullest halfway through its strip, so it is lit that
// far ahead of the strike; a charged blow coils in a taller one, the full flame of the ultimate
const FLAME_PEAK = fxLength('gather') / 2;
const FLAME_SIZES = { C1: 1, C2: 1.1 };
const FLAME_SIZE = 0.9;
const FLAME_BACK = 5;

// a blow lands as his ultimate's do, on a gold fist-star; a flurry flashes now and then, not on
// every blow, so its stars never pile up
const STRIKE_SIZES = { K1: 0.75, C1: 0.8, C2: 0.9 };
const STRIKE_SIZE = 0.6;
const FLURRY_SIZE = 0.45;
const FLURRY_GAP = fxLength('strike') / 2;
const COLUMN_SIZE = 0.7;
// a fully charged blow cracks the road under the foot he plants, as his slam does; in the air,
// with no flame behind him, the breath held in his chest bursts out as a gold star
const BREAK_SIZE = 0.5;
const BREAK_AHEAD = 4;
const FLARE_SIZE = 0.5;

// the flame is spent into the blow as it lands, or a few ticks after a strike that lands nothing,
// breaking into gold leaf; left to burn out it would stand there as he drives on without it
export const FLAME_HOLD = 3;
const FLAME_HEART = 18;

export function flameTick(move) {
  return Math.max(0, move.startup - FLAME_PEAK);
}

export function coilFlame(game, fighter, move) {
  addBurst(game, {
    sprite: 'gather',
    x: fighter.x - fighter.facing * FLAME_BACK,
    y: fighter.y,
    scale: FLAME_SIZES[move.id] ?? FLAME_SIZE,
    direction: fighter.facing,
    behind: true,
  });
}

const burning = (summon) =>
  summon.kind === 'burst' && summon.sprite === 'gather' && summon.time < fxLength('gather');

export function spendFlame(game, fighter) {
  for (const flame of game.summons.filter(burning)) {
    flame.time = fxLength('gather');
    const heart = { x: flame.x, y: flame.y - FLAME_HEART * flame.scale };
    shedLeaf(game, heart, { count: 3, lift: 0.9, direction: fighter.facing });
  }
}

function starFlashing(game) {
  return game.summons.some(
    (summon) => summon.kind === 'burst' && summon.sprite === 'strike' && summon.time < FLURRY_GAP,
  );
}

export function strikeStar(game, hit) {
  const flurry = Boolean(hit.move.multiHit);
  if (flurry && starFlashing(game)) {
    return;
  }
  const scale = flurry ? FLURRY_SIZE : (STRIKE_SIZES[hit.move.id] ?? STRIKE_SIZE);
  addBurst(game, { sprite: 'strike', x: hit.x, y: hit.y, scale, direction: hit.attacker.facing });
}

// a launcher lifts the raider on a column of gold rising out of the ground under him
export function liftColumn(game, hit) {
  if (!hit.move.launch || hit.attacker.airborne) {
    return;
  }
  const { x } = hit;
  addBurst(game, { sprite: 'awaken', x, y: hit.attacker.y, scale: COLUMN_SIZE, behind: true });
}

export function breakGround(game, fighter) {
  const x = fighter.x + fighter.facing * BREAK_AHEAD;
  const at = { x, y: fighter.y, direction: fighter.facing };
  addBurst(game, { sprite: 'pounce', ...at, scale: BREAK_SIZE, behind: true });
}

export function chestFlare(game, fighter, chest) {
  const at = { ...chest, direction: fighter.facing };
  addBurst(game, { sprite: 'strike', ...at, scale: FLARE_SIZE });
}
