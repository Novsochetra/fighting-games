import {
  HERO,
  duelStars,
  eventsOf,
  inPlay,
  lateMinuteOf,
  leadOf,
  ourTeam,
  starOf,
  whistled,
} from './match-reads.js';
import { PLAY_CONDITIONS, createSeen } from './play-triggers.js';

const opening = (match) =>
  match.phase === 'kickoff' && (match.half ?? 1) === 1 && match.score[0] + match.score[1] === 0;

// `first` asks for a side's opening goal, so a trigger with `by` that missed it never fires
const goalCounts = (trigger, match, goal) =>
  (!trigger.by || starOf(match, goal.scorer) === trigger.by) &&
  (!trigger.first || match.score[goal.team] === 1);

const goalBy = (side) => (trigger, match, events) =>
  eventsOf(events, 'goal').some(
    (goal) =>
      (goal.team === ourTeam(match)) === (side === 'for') && goalCounts(trigger, match, goal),
  );

// a rival's duel scene is written for him and Sochetra face to face, so neither his shot at
// Sochetra's keeper nor his run at a teammate plays it
function meets(trigger, match, duel) {
  const stars = duelStars(duel, match);

  return !trigger.with || (stars.includes(trigger.with) && stars.includes(HERO));
}

const late = (wanted) => (trigger, match) =>
  inPlay(match) &&
  match.minute >= (trigger.minute ?? lateMinuteOf(match)) &&
  Math.sign(leadOf(match)) === wanted;

export const CONDITIONS = {
  kickoff: (_, match, events) => whistled(events, 'kickoff', 1) || opening(match),
  firstDuel: (trigger, match, events) =>
    eventsOf(events, 'duel').some((event) => meets(trigger, match, event.duel)),
  goalFor: goalBy('for'),
  goalAgainst: goalBy('against'),
  halfTime: (_, match, events) => whistled(events, 'halfTime') || match.phase === 'halfTime',
  secondHalf: (_, match, events) =>
    whistled(events, 'kickoff', 2) || (match.half === 2 && inPlay(match)),
  losingLate: late(-1),
  drawLate: late(0),
  specialGoal: (trigger, _, events) =>
    eventsOf(events, 'goal').some(
      (goal) => Boolean(goal.move) && (!trigger.move || goal.move === trigger.move),
    ),
  minute: (trigger, match) => inPlay(match) && match.minute >= trigger.at,
  ...PLAY_CONDITIONS,
};

export const conditionMet = (trigger, match, events, seen = createSeen()) =>
  CONDITIONS[trigger.when]?.(trigger, match, events, seen) ?? false;
