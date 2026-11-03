import { computerChoice } from '../../../src/sim/duel/computer.js';
import {
  chooseDuel,
  currentRound,
  duelOptions,
  finishDuel,
  humanSideOf,
} from '../../../src/sim/duel/index.js';
import { createRandom } from '../../../src/sim/random.js';
import { endSaveCam } from '../../../src/sim/save-cam.js';
import { taking, withBall, withoutBall } from './plans.js';

// the open play save cam runs this long before the show ends it, as the game's does
const SAVE_CAM_TICKS = 90;
// two taps of RUN this far apart play a dribble skill
const TAP_GAP = 4;

const STICK = 0.38;
const BUTTONS = ['pass', 'shoot', 'sprint', 'left', 'right', 'up', 'down'];

const stickHeld = (way) => ({
  right: (way?.x ?? 0) > STICK,
  left: (way?.x ?? 0) < -STICK,
  down: (way?.y ?? 0) > STICK,
  up: (way?.y ?? 0) < -STICK,
});

function writeKeys(human, match) {
  const keys = match.input.sources.keys.held;

  for (const button of BUTTONS) {
    keys[button] = false;
  }

  Object.assign(keys, stickHeld(human.aim), { sprint: human.sprint });

  if (human.button) {
    keys[human.button] = human.held < human.holdFor;
    match.input.pressed[human.button] = human.held === 0;
  }

  if (human.tap) {
    match.input.pressed[human.tap] = true;
    keys[human.tap] = true;
  }
}

function decide(human, match) {
  const player = match.players[match.controlled];
  const hasBall = match.ball.owner === player?.index;

  if (!player) {
    return;
  }

  // the keeper with the ball in his hands is played out as a restart is
  if (match.phase === 'restart' || (hasBall && player.role === 'keeper')) {
    human.aim = null;

    if (hasBall) {
      taking(human, match, player);
    }

    return;
  }

  (hasBall ? withBall : withoutBall)(human, match, player);
}

// a button held for a kick is let go once its charge is in, or when the ball is lost
function holdOrLetGo(human, match) {
  const player = match.players[match.controlled];

  human.held += 1;

  if (human.held > human.holdFor || match.ball.owner !== player?.index) {
    human.button = null;
  }
}

const strengthOf = (option) => (option.power ?? 0) + (option.bonus ?? 0);

// in a duel the strongest special, combo or skill is picked whenever there is spirit for one,
// else what the computer would
function duelPick(match, side) {
  const specials = duelOptions(match, side).filter((option) => option.move);

  if (specials.length > 0) {
    return specials.reduce((best, option) =>
      strengthOf(option) > strengthOf(best) ? option : best,
    ).id;
  }

  return computerChoice(match, currentRound(match.duel), side).id;
}

// what the cut-in does in the game: the human's pick, then the end of the show
function stepDuel(match) {
  if (match.duel?.stage === 'done') {
    finishDuel(match);

    return;
  }

  const round = currentRound(match.duel);
  const side = humanSideOf(match, round);

  if (side && round.picked[side] === null) {
    chooseDuel(match, side, duelPick(match, side));
  }
}

// a dribble skill is two taps of RUN, a few ticks apart, while he still has the ball
function tapRun(human, match) {
  if (match.ball.owner !== match.controlled) {
    human.runTaps = 0;
  }

  if (human.runTaps === 0 || human.tap) {
    return;
  }

  human.runGap = Math.max(0, human.runGap - 1);

  if (human.runGap === 0) {
    human.tap = 'sprint';
    human.runTaps -= 1;
    human.runGap = TAP_GAP;
  }
}

function step(human, match) {
  human.tap = null;

  if (match.phase === 'duel') {
    stepDuel(match);
  }

  if (match.phase === 'saveCam' && match.phaseTicks >= SAVE_CAM_TICKS) {
    endSaveCam(match);
  }

  if (match.phase !== 'play' && match.phase !== 'restart') {
    writeKeys({ ...human, aim: null, button: null, sprint: false }, match);

    return;
  }

  if (human.button) {
    holdOrLetGo(human, match);
  }

  if (!human.button) {
    decide(human, match);
  }

  tapRun(human, match);
  writeKeys(human, match);
}

// A decent player for side 0 of a match made with `humanTeam: 0` and duels attached: steers the
// one the match hands them toward goal, passes when pressed (to Sochetra when he is free) and to
// keep a combo going, shoots in range, lets a full charge go for a special, a finisher, a chain or
// a shot skill, holds PASS to full for a skill pass or a duo's pass, taps RUN twice for a dribble
// skill, strikes a duo's ball first time, slides in on the carrier, in a duel picks the strongest
// special or skill there is, and lets a save cam run before it ends it. `step(match)` sets the
// keys before each tick.
export function createDecentHuman(seed) {
  const human = {
    random: createRandom((seed ^ 0x5bd1e995) >>> 0),
    button: null,
    holdFor: 0,
    held: 0,
    aim: null,
    sprint: false,
    tap: null,
    runTaps: 0,
    runGap: 0,
  };

  return { step: (match) => step(human, match) };
}
