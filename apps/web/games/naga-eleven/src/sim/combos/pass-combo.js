import { PASS_COMBO } from '../../data/combos.js';
import { struckAt } from '../charge.js';
import { pushEvent } from '../events.js';
import { gainSpirit } from '../spirit.js';

const NONE = { level: 0, power: 0, speed: 0 };

export const holdTicksOf = (match) =>
  PASS_COMBO.holdTicks[match.format] ?? PASS_COMBO.holdTicks[11];

const combosOn = (match) => match.systems?.passCombo !== false;

export function endCombo(match, reason) {
  const { combo } = match;

  match.combo = null;

  if (combo) {
    pushEvent(match, { type: 'comboEnd', team: combo.team, level: combo.level, reason });
  }
}

// a pass on its way, and what it counts when a mate takes it: a step when it was played within the
// hold of the touch that took the ball, two for a skill pass or cross
export function notePass(match, passer, { steps = 1, held = passer.holding - passer.charge } = {}) {
  match.comboPass = {
    passer: passer.index,
    team: passer.team,
    tick: match.tick,
    steps,
    quick: held <= holdTicksOf(match),
  };
}

const EMPTY = { level: 0, passer: null, holder: null };

// a one-two is the ball back to the one who played the pass before, from the one he played it to
const isOneTwo = (before, pass, receiver) =>
  before.passer === receiver.index && before.holder === pass.passer;

function climb(match, pass, receiver) {
  const before = match.combo?.team === pass.team ? match.combo : EMPTY;
  const oneTwo = isOneTwo(before, pass, receiver);
  const steps = oneTwo ? Math.max(pass.steps, PASS_COMBO.oneTwo) : pass.steps;
  const level = Math.min(PASS_COMBO.most, before.level + steps);

  match.combo = {
    team: pass.team,
    level,
    holder: receiver.index,
    since: match.tick,
    passer: pass.passer,
    before: before.passer,
  };
  gainSpirit(match, match.players[pass.passer], PASS_COMBO.stepSpirit[level]);

  if (level >= PASS_COMBO.showFrom && level > before.level) {
    pushEvent(match, { type: 'combo', team: pass.team, level, player: pass.passer });
  }

  return oneTwo;
}

function takePass(match, pass, receiver) {
  gainSpirit(match, match.players[pass.passer], 'pass');

  if (combosOn(match) && pass.quick && climb(match, pass, receiver)) {
    gainSpirit(match, receiver, 'oneTwo');
  }
}

// beating a man, or picking up a ball of his own side's, keeps it and starts its clock again
export function keepCombo(match, player) {
  const { combo } = match;

  if (combo?.team === player.team) {
    Object.assign(combo, { holder: player.index, since: match.tick });
  } else if (combo) {
    endCombo(match, 'lost');
  }
}

// a player has the ball (or meets it first time): the pass he took counts, or the other side's
// touch breaks the combo; an opponent's ball taken in the field is an interception
export function noteTouch(match, player) {
  const pass = match.comboPass;
  const last = match.players[match.ball.lastTouch] ?? null;

  match.comboPass = null;

  if (pass && pass.team === player.team && pass.passer !== player.index) {
    takePass(match, pass, player);

    return;
  }

  if (last && last.team !== player.team && player.role !== 'keeper') {
    gainSpirit(match, player, 'intercept');
  }

  keepCombo(match, player);
}

// what his side's combo lifts the shot he strikes now with: only the holder's, within the hold
export function comboLiftOf(match, player) {
  const { combo } = match;
  const holds = combo?.team === player.team && combo.holder === player.index;

  if (!holds || struckAt(match, player) - combo.since > holdTicksOf(match)) {
    return NONE;
  }

  return {
    level: combo.level,
    power: PASS_COMBO.shotPower[combo.level],
    speed: PASS_COMBO.shotSpeed[combo.level],
  };
}

// any shot spends it
export function spendCombo(match, player) {
  if (match.combo?.team === player.team) {
    endCombo(match, 'shot');
  }
}

// the holder kept it past the hold, or a pass of its own ran loose twice that long
function isHeldUp(match, combo) {
  const { ball } = match;
  const hold = holdTicksOf(match);
  const since = match.comboPass?.tick ?? combo.since;

  if (ball.owner === combo.holder) {
    return struckAt(match, match.players[combo.holder]) - combo.since > hold;
  }

  return ball.owner === null && match.tick - since > hold * 2;
}

const isLost = (match, combo) =>
  (match.players[match.ball.lastTouch]?.team ?? combo.team) !== combo.team;

// it breaks when the other side touches the ball and when it is held up
export function watchCombo(match) {
  const { combo } = match;

  if (!combo) {
    return;
  }

  if (isLost(match, combo)) {
    endCombo(match, 'lost');
  } else if (isHeldUp(match, combo)) {
    endCombo(match, 'held');
  }
}
