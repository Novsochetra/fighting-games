import { KEEPER, KICK } from '../data/tuning.js';
import { distributeIntent } from './brains/distribution.js';
import { duoThrowOf } from './brains/duo-throw.js';
import { standStill } from './brains/steering.js';
import { passTargetOf } from './pass-target.js';
import { stickOf } from './stick.js';
import { lengthOf, normalized } from './vector.js';

const hasStick = (stick) => lengthOf(stick.x, stick.y) > 0;

// the player's keeper looks up for a duo this long after he has the ball in his hands
const DUO_LOOK = 30;

const isAimingKeeper = (match, player) =>
  Boolean(player) &&
  player.role === 'keeper' &&
  player.team === match.humanTeam &&
  match.ball.owner === player.index;

// the mate the human side's keeper would throw or kick it to now, for the view to mark: the one
// the stick points at, by the rules of any pass, or null while the stick points nowhere
export function updateAim(match) {
  const keeper = match.players[match.controlled];
  const stick = stickOf(match.input);

  if (!isAimingKeeper(match, keeper) || !hasStick(stick)) {
    match.aimTarget = null;

    return;
  }

  const lofted = keeper.charge >= KICK.loftFrom;
  const power = keeper.charge / KICK.chargeTicks;

  match.aimTarget = passTargetOf(match, keeper, stick, { lofted, power })?.index ?? null;
}

// the player's keeper with the ball stays where he holds it and faces where the stick aims; a tap
// of pass throws it along the grass, a held pass kicks it long; left standing he plays it out
// himself, as the computer's keeper does. A duo's throw is his own to see
export function keeperInHands(match, keeper, { stick, action }) {
  if (keeper.holding > KEEPER.humanHold) {
    return distributeIntent(match, keeper);
  }

  const duo = duoThrowOf(match, keeper, DUO_LOOK);

  if (duo) {
    return { ...standStill(), action: duo };
  }

  if (hasStick(stick)) {
    keeper.facing = normalized(stick.x, stick.y);
  }

  return { ...standStill(), action };
}
