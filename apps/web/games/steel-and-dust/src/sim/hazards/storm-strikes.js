import { FX_COLORS } from '../../art/fx-colors.js';
import { fxLength } from '../../data/fx-sprites.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';

const STRIKE = { warn: 42, half: 12, damage: 10 };
const GREAT_STRIKE = { warn: 60, half: 36, damage: 18 };
// the whole column of sky to the ground, so a jump does not get out from under it
const COLUMN = 170;
const CRACKLE_EVERY = 4;

// the spot is marked on the ground; `warn` ticks later the lightning comes down on it
export function markStrike(game, boss, { x, great = false }) {
  const { warn, half, damage } = great ? GREAT_STRIKE : STRIKE;
  game.projectiles.push({
    kind: 'stormStrike',
    x,
    y: groundAt(game.terrain, x),
    direction: 1,
    speed: 0,
    side: boss.side,
    time: 0,
    warn,
    half,
    great,
    damage,
    hitTargets: new Set(),
  });
}

// it burns only on the frames the bolt stands full, 1 to 3 of its strip
export const isStriking = (strike) =>
  strike.time >= strike.warn + 3 && strike.time < strike.warn + 12;

export const strikeArea = (strike) => ({
  x: strike.x - strike.half,
  y: strike.y - COLUMN,
  width: strike.half * 2,
  height: COLUMN,
});

// the air over the spot crackles while the lightning gathers
function crackle(game, strike) {
  const x = strike.x + randomBetween(-strike.half, strike.half);
  addSparks(game, {
    x,
    y: strike.y - randomBetween(2, 14),
    count: 1,
    color: FX_COLORS.zap,
    speed: 1,
  });
}

// the sky whites out as it lands, and the great one shakes the whole arena
export function crackStrike(game, strike) {
  if (strike.time < strike.warn && strike.time % CRACKLE_EVERY === 0) {
    crackle(game, strike);
  }
  if (strike.time === strike.warn) {
    shake(game, strike.great ? 8 : 4, strike.great ? 26 : 10);
    game.flashTime = Math.max(game.flashTime, strike.great ? 16 : 6);
    addDust(game, { x: strike.x, y: strike.y, count: strike.great ? 16 : 6 });
    game.io.sfx('thunder', false, { vol: strike.great ? 1 : 0.6, x: strike.x });
  }
  strike.dead = strike.time >= strike.warn + fxLength('thunder');
}
