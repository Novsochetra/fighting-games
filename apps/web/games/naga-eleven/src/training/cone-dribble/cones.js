import { distance } from '../../sim/vector.js';
import { breakCombo, pushMark, scorePoints } from '../scoring.js';
import { knockRunner } from './runner.js';

const BALL_RADIUS = 3;
const MANNEQUIN_RADIUS = 7;
const NEAR = 24;

const passedOnItsSide = (cone, y) => (cone.side === 'far' ? y < cone.y : y > cone.y);

function cleanPoints(state, tuning) {
  return tuning.cleanPoints + tuning.comboPoints * Math.min(state.combo, tuning.comboCap);
}

function passCone(state, cone, tuning) {
  const run = state.run;

  cone.passed = true;

  if (cone.down !== null) {
    return;
  }

  if (passedOnItsSide(cone, run.runner.y)) {
    const points = cleanPoints(state, tuning);

    cone.clean = true;
    scorePoints(state, points);
    pushMark(state, { kind: 'clean', x: cone.x, y: cone.y, points });

    return;
  }

  run.penalty += tuning.wrongSidePenalty;
  breakCombo(state);
  pushMark(state, { kind: 'wrongSide', x: cone.x, y: cone.y, points: 0 });
}

const touches = (runner, thing, radius, reach) =>
  distance(runner, thing) < radius + reach || distance(runner.ball, thing) < radius + BALL_RADIUS;

function stumble(state, { thing, kind, tuning }) {
  const run = state.run;

  run.penalty += tuning.brushPenalty;
  knockRunner(run.runner, tuning.wobbleTicks);
  breakCombo(state);
  pushMark(state, { kind, x: thing.x, y: thing.y, points: 0 });
}

function brushCones(state, tuning) {
  const { runner, course } = state.run;

  for (const cone of course.cones) {
    const close = cone.down === null && Math.abs(cone.x - runner.x) < NEAR;

    if (close && touches(runner, cone, tuning.coneRadius, tuning.reach)) {
      cone.down = state.tick;
      stumble(state, { thing: cone, kind: 'brush', tuning });
    }
  }
}

function bumpMannequins(state, tuning) {
  const { runner, course } = state.run;

  for (const mannequin of course.mannequins) {
    const ready = mannequin.hit === null || state.tick - mannequin.hit > tuning.wobbleTicks;

    if (
      ready &&
      runner.wobble === 0 &&
      touches(runner, mannequin, MANNEQUIN_RADIUS, tuning.reach)
    ) {
      mannequin.hit = state.tick;
      stumble(state, { thing: mannequin, kind: 'bump', tuning });
    }
  }
}

export function judgeCones(state, { tuning, fromX }) {
  const { runner, course } = state.run;

  brushCones(state, tuning);
  bumpMannequins(state, tuning);

  for (const cone of course.cones) {
    if (!cone.passed && fromX < cone.x && runner.x >= cone.x) {
      passCone(state, cone, tuning);
    }
  }
}
