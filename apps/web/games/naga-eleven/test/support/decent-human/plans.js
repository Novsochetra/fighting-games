import { KICK } from '../../../src/data/tuning.js';
import { bestPassOf } from '../../../src/sim/brains/pass-options.js';
import { dribbleWayOf, roomAheadOf } from '../../../src/sim/brains/dribbling.js';
import { interceptOf } from '../../../src/sim/brains/steering.js';
import { goalOf, ownGoalOf } from '../../../src/sim/pitch.js';
import { chance } from '../../../src/sim/random.js';
import { nearestTo } from '../../../src/sim/squad.js';
import { directionTo, distance, dot, segmentGap } from '../../../src/sim/vector.js';
import {
  FULL,
  hasShotOffer,
  holdsFinisher,
  isChaining,
  keepsComboGoing,
  runsTwice,
  skillPassPlan,
  strikesAsItComes,
} from './skill-plans.js';

const PRESSED = 34;
const STAR_PRESSED = 24;
const SLIDE_REACH = 20;
const FULL_MINUTES = { 7: 40, 11: 90 };

// in goal widths from the goal's middle
export const SKILL = { shootRange: 2.4, specialRange: 3.4, slideChance: 0.25 };

export function press(human, button, holdFor, aim) {
  Object.assign(human, { button, holdFor, held: 0, aim, sprint: false });
}

// losing in the last quarter a player throws everything forward and lets the special go early
export function isLosingLate(match, team) {
  const late = match.minute >= FULL_MINUTES[match.format] * 0.72;

  return late && match.score[team] < match.score[1 - team];
}

// a full charge lets a special, a combo, a chain or a shot skill go, so a plain shot is let go a
// few ticks short of it; straight after a skill that starts a chain, and with a finisher in
// hand, he strikes from a little further
// how far and how wide he lets a full charge go from: further losing late or with a finisher, a
// little wider straight after a chain's first skill too
function specialReachOf(match, player) {
  const urgent = isLosingLate(match, player.team);
  const finisher = holdsFinisher(match, player);
  const wide = urgent || finisher || isChaining(match, player);

  return {
    gap: urgent || finisher ? match.pitch.length * 0.42 : match.goal.width * SKILL.specialRange,
    view: wide ? 0.3 : 0.4,
  };
}

function shotHold(match, player) {
  const goal = goalOf(match, player.team);
  const gap = distance(player, goal);
  const view = Math.abs(goal.x - player.x) / Math.max(gap, 1);
  const reach = specialReachOf(match, player);

  if (hasShotOffer(match, player) && gap < reach.gap && view > reach.view) {
    return FULL;
  }

  if (gap < match.goal.width * SKILL.shootRange && view > 0.45) {
    return Math.min(KICK.chargeTicks - 4, Math.round(KICK.chargeTicks * (0.55 + gap / 1500)));
  }

  return 0;
}

const sochetraOf = (match, player) =>
  match.sides[player.team].find((mate) => mate.star === 'sochetra' && mate !== player) ?? null;

function isOpen(match, player, star) {
  const foes = match.sides[1 - player.team];

  return {
    free: Math.min(...foes.map((foe) => distance(foe, star))) > 40,
    lane: foes.every((foe) => segmentGap(player, star, foe).gap > 22),
  };
}

function inReach(match, player, star) {
  const gap = distance(player, star);
  const ahead = (star.x - player.x) * (player.team === 0 ? 1 : -1);
  const most = isLosingLate(match, player.team) ? 480 : 340;

  return gap >= 60 && gap <= most && ahead >= 0;
}

// a player who knows the story looks for the star: Sochetra, free, ahead and in reach
function starPass(match, player) {
  const star = sochetraOf(match, player);

  if (!star || star.stun > 0 || !inReach(match, player, star)) {
    return null;
  }

  const { free, lane } = isOpen(match, player, star);

  if (!free || (!lane && !isLosingLate(match, player.team))) {
    return null;
  }

  return { aim: directionTo(player, star), holdFor: lane && distance(player, star) < 340 ? 1 : 14 };
}

function isPressed(match, player) {
  const threat = nearestTo(match.sides[1 - player.team], player);
  const close = player.star === 'sochetra' ? STAR_PRESSED : PRESSED;

  return distance(threat, player) < close && dot(directionTo(player, threat), player.facing) > -0.2;
}

