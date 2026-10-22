import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { addRing } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';
import { rushTargets } from './lion-rush.js';
import { FISTS_ROW } from './rush-timing.js';

// the stance he coils in, low with both fists up
export const COIL_FRAME = ['rising_dragon', 0, FISTS_ROW];
const MOTE_TICKS = 14;
const MOTE_REACH = 46;

// he draws the lion's breath: gold flares off his fists and a gold flame rises behind him
export function breatheIn(game, player) {
  const x = player.x + player.facing * 10;
  addSparks(game, { x, y: player.y - 44, count: 14, color: FX_COLORS.lionGold, speed: 2.8 });
  addSparks(game, { x, y: player.y - 30, count: 8, color: FX_COLORS.lionDeep, speed: 1.8 });
  addBurst(game, { sprite: 'gather', x: player.x, y: player.y, scale: 1.1, behind: true });
  player.rush = { targets: [], fromX: player.x, facing: player.facing };
  game.io.sfx('chargeLevel1');
}

// gold drawn in from all round him, as a charge gathers
export function gatherMote(game, player) {
  const angle = Math.random() * Math.PI * 2;
  const reach = randomBetween(MOTE_REACH * 0.6, MOTE_REACH);
  const centre = { x: player.x, y: player.y - 26 };
  game.particles.push({
    kind: 'mote',
    x: centre.x + Math.cos(angle) * reach,
    y: centre.y + Math.sin(angle) * reach,
    vx: (-Math.cos(angle) * reach) / MOTE_TICKS,
    vy: (-Math.sin(angle) * reach) / MOTE_TICKS,
    life: MOTE_TICKS,
    maxLife: MOTE_TICKS,
    color: game.tickCount % 2 ? FX_COLORS.lionGold : FX_COLORS.reliefRim,
  });
}

// the breath let out: a ring of gold, and he picks the raiders to rush
export function unleash(game, player) {
  addRing(game, { x: player.x, y: player.y - 26, color: FX_COLORS.lionGold });
  addSparks(game, {
    x: player.x,
    y: player.y - 26,
    count: 16,
    color: FX_COLORS.lionGold,
    speed: 4,
  });
  player.rush.targets = rushTargets(game, player);
  game.io.sfx('chargeMax');
}
