import { KEEPER, KICK, PLAYER } from '../data/tuning.js';
import { speedOf } from './ball.js';
import { pushEvent } from './events.js';
import { airMeets, strikeFirstTime, wantsFirstTime } from './first-time.js';
import { meeterOf } from './meet.js';
import { parry } from './parry.js';
import { chance } from './random.js';
import { isSkillShot, saveCamAfterSave } from './save-cam.js';
import { skillSave } from './skills/save.js';
import { gainSpirit } from './spirit.js';
import { keeperSkillOf } from './stats.js';
import { receive, take } from './touch.js';
import { clamp } from './vector.js';

const BEATEN_TICKS = 12;

// at the body a keeper gets a hand to nearly anything, at full stretch to few, a good keeper
// to more of both
export const touchChanceOf = (stretch, skill = 0) =>
  clamp(1 - stretch * stretch * KEEPER.missAtStretch + skill, 0.05, 0.98);

// of what they reach, a hard shot is harder to hold, one at the end of the reach harder still
export const holdChanceOf = (speed, stretch, skill = 0) =>
  clamp(1.45 - speed * 0.06 + skill, 0.2, 0.97) * (1 - stretch * KEEPER.stretchCost);

// a shot the keeper holds or pushes away fills his gauge, and may stop play for the save cam
function afterSave(match, keeper, { held, guard = null, stretch, skillShot }) {
  pushEvent(match, { type: 'save', keeper: keeper.index, parried: !held });
  gainSpirit(match, keeper, held ? 'save' : 'parry');
  saveCamAfterSave(match, {
    keeper,
    result: held ? 'saved' : 'parried',
    guard,
    stretch,
    skillShot,
  });
}

// a shot past his own reach meets his save skill, if he has one to spend
function keeperMeets(match, { player, stretch, skilled }) {
  const speed = speedOf(match.ball);
  const wasShot = match.ball.kick === 'shot';
  const skillShot = isSkillShot(match);
  const skill = keeperSkillOf(player);

  if (speed < KEEPER.easySpeed) {
    take(match, player);

    return;
  }

  if (skilled) {
    afterSave(match, player, { ...skillSave(match, player), stretch, skillShot });

    return;
  }

  if (!chance(match.random, touchChanceOf(stretch, skill))) {
    player.noPickup = BEATEN_TICKS;

    return;
  }

  const held = chance(match.random, holdChanceOf(speed, stretch, skill));

  if (held) {
    take(match, player);
  } else {
    parry(match, player);
  }

  if (wasShot) {
    afterSave(match, player, { held, stretch, skillShot });
  }
}

// a defender in the way of a shot blocks it near his body, and only now and then at the end of his
// reach: one that flies past his boot goes on toward the goal
function slipsPast(match, { player, stretch }) {
  const { ball } = match;
  const against = ball.kick === 'shot' && match.players[ball.lastTouch]?.team !== player.team;

  if (!against || chance(match.random, 1 - stretch * stretch * KICK.blockMiss)) {
    return false;
  }

  player.noPickup = BEATEN_TICKS;

  return true;
}

export function meetBall(match) {
  const { ball } = match;

  if (ball.owner !== null || ball.inGoal !== null) {
    return;
  }

  const meeting = meeterOf(match);

  if (!meeting) {
    return;
  }

  if (meeting.keeper) {
    keeperMeets(match, meeting);
  } else if (slipsPast(match, meeting)) {
    return;
  } else if (ball.z >= PLAYER.reachHeight) {
    airMeets(match, meeting.player);
  } else if (wantsFirstTime(match, meeting.player)) {
    strikeFirstTime(match, meeting.player);
  } else {
    receive(match, meeting.player);
  }
}
