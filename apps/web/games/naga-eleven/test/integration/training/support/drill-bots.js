import { DRILLS } from '../../../../src/data/training.js';
import { updateDrill } from '../../../../src/training/index.js';
import { blocksShot, moveDummy } from '../../../../src/training/target-shot/motion.js';
import { flightTicksOf, riseOf } from '../../../../src/training/target-shot/shot.js';
import { TARGETS } from '../../../../src/training/target-shot/targets.js';

// players that script the drills: a perfect one for each, and one that never touches the pad

export const NOTHING = { held: {}, pressed: {} };

export const idleBot = () => NOTHING;

const PASS_SIDE = 18;

function coneWaypoint(run) {
  const next = run.course.cones.find((cone) => !cone.passed);

  if (!next) {
    return { x: run.course.finishX + 20, y: run.runner.y };
  }

  return { x: next.x, y: next.y + (next.side === 'far' ? -PASS_SIDE : PASS_SIDE) };
}

export function coneBot(state) {
  const run = state.run;
  const aim = coneWaypoint(run);
  const gap = aim.y - run.runner.y;
  const ahead = aim.x - run.runner.x;

  // a swing too wide to make on the diagonal is made straight across first
  return {
    held: { right: ahead > 0 && Math.abs(gap) < ahead * 0.9, up: gap < -2, down: gap > 2 },
    pressed: {},
  };
}

const SHOT = DRILLS['target-shot'].tuning;
const SWEET = (SHOT.sweetLow + SHOT.sweetHigh) / 2;
const CHARGE = Math.round(SWEET * SHOT.chargeTicks);

function steerAim(run, spot) {
  const want = { x: spot.x, y: spot.y - riseOf(CHARGE / SHOT.chargeTicks, SHOT) };
  const across = want.x - run.aim.x;
  const up = want.y - run.aim.y;
  const slack = SHOT.aimSpeed;

  return { right: across > slack, left: across < -slack, up: up > slack, down: up < -slack };
}

const FLIGHT = flightTicksOf(CHARGE / SHOT.chargeTicks, SHOT);

// the aim settles within a step of the target, so the dummy is kept that far off either side
const AIM_SLACK = SHOT.aimSpeed * 2;

function dummyBlocksAfter(state, ticks, spot) {
  const future = structuredClone(state);
  const blocked = [];
  const near = { ...spot, x: spot.x - AIM_SLACK };
  const far = { ...spot, x: spot.x + AIM_SLACK };

  for (let i = 1; i <= ticks + 2; i += 1) {
    moveDummy(future, SHOT);
    blocked.push(blocksShot(future, SHOT, near) || blocksShot(future, SHOT, far));
  }

  return blocked.slice(Math.max(0, ticks - 3)).some(Boolean);
}

// the light left as the ball lands: the middle of its last moment, or the nearest clear of the dummy
function plannedArrival(state) {
  const { target } = state.run;
  const late = Math.round(target.total * SHOT.lateShare);
  const spot = TARGETS[target.index];
  const middle = Math.round(late / 2);
  const choices = Array.from({ length: late }, (_, i) => late - i).sort(
    (first, second) => Math.abs(first - middle) - Math.abs(second - middle),
  );

  return choices.find((left) => !dummyBlocksAfter(state, target.left - left, spot)) ?? middle;
}

// it strikes so the ball lands in the light's last moment, past the dummy
export function createShotBot() {
  const plans = new Map();

  return (state) => {
    const run = state.run;

    if (run.stage !== 'aim') {
      return NOTHING;
    }

    const key = `${state.attempt}:${run.shot}`;

    if (!plans.has(key)) {
      plans.set(key, plannedArrival(state));
    }

    const startAt = plans.get(key) + FLIGHT + CHARGE;
    const charging = run.target.left <= startAt && run.charge < CHARGE;

    return { held: { ...steerAim(run, TARGETS[run.target.index]), shoot: charging }, pressed: {} };
  };
}

export function spiritBot(state) {
  const run = state.run;
  const onBeat = run.beats.some((beat) => beat.rating === null && beat.at === run.clock + 1);

  return { held: {}, pressed: { pass: onBeat } };
}

export const BOTS = {
  'cone-dribble': () => coneBot,
  'target-shot': createShotBot,
  'spirit-focus': () => spiritBot,
};

export function playRun(state, bot, limit = 20000) {
  updateDrill(state, { held: {}, pressed: { pass: true } });

  for (let i = 0; i < limit && state.phase !== 'result'; i += 1) {
    updateDrill(state, state.phase === 'play' ? bot(state) : NOTHING);
  }

  return state;
}
