import { KEEPER, KICK, PLAYER, STAMINA, TACKLE } from '../data/tuning.js';
import { clamp, lerp } from './vector.js';

export const DEFAULT_STAT = 50;

export const shareOf = (value) => clamp((value - 1) / 98, 0, 1);

export const byStat = ([low, high], value) => lerp(low, high, shareOf(value));

export const runSpeedOf = (player) => byStat(PLAYER.run, player.stats.speed);

// a tired player's sprint fades toward their run
export function sprintSpeedOf(player) {
  const fresh = Math.min(1, player.energy / STAMINA.tiredBelow);

  return runSpeedOf(player) * (1 + (PLAYER.sprintGain - 1) * fresh);
}

export const dribblePaceOf = (player) => byStat(PLAYER.dribblePace, player.stats.dribble);

export const sprintTicksOf = (player) => byStat(STAMINA.sprintTicks, player.stats.stamina);

export const shotSpeedOf = (player, power) =>
  lerp(KICK.shotMin, byStat(KICK.shotMax, player.stats.shot), power);

export const shotSpreadOf = (player) => byStat(KICK.shotSpread, player.stats.shot);

export const passSpreadOf = (player) => byStat(KICK.passSpread, player.stats.pass);

export const passWeightOf = (player) => byStat(KICK.passWeight, player.stats.pass);

// the speed a player brings a ball down at without a heavy touch
export const touchSpeedOf = (player) => byStat(KICK.touchSpeed, player.stats.dribble);

// a keeper's reach is drawn to the goal they keep: a small goal is guarded by a small keeper
const goalScaleOf = (goal) => goal.width / KEEPER.goalWidth;

export const keeperReachOf = (keeper, goal) =>
  byStat(KEEPER.reach, keeper.stats.keeping) * goalScaleOf(goal);

export const diveReachOf = (keeper, goal) =>
  byStat(KEEPER.diveReach, keeper.stats.keeping) * goalScaleOf(goal);

export const keeperSkillOf = (keeper) => byStat(KEEPER.skill, keeper.stats.keeping);

// tackle against dribble: even stats win the ball about half the time
export function tackleOddsOf(tackler, carrier) {
  const edge = shareOf(tackler.stats.tackle) - shareOf(carrier.stats.dribble);
  const [least, most] = TACKLE.oddsRange;

  return clamp(TACKLE.odds + edge * TACKLE.oddsGain, least, most);
}
