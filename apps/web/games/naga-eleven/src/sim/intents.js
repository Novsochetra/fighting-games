import { carrierIntent } from './brains/carrier.js';
import { keeperIntent, startDive } from './brains/keeper.js';
import { outfieldIntent } from './brains/outfield.js';
import { switchPlayer } from './control.js';
import { humanIntent } from './human.js';
import { kickTo, shootBall } from './kicks.js';
import { passBall } from './passing.js';
import { startBurst } from './skills/dribble.js';
import { playSkillPass } from './skills/pass.js';
import { skillShot } from './skills/shot.js';
import { challenge, startTackle } from './tackle.js';

// a special the duels do not take up is struck as the shot it was charged as
function special(match, player, action) {
  if (!match.hooks?.special?.(match, player)) {
    shootBall(match, player, action);
  }
}

// a clearance is played to nobody: control goes to whoever is best placed for it
function clear(match, player, { spot }) {
  if (match.ball.owner !== player.index) {
    return;
  }

  kickTo(match, player, { spot, lofted: true, kind: 'clear' });

  if (player.index === match.controlled) {
    switchPlayer(match, player);
  }
}

const ACTIONS = {
  pass: passBall,
  shoot: shootBall,
  special,
  skillShot,
  skillPass: playSkillPass,
  burst: startBurst,
  clear,
  tackle: startTackle,
  challenge,
  dive: startDive,
  switch: switchPlayer,
};

export function intentOf(match, player) {
  if (player.index === match.controlled) {
    return humanIntent(match, player);
  }

  if (player.role === 'keeper') {
    return keeperIntent(match, player);
  }

  return match.ball.owner === player.index
    ? carrierIntent(match, player)
    : outfieldIntent(match, player);
}

export function act(match, player, intent) {
  if (intent.action) {
    ACTIONS[intent.action.kind](match, player, intent.action);
  }
}
