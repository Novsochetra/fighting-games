import { AI } from '../../data/tuning.js';
import { carrierIntent } from './carrier.js';
import { defendIntent } from './defending.js';
import { challengeIntent, isChallenging, isShadowing, shadowIntent } from './hunting.js';
import { interceptOf, runTo } from './steering.js';
import { supportIntent } from './support.js';
import { distance } from '../vector.js';

function chaseIntent(match, player) {
  const spot = interceptOf(match, player);

  return runTo(player, spot, distance(player, spot) > AI.sprintFrom / 2);
}

export function outfieldIntent(match, player) {
  if (match.ball.owner === player.index) {
    return carrierIntent(match, player);
  }

  const plan = match.plans[player.team];

  if (plan.chaser === player.index) {
    return chaseIntent(match, player);
  }

  if (isChallenging(match, plan, player)) {
    return challengeIntent(match, player, plan);
  }

  if (isShadowing(plan, player)) {
    return shadowIntent(match, player, plan);
  }

  if (plan.attacking) {
    return supportIntent(match, player, plan);
  }

  // a run in behind is called off the moment the ball is lost
  player.run = 0;

  return defendIntent(match, player, plan);
}
