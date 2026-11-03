import { PASS_COMBO } from '../data/combos.js';
import { SAVE_CAM } from '../data/save-cam.js';
import { pushEvent } from './events.js';
import { scoreGoal } from './goal.js';
import { enter } from './phase-state.js';
import { attackSign, midY } from './pitch.js';
import { saveStyleOf } from './skills/save.js';
import { clamp } from './vector.js';

// a wide shot's side runs past the post; the cam reads up to this far out
const MOST_SIDE = 1.3;

const isWatched = (match) => match.duelMemory?.watched === true;

// never in a match nobody watches, never too soon after the last, never too many a half
function canPlay(match) {
  const { saveCams } = match;

  return (
    isWatched(match) &&
    match.tick - saveCams.last >= SAVE_CAM.gapTicks &&
    saveCams.halves[match.half - 1] < SAVE_CAM.mostPerHalf
  );
}

// the ball on its way is a shot a skill acts in: struck with one, or lifted by a long pass combo
export function isSkillShot(match) {
  const shot = match.lastShot;

  return (
    Boolean(shot) &&
    match.ball.kick === 'shot' &&
    match.ball.lastTouch === shot.shooter &&
    (shot.move !== null || shot.level >= SAVE_CAM.fromLevel)
  );
}

// where it came at the goal, as the cam reads it: across from the shooter's right as he faces the
// goal (-1 to 1 post to post), and up from the grass (0 to 1 under the bar)
function aimOf(match, shooter) {
  const across = (match.ball.y - midY(match)) / (match.goal.width / 2);

  return {
    side: clamp(across * attackSign(shooter.team), -MOST_SIDE, MOST_SIDE),
    height: clamp(match.ball.z / match.goal.height, 0, 1),
  };
}

function momentOf(match, { keeper, guard = null, result }) {
  const shot = match.lastShot;
  const shooter = match.players[shot.shooter];

  return {
    shooter: shooter.index,
    keeper: keeper?.index ?? null,
    move: shot.move,
    guard,
    from: null,
    aim: aimOf(match, shooter),
    dive: keeper?.dive ? keeper.dive.side * attackSign(shooter.team) : 0,
    style: saveStyleOf(guard),
    result,
    bonus: PASS_COMBO.shotPower[shot.level] ?? 0,
  };
}

function start(match, moment, goalTeam) {
  Object.assign(match, { saveCam: moment, saveCamGoal: goalTeam });
  match.saveCams.last = match.tick;
  match.saveCams.halves[match.half - 1] += 1;
  enter(match, 'saveCam');
  pushEvent(match, { type: 'saveCam', moment });
}

// a keeper's save in open play plays the cam when a skill was in it (his or the shot's) or he
// made it at the very end of his reach; `skillShot` is read before he touched it
export function saveCamAfterSave(match, { keeper, result, guard = null, stretch, skillShot }) {
  const great = !guard && stretch >= SAVE_CAM.stretchShare;

  if (!match.lastShot || !canPlay(match) || !(guard || great || skillShot)) {
    return false;
  }

  start(match, momentOf(match, { keeper, guard, result }), null);

  return true;
}

// a skill's shot going in plays the cam as it crosses the line, and the goal after it
export function saveCamBeforeGoal(match, team) {
  if (!isSkillShot(match) || !canPlay(match)) {
    return false;
  }

  start(match, momentOf(match, { keeper: match.sides[1 - team][0], result: 'goal' }), team);

  return true;
}

// the show calls this when it is over or skipped; play goes on, or to the goal phase after a goal
export function endSaveCam(match) {
  if (match.phase !== 'saveCam') {
    return false;
  }

  const team = match.saveCamGoal ?? null;

  Object.assign(match, { saveCam: null, saveCamGoal: null });

  if (team === null) {
    enter(match, 'play');
  } else {
    scoreGoal(match, team);
  }

  return true;
}

// a watched match whose show never ends it plays on after a while
export function saveCamTick(match) {
  if (match.phaseTicks >= SAVE_CAM.timeout) {
    endSaveCam(match);
  }
}
