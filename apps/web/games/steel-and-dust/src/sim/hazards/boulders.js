import { clamp } from '../../lib/math.js';
import { bodyPoint, bodySize } from '../fighters/body-point.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { floorBelow } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';
import { hitArea } from './shot-hits.js';

const GRAVITY = 0.18;
const LOB_LIFT = -4.2;
// the boulder leaves the front of his fist as the throwing frame thrusts it forward, in his own
// units (body-point.js), as big as the boulder he lifts over his head
const RELEASE = { ahead: 32, up: 42 };
const BOULDER_SIZE = 1.1;
const LANDING_HALF = 14;
const DROP_FROM = -24;
const BOULDER_DAMAGE = 14;
const SHARD_SPEED = 2.4;
const LANDING_HIT = { knockback: [2.6, -3.6], knockdown: true, hitstop: 8, hitstun: 24 };

function addBoulder(game, fields) {
  game.projectiles.push({
    kind: 'boulder',
    time: 0,
    damage: BOULDER_DAMAGE,
    hitTargets: new Set(),
    floor: floorBelow(game.terrain, fields.x, fields.y),
    size: 1,
    ...fields,
  });
}

// the boulder leaves his fist and comes down where the hero stands now
export function lobBoulder(game, fighter) {
  const { x, y } = bodyPoint(fighter, RELEASE);
  const drop = floorUnder(game.terrain, game.player) - y;
  const flight = (-LOB_LIFT + Math.sqrt(LOB_LIFT * LOB_LIFT + 2 * GRAVITY * drop)) / GRAVITY;
  const speed = clamp(Math.abs(game.player.x - x) / flight, 0.6, 3.6);
  const direction = fighter.facing;
  const size = bodySize(fighter, BOULDER_SIZE);
  addBoulder(game, {
    x,
    y,
    vy: LOB_LIFT,
    direction,
    speed,
    side: fighter.side,
    shards: true,
    size,
  });
  game.io.sfx('swingAxeBig', false, { x: fighter.x, dir: direction });
}

// a boulder of the landslide drops out of the sky onto its spot, its shadow marking it first
export function dropBoulder(game, { x, side }) {
  addBoulder(game, { x, y: DROP_FROM, vy: 1, direction: 1, speed: 0, side, shards: false });
}

function scatterShards(game, rock) {
  for (const direction of [-1, 1]) {
    game.projectiles.push({
      kind: 'shard',
      x: rock.x + direction * 6,
      y: rock.floor,
      direction,
      speed: SHARD_SPEED,
      side: rock.side,
      time: 0,
      damage: 6,
      hitTargets: new Set(),
    });
  }
}

function shatter(game, rock) {
  rock.dead = true;
  addBurst(game, { sprite: 'shards', x: rock.x, y: rock.floor, scale: rock.size });
  addDust(game, { x: rock.x, y: rock.floor, count: 8 });
  shake(game, 3, 10);
  game.io.sfx('break', false, { x: rock.x });
  const half = LANDING_HALF * rock.size;
  const area = { x: rock.x - half, y: rock.floor - 12, width: half * 2, height: 12 };
  hitArea(game, { shot: rock, area, hit: LANDING_HIT });
  if (rock.shards) {
    scatterShards(game, rock);
  }
}

// it flies under its own weight and breaks where it meets the ground or the hero
export function flyBoulder(game, rock) {
  rock.y += rock.vy;
  rock.vy += GRAVITY;
  rock.floor = floorBelow(game.terrain, rock.x, Math.min(rock.y, rock.floor));
  if (rock.y >= rock.floor || rock.hitTargets.size > 0) {
    shatter(game, rock);
  }
}
