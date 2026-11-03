import { DUEL_AFTERMATH } from '../../data/duels.js';
import { resetPlay } from '../combos/reset.js';
import { concedeSpirit } from '../spirit.js';
import { floor, looseBall, touched } from './aftermath.js';
import { pushEvent } from './events.js';
import { diveAs, parriedBy, savedBy } from './finish-save.js';
import { attackSign, goalLineOf } from './geometry.js';

const AFTER = DUEL_AFTERMATH;
// inside the posts and under the bar, so the ball sits in the net where it went in
const MOUTH_SHARE = 0.9;
const WIDE_GAP = 18;

function strike(match, { attacker, move }) {
  touched(match, attacker, { kick: 'shot', move });
  attacker.noPickup = AFTER.passerPause;
  attacker.lastKick = match.tick;
  pushEvent(match, { type: 'shot', player: attacker.index, power: 1, move });
}

// across the goal from the shooter's right as he faces it, as the round said
const acrossOf = (match, team, side) =>
  match.pitch.width / 2 + side * (match.goal.width / 2) * attackSign(team);

// the ball lies in the net where the round aimed it, the keeper beaten the way he dived, and the
// goal is the duel's to give: the sim takes it from the goal phase, as after any goal
function goal(match, actors, outcome) {
  const { attacker, keeper, move } = actors;
  const team = attacker.team;
  const sign = attackSign(team);
  const aim = outcome.aim ?? { side: 0, height: 0.3 };

  strike(match, actors);
  resetPlay(match);
  match.restart = null;
  Object.assign(match.ball, {
    owner: null,
    x: goalLineOf(match, team) + sign * match.goal.depth * 0.6,
    y: acrossOf(match, team, aim.side * MOUTH_SHARE),
    z: match.goal.height * aim.height * MOUTH_SHARE,
    vx: sign * 0.5,
    vy: 0,
    vz: 0,
    inGoal: team,
  });

  // beaten: the keeper went the other way, unless the round says how he dived
  if (keeper) {
    diveAs(match, keeper, { dive: outcome.dive ?? -(Math.sign(aim.side) || 1), shooter: attacker });
    floor(keeper, AFTER.keeperDown);
  }

  match.score[team] += 1;
  match.lastScorer = team;
  concedeSpirit(match, 1 - team);
  pushEvent(match, { type: 'goal', team, scorer: attacker.index, move });

  return 'goal';
}

function saved(match, actors, outcome) {
  strike(match, actors);
  savedBy(match, actors, outcome);
}

function parried(match, actors, outcome) {
  strike(match, actors);
  parriedBy(match, actors, outcome);
}

// past the post: the ball runs on over the line, and the sim gives the goal kick
function wide(match, actors, outcome) {
  const { attacker, keeper } = actors;
  const sign = attackSign(attacker.team);
  const side = Math.sign(outcome.aim?.side ?? 1) || 1;
  const y = acrossOf(match, attacker.team, side) + side * attackSign(attacker.team) * WIDE_GAP;

  strike(match, actors);
  looseBall(match, {
    x: goalLineOf(match, attacker.team) - sign * 24,
    y,
    height: 4,
    vx: sign * AFTER.wideSpeed,
    vy: side * attackSign(attacker.team) * 0.6,
    vz: 1,
  });

  if (keeper) {
    diveAs(match, keeper, { dive: outcome.dive, shooter: attacker });
    keeper.noPickup = 30;
  }
}

export const SHOT_APPLIERS = { goal, saved, parried, wide };
