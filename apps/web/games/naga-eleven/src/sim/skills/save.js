import { SAVE_STYLES, SKILL_PLAY } from '../../data/skills.js';
import { speedOf } from '../ball.js';
import { bounceBack, parry, punchOut } from '../parry.js';
import { KEEPER } from '../../data/tuning.js';
import { chance } from '../random.js';
import { diveReachOf, keeperSkillOf } from '../stats.js';
import { take } from '../touch.js';
import { clamp } from '../vector.js';
import { canFire, fireSkill, openMoveOf } from './fire.js';

// the skill takes him half way out of his stretch: he holds what he reaches as from mid-dive
const CATCH_STRETCH = 0.5;

export const saveSkillOf = (keeper) => openMoveOf(keeper, 'save');

export const saveStyleOf = (move) => SAVE_STYLES[move?.id ?? move] ?? 'catch';

const isShotAt = (match, keeper) =>
  match.ball.kick === 'shot' && match.players[match.ball.lastTouch]?.team !== keeper.team;

// with his save skill to spend, a keeper reaches a shot his own dive would miss: only in a dive,
// so a shot he never read in time still beats him
export function skillReachOf(match, keeper, reach) {
  if (!keeper.dive || !isShotAt(match, keeper) || !canFire(match, keeper, saveSkillOf(keeper))) {
    return reach;
  }

  return Math.max(reach, diveReachOf(keeper, match.goal) * SKILL_PLAY.save.reach);
}

function catchIt(match, keeper) {
  const speed = speedOf(match.ball);
  const hold = clamp(1.45 - speed * 0.06 + keeperSkillOf(keeper), 0.2, 0.97);
  const held = chance(match.random, hold * (1 - CATCH_STRETCH * KEEPER.stretchCost));

  if (held) {
    take(match, keeper);
  } else {
    parry(match, keeper);
  }

  return held;
}

// a punch and a wall keep it out without holding it
const pushedOut = (push) => (match, keeper) => {
  push(match, keeper);

  return false;
};

const STYLES = { catch: catchIt, punch: pushedOut(punchOut), wall: pushedOut(bounceBack) };

// the save skill fires: he gets there, diving if he was not, and keeps it out his way; true when
// he holds it
export function skillSave(match, keeper) {
  const move = saveSkillOf(keeper);
  const style = saveStyleOf(move);

  fireSkill(match, keeper, move);

  if (!keeper.dive && style !== 'wall') {
    keeper.dive = { tick: match.tick, side: match.ball.y < keeper.y ? -1 : 1 };
  }

  return { held: STYLES[style](match, keeper), guard: move.id, style };
}
