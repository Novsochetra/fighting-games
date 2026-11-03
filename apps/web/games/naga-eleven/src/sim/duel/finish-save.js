import { DUEL_AFTERMATH } from '../../data/duels.js';
import { nextRandom } from '../random.js';
import { gainSpirit } from '../spirit.js';
import { ballAtFeet, looseBall, touched } from './aftermath.js';
import { pushEvent } from './events.js';
import { attackSign } from './geometry.js';

const AFTER = DUEL_AFTERMATH;
// a punch knocks it further than a parry; off a wall it bounces back into play in front of him
const PUNCH_SHARE = 1.6;
const WALL = { ahead: 16, speed: 3 };

// the keeper dives the way the round says, in the world: the shooter's right is +y for the side
// that attacks along +x
export function diveAs(match, keeper, { dive, shooter }) {
  const side = (dive ?? 0) * attackSign(shooter.team);

  keeper.dive = side === 0 ? null : { tick: match.tick, side };

  return side;
}

function saveMade(match, keeper, held) {
  pushEvent(match, { type: 'save', keeper: keeper.index, parried: !held });
  gainSpirit(match, keeper, held ? 'save' : 'parry');
}

function bounceOffWall(match, { attacker, keeper }) {
  const out = -attackSign(attacker.team);
  const across = nextRandom(match.random) - 0.5;

  looseBall(match, {
    x: keeper.x + out * WALL.ahead,
    y: keeper.y + across * 8,
    height: 8,
    vx: out * WALL.speed,
    vy: across * WALL.speed,
    vz: 2,
  });
  touched(match, keeper);
  keeper.noPickup = 20;
}

export function savedBy(match, actors, outcome) {
  const { keeper } = actors;

  if (outcome.style === 'wall') {
    bounceOffWall(match, actors);
  } else {
    keeper.facing = { x: attackSign(keeper.team), y: 0 };
    ballAtFeet(match, keeper);
  }

  saveMade(match, keeper, outcome.style !== 'wall');
}

// off the gloves, out of the mouth and away to the side the keeper dived; a punch further
export function parriedBy(match, actors, outcome) {
  const { attacker, keeper } = actors;
  const dived = diveAs(match, keeper, { dive: outcome.dive, shooter: attacker });
  const side = dived === 0 ? 1 : dived;
  const out = -attackSign(attacker.team);
  const speed = AFTER.parrySpeed * (outcome.style === 'punch' ? PUNCH_SHARE : 1);

  looseBall(match, {
    x: keeper.x + out * 10,
    y: keeper.y + side * 8,
    height: 6,
    vx: out * speed * 0.5,
    vy: side * speed,
    vz: 2,
  });
  touched(match, keeper);
  keeper.noPickup = 24;
  saveMade(match, keeper, false);
}
