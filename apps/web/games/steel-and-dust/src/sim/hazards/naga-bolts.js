import { FX_COLORS } from '../../art/fx-colors.js';
import { addSparks } from '../fx/particles.js';
import { timelineFrame } from '../enemy-animation.js';
import { groundAt } from '../stage/terrain.js';

const BOLT_SPEED = 3.4;
const BOLT_DAMAGE = 9;
// a head's water naga hovers at its mouth while its lane is marked, then dives to its lane
export const BOLT_WARN = 16;
const DIVE_TICKS = 8;
// low skims the shins (jump it), high flies over a standing hero's head (stay down)
const LANE_HEIGHT = { low: 10, high: 46 };
// the open mouths of the five heads striking forward in each striking frame of the Seven Heads
// (sevenHeads frames 4 and 5), top to bottom, [ahead, up] from her feet in her own units (sheet
// pixels over twice her scale)
export const HEAD_MOUTHS = {
  4: [
    [20, 29],
    [18, 25],
    [17, 21],
    [15, 17],
    [13, 13],
  ],
  5: [
    [19, 27],
    [16, 22],
    [19, 19],
    [17, 15],
    [15, 11],
  ],
};

// the strike of the Seven Heads that leaves a mouth on this tick of the move, if any
export function headAt(move, time) {
  return move.heads?.find(([at]) => at === time);
}

// a head spits from its open mouth in the striking frame she shows on that tick
export function spitHead(game, boss, [at, head, lane]) {
  const [ahead, up] = HEAD_MOUTHS[timelineFrame(boss.move, at)][head];
  const x = boss.x + boss.facing * ahead * boss.scale;
  const y = boss.y - up * boss.scale;
  game.projectiles.push({
    kind: 'nagaBolt',
    x,
    y,
    from: y,
    height: LANE_HEIGHT[lane],
    laneY: groundAt(game.terrain, x) - LANE_HEIGHT[lane],
    direction: boss.facing,
    speed: 0,
    side: boss.side,
    time: 0,
    damage: BOLT_DAMAGE,
    hitTargets: new Set(),
  });
  addSparks(game, { x, y, count: 4, color: FX_COLORS.foam, speed: 1.2 });
  game.io.sfx('nagaHiss', false, { x, dir: boss.facing });
}

// it waits at the mouth, dives to its lane over a few ticks and flies on level with the floor
export function flyNagaBolt(game, bolt) {
  const flying = bolt.time - BOLT_WARN;
  bolt.speed = flying >= 0 ? BOLT_SPEED : 0;
  bolt.laneY = groundAt(game.terrain, bolt.x) - bolt.height;
  const share = Math.min(1, Math.max(0, flying) / DIVE_TICKS);
  bolt.y = bolt.from + (bolt.laneY - bolt.from) * share;
}

export const isDarting = (bolt) => bolt.time >= BOLT_WARN;
