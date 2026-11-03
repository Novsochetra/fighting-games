import { moveOf } from '../../data/moves.js';
import { SKILL_PLAY } from '../../data/skills.js';
import { pushEvent } from '../events.js';
import { passBall, passTargetOf } from '../passing.js';
import { fireSkill, rest } from './fire.js';

// a cross drops on the head of the man it is struck to; a keeper's throw comes in at his waist
const HEIGHTS = { cross: 36, throw: 24, pass: 0 };

function wayOf(passer, skill) {
  if (skill?.play === 'cross') {
    return 'cross';
  }

  return passer.role === 'keeper' ? 'throw' : 'pass';
}

// the partner of a duo pays his share and plays it, his own skill if it is a pass or a cross; the
// striker strikes it first time for the duo, and pays then
function payDuo(match, passer, { duo, mate, skill }) {
  passer.spirit = Math.max(0, passer.spirit - duo.shares.partner);
  rest(passer);

  if (skill) {
    pushEvent(match, { type: 'skill', player: passer.index, move: skill.id });
  }

  match.duoPass = { move: duo.move, striker: mate.index, partner: passer.index, tick: match.tick };
}

function mateOf(match, passer, { target, aim, skill }) {
  if (Number.isInteger(target)) {
    return match.players[target];
  }

  return passTargetOf(match, passer, aim ?? passer.facing, { lofted: skill?.play === 'cross' });
}

// a skill pass: to the mate the stick points at (or the brain picked), cut out only near him, soft
// to his feet, and two steps of the combo; with no mate to find it is the pass it would have been
export function playSkillPass(match, passer, action) {
  const skill = moveOf(action.move);
  const mate =
    match.ball.owner === passer.index ? mateOf(match, passer, { ...action, skill }) : null;

  if (!mate) {
    passBall(match, passer, { aim: action.aim ?? passer.facing, lofted: true, power: 1 });

    return;
  }

  if (action.duo) {
    payDuo(match, passer, { duo: action.duo, mate, skill });
  } else {
    fireSkill(match, passer, skill, { receiver: mate.index });
  }

  const way = wayOf(passer, skill);
  const steps = SKILL_PLAY[skill?.play]?.steps ?? SKILL_PLAY.pass.steps;

  passBall(match, passer, {
    target: mate.index,
    lofted: way !== 'pass',
    height: HEIGHTS[way],
    steps,
    skill: true,
  });
  match.ball.skillPass = { receiver: mate.index, cross: way !== 'pass', move: skill?.id ?? null };
}
