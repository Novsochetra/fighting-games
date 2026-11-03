import { AI } from '../data/tuning.js';
import { canRun, chaserOf } from './chasers.js';
import { homeSpot } from './formation.js';
import { goesForBall, huntOf } from './hunts.js';
import { marksOf } from './marking.js';
import { ownGoalOf, progressOf, xAtProgress } from './pitch.js';
import { nearestTo, outfieldOf, ownerOf } from './squad.js';
import { holdsSafely } from './tackle.js';
import { directionTo, distance } from './vector.js';

const COVER_GAP = 70;

// a team attacks while it has the ball, while its pass is on the way, and with a loose ball it
// touched last
function attackingOf(match, team, owner) {
  if (owner) {
    return owner.team === team;
  }

  const receiver = match.players.find((player) => player.receiving > 0);
  const touch = receiver ? receiver.index : match.ball.lastTouch;

  return touch !== null && match.players[touch].team === team;
}

// the nearest closes the carrier down and the next cuts out his pass, unless a rival who hunts
// him is near enough to go himself
function pressersOf(match, team, { carrier, hunt }) {
  if (holdsSafely(match, carrier)) {
    return [];
  }

  const hunter = hunt?.quarry === carrier.index ? match.players[hunt.hunter] : null;
  const near = outfieldOf(match, team)
    .filter((player) => canRun(player) && player !== hunter)
    .sort((first, second) => distance(first, match.ball) - distance(second, match.ball));
  const [first, next] = hunter ? [hunter, near[0]] : near;
  const second = next && distance(next, match.ball) < AI.secondPresser ? next : null;

  return [first, second].filter(Boolean).map((player) => player.index);
}

// the defender nearest the space behind the first presser covers it
function coverOf(match, team, presserIndex) {
  const presser = match.players[presserIndex];

  if (!presser) {
    return null;
  }

  const toGoal = directionTo(presser, ownGoalOf(match, team));
  const behind = { x: presser.x + toGoal.x * COVER_GAP, y: presser.y + toGoal.y * COVER_GAP };
  const defenders = outfieldOf(match, team).filter(
    (player) => player.role === 'defender' && player.index !== presserIndex,
  );

  return nearestTo(defenders, behind)?.index ?? null;
}

// the x of the team's back line, from where its defenders' places stand now
function lineOf(match, team) {
  const defenders = outfieldOf(match, team).filter((player) => player.role === 'defender');
  const deepest = Math.min(
    ...defenders.map((player) => progressOf(match, team, homeSpot(match, player).x)),
  );

  return xAtProgress(match, team, deepest);
}

// how far up the pitch the other side's last outfield player stands, for runs beyond them
function lastLineOf(match, team) {
  const theirs = outfieldOf(match, 1 - team).map((player) => progressOf(match, team, player.x));

  return xAtProgress(match, team, Math.max(...theirs));
}

function planOf(match, team) {
  const owner = ownerOf(match);
  const attacking = attackingOf(match, team, owner);
  const hunt = huntOf(match, team);
  const plan = { attacking, chaser: null, pressers: [], cover: null, marks: {}, hunt };

  match.plans[team] = plan;
  plan.line = lineOf(match, team);
  plan.lastLine = lastLineOf(match, team);

  if (!owner) {
    plan.chaser = goesForBall(match, hunt) ? hunt.hunter : chaserOf(match, team);
  } else if (!attacking) {
    plan.pressers = pressersOf(match, team, { carrier: owner, hunt });
    plan.cover = coverOf(match, team, plan.pressers[0]);
  }

  if (!attacking) {
    plan.marks = marksOf(match, team, [plan.chaser, ...plan.pressers, plan.cover, hunt?.hunter]);
  }

  return plan;
}

export function planTeams(match) {
  match.plans = match.plans ?? [null, null];
  planOf(match, 0);
  planOf(match, 1);
}
