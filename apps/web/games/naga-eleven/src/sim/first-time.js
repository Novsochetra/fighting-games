import { AI, PLAYER } from '../data/tuning.js';
import { aimAwayFromKeeper } from './aim.js';
import { duoStrikeOf } from './combos/duos.js';
import { noteTouch } from './combos/pass-combo.js';
import { aimHeightOf, kickTo, strikeAtGoal } from './kicks.js';
import { attackSign, goalOf, insidePitch, midY, ownGoalLineOf, progressOf } from './pitch.js';
import { chance } from './random.js';
import { receive } from './touch.js';
import { headerPassOf } from './header-pass.js';
import { clamp, distance } from './vector.js';

const CLEAR_DISTANCE = 240;
const HEADER_SPEED = 5.3;
const BEHIND = { reach: 0.1, share: 0.35 };

const firstTimeRangeOf = (match) => match.pitch.length * 0.16;

function inStrikingPlace(match, player) {
  const goal = goalOf(match, player.team);
  const gap = distance(player, goal);

  return (
    gap < firstTimeRangeOf(match) && Math.abs(goal.x - player.x) > Math.abs(goal.y - player.y) * 0.8
  );
}

// a skill cross dropped on his head, or a duo's ball played to him: the computer's man always
// meets it first time
const isMeantForStrike = (match, player) =>
  (match.ball.skillPass?.cross && match.ball.skillPass.receiver === player.index) ||
  duoStrikeOf(match, player) !== null;

// the one the player steers strikes it first time when they pressed shoot for it; the computer's
// players do when they stand to score
export function wantsFirstTime(match, player) {
  if (player.index === match.controlled) {
    return player.strike > 0;
  }

  if (isMeantForStrike(match, player)) {
    return true;
  }

  return inStrikingPlace(match, player) && chance(match.random, AI.firstTimeChance);
}

// a header flies slower than a kick, but one met off a skill cross dropped on his head is meant
const HEADER_PACE = { plain: 0.62, cross: 0.85 };

const headerPaceOf = (match, player) =>
  match.ball.skillPass?.cross && match.ball.skillPass.receiver === player.index
    ? HEADER_PACE.cross
    : HEADER_PACE.plain;

// a duo's ball, or a chain's, struck first time opens the keeper duel
function strikesSpecial(match, player) {
  return Boolean(match.hooks?.special?.(match, player, { firstTime: true }));
}

// at the feet a first-time shot, at the waist a volley, higher a header, which flies slower; the
// pass he struck counts for his side's combo first
export function strikeFirstTime(match, player) {
  const { z } = match.ball;
  const aimY = player.strikeAim ?? aimAwayFromKeeper(match, player);

  noteTouch(match, player);

  if (strikesSpecial(match, player)) {
    player.strike = 0;

    return;
  }

  if (z >= PLAYER.chestHeight) {
    strikeAtGoal(match, player, { power: 0.7, aimY, aimZ: 6, pace: headerPaceOf(match, player) });
  } else if (z >= PLAYER.reachHeight) {
    strikeAtGoal(match, player, { power: 0.9, aimY, aimZ: 16 });
  } else {
    strikeAtGoal(match, player, { power: 0.85, aimY, aimZ: aimHeightOf(match, 0.85) });
  }

  player.strike = 0;
}

// a header flies flatter and slower than a kick, coming down where it is aimed
function headTo(match, player, { spot, kind = 'header' }) {
  const flight = clamp(distance(match.ball, spot) / HEADER_SPEED, 8, 40);

  kickTo(match, player, { spot, lofted: true, kind, flight });
}

// a defender heads it away, out toward the touchline on their side, well up the pitch; right on
// their own line they often get only enough on it to send it behind, for a corner
function clearance(match, player) {
  const side = player.y < midY(match) ? -1 : 1;
  const sign = attackSign(player.team);
  const onLine = progressOf(match, player.team, player.x) < BEHIND.reach;

  if (onLine && chance(match.random, BEHIND.share)) {
    const behind = { x: ownGoalLineOf(match, player.team) - sign * 30, y: player.y + side * 220 };

    headTo(match, player, { spot: behind, kind: 'clear' });

    return;
  }

  const spot = { x: player.x + sign * CLEAR_DISTANCE, y: player.y + side * 120 };

  headTo(match, player, { spot: insidePitch(match, spot, 20), kind: 'clear' });
}

// a ball the other side sent into the team's own half is cleared; one of their own is headed on
function isDefending(match, player) {
  const { lastTouch } = match.ball;
  const theirs = lastTouch === null || match.players[lastTouch].team !== player.team;

  return theirs && progressOf(match, player.team, player.x) < 0.5;
}

function headOn(match, player) {
  const steered = player.index === match.controlled;
  const spot = isDefending(match, player) && !steered ? null : headerPassOf(match, player);

  if (spot) {
    headTo(match, player, { spot });
  } else if (isDefending(match, player)) {
    clearance(match, player);
  } else {
    receive(match, player);
  }
}

// a ball between the waist and the head comes down off the chest, unless the player strikes it
// first time; higher they head it on, but the mate a pass was played to brings it down: it was
// his, and a header on gave the ball away more often than it found anyone
export function airMeets(match, player) {
  if (wantsFirstTime(match, player)) {
    strikeFirstTime(match, player);
  } else if (match.ball.z < PLAYER.chestHeight || player.receiving > 0) {
    receive(match, player);
  } else {
    headOn(match, player);
  }
}
