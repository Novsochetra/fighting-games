import { addDust } from '../fx/particles.js';
import { groundAt, isWall } from '../stage/terrain.js';

const SPIKE_DAMAGE = 12;
const FIRST_GAP = 26;

// the stomp splits the road: stone spikes burst up one after another away from the boss, until a
// rise too tall to step up stops the line
export function raiseSpikes(game, fighter, { count, gap, every, bothWays }) {
  const directions = bothWays ? [fighter.facing, -fighter.facing] : [fighter.facing];
  for (const direction of directions) {
    let floor = groundAt(game.terrain, fighter.x);
    for (let i = 0; i < count; i++) {
      const x = fighter.x + direction * (FIRST_GAP + i * gap);
      if (isWall(game.terrain, x, floor)) {
        break;
      }
      floor = groundAt(game.terrain, x);
      game.projectiles.push({
        kind: 'spike',
        x,
        y: floor,
        direction,
        speed: 0,
        side: fighter.side,
        time: -(2 + i * every),
        damage: SPIKE_DAMAGE,
        hitTargets: new Set(),
      });
    }
  }
}

// a spike waits under a crack in the road, then bursts up with a crunch
export function riseSpike(game, spike) {
  if (spike.time === 0) {
    addDust(game, { x: spike.x, y: spike.y, count: 4 });
    game.io.sfx('break', false, { x: spike.x, vol: 0.5 });
  }
}
