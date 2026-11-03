import { clamp } from '../../sim/vector.js';
import { breakCombo, held, pushMark, scorePoints } from '../scoring.js';
import { blocksShot } from './motion.js';
import { isLate, MOUTH, targetAt } from './targets.js';

const AIM_REACH = { x: MOUTH.half + 40, y: MOUTH.height + 40 };
const WEAKEST = 0.15;

export function moveAim(run, input, tuning) {
  const across = (held(input, 'right') ? 1 : 0) - (held(input, 'left') ? 1 : 0);
  const up = (held(input, 'up') ? 1 : 0) - (held(input, 'down') ? 1 : 0);

  run.aim.x = clamp(run.aim.x + across * tuning.aimSpeed, -AIM_REACH.x, AIM_REACH.x);
  run.aim.y = clamp(run.aim.y + up * tuning.aimSpeed, 0, AIM_REACH.y);
}

export const powerOf = (charge, tuning) => Math.min(1, charge / tuning.chargeTicks);

// struck too soft the ball dips under the aim, too hard it climbs over it
export function riseOf(power, tuning) {
  if (power < tuning.sweetLow) {
    return -(tuning.sweetLow - power) * tuning.dropPerPower;
  }

  return power > tuning.sweetHigh ? (power - tuning.sweetHigh) * tuning.risePerPower : 0;
}

export const flightTicksOf = (power, tuning) =>
  Math.round(tuning.slowFlight - (tuning.slowFlight - tuning.fastFlight) * power);

function launch(run, tuning) {
  const power = powerOf(run.charge, tuning);

  run.ball = {
    fromX: run.spot.x,
    to: { x: run.aim.x, y: run.aim.y + riseOf(power, tuning) },
    power,
    ticks: 0,
    total: flightTicksOf(power, tuning),
  };
  run.charge = 0;
  run.stage = 'flight';
  run.stageTicks = 0;
}

// held, the shot charges; let go, it is struck
export function chargeShot(run, input, tuning) {
  if (held(input, 'shoot')) {
    run.charge = Math.min(tuning.chargeTicks, run.charge + 1);

    return false;
  }

  if (run.charge > 0) {
    launch(run, tuning);

    return true;
  }

  return false;
}

function outcomeOf(state, tuning, point) {
  const { run } = state;

  if (run.ball.power < WEAKEST || point.y < 0) {
    return 'short';
  }

  if (Math.abs(point.x) > MOUTH.half || point.y > MOUTH.height) {
    return point.y > MOUTH.height ? 'over' : 'wide';
  }

  if (blocksShot(state, tuning, point)) {
    return 'saved';
  }

  return targetAt(run.target, point, tuning.targetRadius) ? 'hit' : 'net';
}

function hitPoints(state, tuning, late) {
  const base = late ? tuning.latePoints : tuning.hitPoints;

  return base + tuning.comboPoints * Math.min(state.combo, tuning.comboCap);
}

export function judgeShot(state, tuning) {
  const { run } = state;
  const point = run.ball.to;
  const kind = outcomeOf(state, tuning, point);
  const late = kind === 'hit' && isLate(run.target, tuning);
  const points = kind === 'hit' ? hitPoints(state, tuning, late) : 0;

  if (kind === 'hit') {
    scorePoints(state, points);
    run.target.left = 0;
  } else {
    breakCombo(state);
  }

  const netPoints = kind === 'net' ? tuning.netPoints : 0;

  state.score += netPoints;
  run.results.push(late ? 'lateHit' : kind);
  pushMark(state, {
    kind: late ? 'lateHit' : kind,
    x: point.x,
    y: point.y,
    points: points + netPoints,
  });
}
