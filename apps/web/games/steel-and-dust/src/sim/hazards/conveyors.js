import { CONVEYOR, pastMouth } from '../../data/conveyors.js';
import { nudge } from '../fighters/terrain-motion.js';
import { feedFurnace, scorchHero } from './furnace-mouth.js';

export function createConveyors(conveyors) {
  return conveyors.map((belt) => ({ ...belt }));
}

const LYING = new Set(['down', 'getup', 'ko']);
const STRIDING = new Set(['walk', 'run', 'dash']);

// feet on the belt's floor; raiders walking in from off screen are not in the fight yet, and the
// ultimate places the hero itself
function onBeltFloor(belt, fighter) {
  return (
    !fighter.airborne &&
    !fighter.entering &&
    !fighter.removed &&
    fighter.state !== 'ult' &&
    Math.abs(fighter.y - belt.y) < 1
  );
}

// a fighter frozen in a hit stays where it is, like everything else about it
export function ridesBelt(belt, fighter) {
  return (
    onBeltFloor(belt, fighter) &&
    fighter.hitstop === 0 &&
    fighter.x >= belt.from &&
    fighter.x <= belt.to
  );
}

// a raider lying in the mouth, carried there or slid or thrown in; a boss is only ever carried
export function fedToFurnace(belt, fighter) {
  const past = pastMouth(belt, fighter.x);

  return (
    fighter.side === 'enemy' &&
    !fighter.def.boss &&
    LYING.has(fighter.state) &&
    onBeltFloor(belt, fighter) &&
    past >= 0 &&
    past <= CONVEYOR.mouth
  );
}

// the hero who strides off the end of the belt himself walks past the mouth
function carriedIn(belt, hero) {
  const striding = STRIDING.has(hero.state) && hero.vx * belt.direction > 0;

  return hero.side === 'player' && pastMouth(belt, hero.x) >= 0 && !striding;
}

// a heavy walks no faster than the belt runs, so a raider walking up it keeps its own pace rather
// than treading in place or being carried back to the mouth; the hero outruns it and is only slowed
function walksUpBelt(belt, fighter) {
  return fighter.side === 'enemy' && fighter.state === 'walk' && fighter.vx * belt.direction < 0;
}

function moveOnBelt(game, belt, fighter) {
  const riding = ridesBelt(belt, fighter);

  if (riding && !walksUpBelt(belt, fighter)) {
    nudge(game.terrain, fighter, belt.direction * CONVEYOR.speed);
  }

  if (fedToFurnace(belt, fighter)) {
    feedFurnace(game, belt, fighter);
  } else if (riding && carriedIn(belt, fighter)) {
    scorchHero(game, belt, fighter);
  }
}

// everything on a belt rides it toward its furnace, walls still stopping it as they stop a push
export function updateConveyors(game) {
  for (const belt of game.conveyors) {
    for (const fighter of game.fighters.slice()) {
      moveOnBelt(game, belt, fighter);
    }
  }
}
