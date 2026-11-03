import { CROWD } from '../../data/audio.js';
import { FORMATS } from '../../data/formats.js';

const clampShare = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

// 1 with the ball in front of either goal, 0 from about a third of the pitch out
function nearGoalOf({ ball, pitch }) {
  const fromLine = Math.min(ball.x, pitch.length - ball.x) / pitch.length;

  return clampShare((0.35 - fromLine) / 0.25);
}

// how excited the crowd is, 0 to 1: more late on, in a close game, and with the ball near a goal
export function excitementOf(match) {
  const held = CROWD.phases[match.phase];

  if (held !== undefined) {
    return held;
  }

  const minutes = (FORMATS[match.format]?.halfMinutes ?? 45) * 2;
  const late = clampShare(match.minute / minutes);
  const [home = 0, away = 0] = match.score ?? [];
  const close = Math.abs(home - away) <= 1 ? 1 : 0;
  const near = nearGoalOf(match);

  return clampShare(CROWD.base + CROWD.late * late + CROWD.close * close + CROWD.nearGoal * near);
}

// the bed's level: the crowd's size, from its quietest murmur to all of it on its feet
export const bedLevelOf = (crowdLevel, excitement) =>
  crowdLevel * (CROWD.floor + (1 - CROWD.floor) * clampShare(excitement));