function plainPass(match, player, pressed) {
  const option = bestPassOf(match, player);

  if (!option || (!pressed && option.value < 0.9 + roomAheadOf(match, player))) {
    return null;
  }

  return { aim: directionTo(player, option.spot), holdFor: option.lofted ? 16 : 1 };
}

// what moves him to pass: pressed, now and then in space, chasing the game late, or keeping a
// combo going
function passUrges(human, match, player) {
  return {
    pressed: isPressed(match, player),
    calmLook: player.holding > 24 && chance(human.random, 0.04),
    urgent: isLosingLate(match, player.team) && player.holding > 6,
    combo: keepsComboGoing(match, player),
  };
}

// Sochetra first, else the best pass; with his skill ready, the skill pass that plays him in
function passPlan(human, match, player) {
  const skill = player.holding > 6 ? skillPassPlan(match, player) : null;

  if (skill) {
    return skill;
  }

  const { pressed, calmLook, urgent, combo } = passUrges(human, match, player);

  if (!pressed && !calmLook && !urgent && !combo) {
    return null;
  }

  return starPass(match, player) ?? latePass(match, player, { pressed, calmLook, urgent });
}

// chasing the game late and in space he waits for the star; else the best pass there is
const latePass = (match, player, { pressed, calmLook, urgent }) =>
  urgent && !pressed && !calmLook ? null : plainPass(match, player, pressed);

export function withBall(human, match, player) {
  const shot = shotHold(match, player);

  if (runsTwice(match, player)) {
    human.runTaps = 2;
  }

  if (shot > 0) {
    press(human, 'shoot', shot, directionTo(player, goalOf(match, player.team)));

    return;
  }

  const pass = passPlan(human, match, player);

  if (pass) {
    press(human, 'pass', pass.holdFor, pass.aim);

    return;
  }

  human.aim = dribbleWayOf(match, player);
  human.sprint = roomAheadOf(match, player) > 0.5 && player.energy > 0.35;
}

// goal side of the carrier, and a slide when close and facing the ball
function defending(human, match, player) {
  const carrier = match.players[match.ball.owner];
  const toGoal = directionTo(carrier, ownGoalOf(match, player.team));
  const spot = { x: carrier.x + toGoal.x * 10, y: carrier.y + toGoal.y * 10 };
  const gap = distance(player, match.ball);
  const facing = dot(player.facing, directionTo(player, match.ball)) > 0.5;
  const canSlide = gap < SLIDE_REACH && facing && player.recover === 0;

  human.aim = directionTo(player, gap < 24 ? match.ball : spot);
  human.sprint = gap > 40 && player.energy > 0.2;

  if (canSlide && chance(human.random, SKILL.slideChance)) {
    human.tap = 'shoot';
  }
}

// to where the loose ball can be reached first, striking it first time near goal now and then
function chasing(human, match, player) {
  const spot = interceptOf(match, player);
  const goalGap = distance(player, goalOf(match, player.team));
  const coming = player.receiving > 0 || distance(player, match.ball) < 120;
  const striking = coming && goalGap < match.pitch.length * 0.15 && player.strike === 0;

  human.aim = directionTo(player, spot);
  human.sprint = distance(player, spot) > 30 && player.energy > 0.2;

  if (strikesAsItComes(match, player) && player.strike === 0) {
    human.tap = 'shoot';
  } else if (striking && chance(human.random, 0.1)) {
    human.tap = 'shoot';
  }
}

export function withoutBall(human, match, player) {
  const owner = match.ball.owner === null ? null : match.players[match.ball.owner];

  if (owner && owner.team !== player.team) {
    defending(human, match, player);
  } else if (!owner) {
    chasing(human, match, player);
  } else {
    human.aim = null;
    human.sprint = false;
  }
}

// a restart of theirs: a moment to look, then the best pass, or a long ball up the pitch
export function taking(human, match, player) {
  if (player.holding < 30) {
    human.aim = null;

    return;
  }

  const option = bestPassOf(match, player);
  const aim = directionTo(player, option ? option.spot : goalOf(match, player.team));

  press(human, option ? 'pass' : 'shoot', option?.lofted || !option ? 16 : 1, aim);
}
