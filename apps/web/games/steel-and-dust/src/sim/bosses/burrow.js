import { moveLength } from '../../data/moves/define-move.js';
import { startMove } from '../fighters/actions.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';

const TUNNEL_SPEED = 2.2;
const CLOSE_ENOUGH = 3;

export const isTunnelling = (move, time) =>
  Boolean(move.tunnel?.some(([from, until]) => time >= from && time < until));

export const stopsTunnelling = (move, time) =>
  Boolean(move.tunnel?.some(([, until]) => time === until));

function kickSand(game, boss, count) {
  addDust(game, { x: boss.x, y: floorUnder(game.terrain, boss), count });
}

export function digIn(game, boss) {
  kickSand(game, boss, 8);
  game.io.sfx('dig', false, { x: boss.x });
}

// the mound runs at the spot the hero stands on, throwing up sand, and waits there
export function tunnelAfterHero(game, boss, _move, time) {
  const gap = game.player.x - boss.x;
  boss.vx = Math.abs(gap) < CLOSE_ENOUGH ? 0 : Math.sign(gap) * TUNNEL_SPEED;
  if (time % 8 === 0) {
    kickSand(game, boss, 2);
  }
}

// a stop that only shakes the mound and sprays sand, before it tunnels on: no red marks the ground
export function halt(game, boss, move, time) {
  boss.vx = 0;
  if (move.rumbles.includes(time)) {
    kickSand(game, boss, 10);
    shake(game, 2, 10);
    game.io.sfx('dig', false, { x: boss.x });
  }
}

export const surfacesNow = (move, time) => Boolean(move.then) && time === moveLength(move) - 1;

// she comes up facing the hero, in the move her burrow names
export function surface(game, boss, move) {
  boss.facing = game.player.x >= boss.x ? 1 : -1;
  startMove(game, boss, move.then);
}

// the earth bursts up behind her, so her stinger stabbing out of it stays in sight
export function erupt(game, boss) {
  const y = floorUnder(game.terrain, boss);
  const at = { x: boss.x, y, scale: 0.85, direction: boss.facing, behind: true };
  addBurst(game, { sprite: 'eruption', ...at });
  kickSand(game, boss, 12);
  shake(game, 4, 14);
  game.io.sfx('eruption', false, { x: boss.x });
}
