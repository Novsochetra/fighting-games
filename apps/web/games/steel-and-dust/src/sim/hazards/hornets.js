import { SWARM } from '../../data/nests.js';
import { circlePoint, flyHornet, flyOff, hatchHornets, swarmCenter } from './hornet-flight.js';
import { canBeChased, stingTarget } from './hornet-stings.js';

// the hornets aim at the middle of a body, a little below its head
const BODY_MIDDLE = 18;
// with nobody near enough to chase they hover over their broken nest
const HOVER = 20;

export function releaseSwarm(game, nest) {
  nest.swarm = { hornets: hatchHornets(nest), time: 0, target: null, retarget: 0, cooldown: 0 };
  game.io.sfx('buzz', false, { x: nest.x });
}

const middleOf = (fighter) => ({ x: fighter.x, y: fighter.y - BODY_MIDDLE * fighter.scale });

const inRange = (nest, fighter) =>
  canBeChased(fighter) && Math.abs(fighter.x - nest.x) <= SWARM.range;

// whoever is closest to the point, the hero or a raider
export function closestFighter(fighters, point) {
  let closest = null;
  let best = Infinity;

  for (const fighter of fighters) {
    const middle = middleOf(fighter);
    const distance = Math.hypot(middle.x - point.x, middle.y - point.y);

    if (distance < best) {
      closest = fighter;
      best = distance;
    }
  }

  return closest;
}

// it looks again every so often, and at once when the body it chased is down for good or gone
// out of its range
function chooseTarget(game, swarm, nest) {
  const lost = swarm.target && !inRange(nest, swarm.target);

  if (--swarm.retarget <= 0 || lost) {
    const near = game.fighters.filter((fighter) => inRange(nest, fighter));

    swarm.target = closestFighter(near, swarmCenter(swarm.hornets));
    swarm.retarget = SWARM.retarget;
  }
}

function chase(game, swarm, nest) {
  chooseTarget(game, swarm, nest);

  const { target, time } = swarm;
  const point = target ? middleOf(target) : { x: nest.x, y: nest.y - HOVER };

  swarm.cooldown = Math.max(0, swarm.cooldown - 1);
  for (const hornet of swarm.hornets) {
    flyHornet(hornet, circlePoint(hornet, point, time));
    stingTarget(game, swarm, hornet);
  }

  if (time % SWARM.buzzEvery === 0) {
    game.io.sfx('buzz', false, { x: swarmCenter(swarm.hornets).x });
  }
}

// the swarm stings for a while, then scatters off the screen and is gone
export function updateSwarm(game, nest) {
  const swarm = nest.swarm;

  if (!swarm || swarm.hornets.length === 0) {
    return;
  }

  swarm.time++;
  if (swarm.time < SWARM.life) {
    chase(game, swarm, nest);
  } else if (swarm.time < SWARM.life + SWARM.scatter) {
    swarm.hornets.forEach(flyOff);
  } else {
    swarm.hornets = [];
    swarm.target = null;
  }
}
