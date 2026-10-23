import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { bodyPoint, bodySize } from '../fighters/body-point.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { openRift } from '../hazards/rifts.js';
import { addBurst } from '../summons/bursts.js';

// the middle of the whirl round him as he spins (frames 4-6), where his hammer meets the road as he
// cleaves (frame 9), and the sizes of the whirl and the impact, in his own units (body-point.js)
export const WAIST = { ahead: 4, up: 26 };
export const HAMMER_HEAD = { ahead: 18 };
const WHIRL_SIZE = 1;
const IMPACT_SIZE = 1;
// the hammer whooshes once a turn of the spin
const WHOOSH_EVERY = 12;
const WHIRL_LOOP = [1, 4];

export const whirlsAt = (move, time) => Boolean(move.whirl) && time === move.startup;

export const whooshesAt = (move, time) =>
  Boolean(move.whirl) && time >= move.startup && (time - move.startup) % WHOOSH_EVERY === 0;

// a red whirl spins round him behind his body for as long as he spins, one through both runs
export function spinWhirl(game, boss) {
  if (game.summons.some((summon) => summon.follow?.fighter === boss)) {
    return;
  }
  addBurst(game, {
    sprite: 'axeWhirl',
    ...bodyPoint(boss, WAIST),
    scale: bodySize(boss, WHIRL_SIZE),
    direction: boss.facing,
    behind: true,
    follow: { fighter: boss, at: WAIST, loop: WHIRL_LOOP, whileMove: 'whirl' },
  });
}

export function whoosh(game, boss) {
  game.io.sfx('axeWhirl', false, { x: boss.x, dir: boss.facing });
}

// the hammer splits the road where it lands, and the crack runs off both ways in red
export function cleave(game, boss) {
  const { x } = bodyPoint(boss, HAMMER_HEAD);
  const y = floorUnder(game.terrain, boss);
  const scale = bodySize(boss, IMPACT_SIZE);
  addBurst(game, { sprite: 'impact', x, y, scale, direction: boss.facing });
  openRift(game, { x, side: boss.side, color: BOSS_ULT_COLORS[boss.kind].title });
  shake(game, 7, 20);
  game.io.sfx('cleave', false, { x });
}
