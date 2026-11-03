import { choosePenalty, stepShootout } from '../../sim/duel/index.js';
import { penaltyHitTest } from './penalty-hit.js';
import { enter } from './show.js';

export const PENALTY_TICKS = { ready: 40, kick: 50, result: 70, over: 150 };

const AIMS = [-1, 0, 1];

export function createPenaltyShow(shootout, { match = null, heroAge = null } = {}) {
  return {
    shootout,
    match,
    heroAge,
    stage: 'ready',
    stageTicks: 0,
    ticks: 0,
    cursor: 1,
    power: 0,
    kick: null,
  };
}

export const isPenaltyShowDone = (show) => show.stage === 'done';

// which choice is the human's on this kick: 'shoot', 'keep' or none
export function humanPart(show) {
  const { pending, humanTeam } = show.shootout;

  if (!pending || humanTeam === null) {
    return null;
  }

  return pending.team === humanTeam ? 'shoot' : 'keep';
}

// the gauge sweeps up and down; where it stands when the player lets fly is the kick's power
export const sweepOf = (ticks) => 1 - Math.abs(((ticks / 40) % 2) - 1);

// up and down (or left and right) step through left, middle and right; pass or a tap picks
function pick(show, input) {
  const pressed = input.pressed ?? {};
  const step = (pressed.down || pressed.right ? 1 : 0) - (pressed.up || pressed.left ? 1 : 0);
  const tapped = input.tap ? penaltyHitTest(show, input.tap) : null;

  show.cursor = tapped ? tapped.aim + 1 : Math.max(0, Math.min(2, show.cursor + step));

  return Boolean(pressed.pass || tapped);
}

const STAGES = {
  ready(show) {
    if (show.stageTicks >= PENALTY_TICKS.ready) {
      enter(show, { shoot: 'aim', keep: 'dive' }[humanPart(show)] ?? 'wait');
    }
  },
  aim: (show, input) => pick(show, input) && enter(show, 'power'),
  power(show, input) {
    show.power = sweepOf(show.stageTicks);

    if (input.pressed?.pass || input.tap) {
      choosePenalty(show.shootout, 'shoot', { aim: AIMS[show.cursor], power: show.power });
      enter(show, 'wait');
    }
  },
  dive(show, input) {
    if (pick(show, input)) {
      choosePenalty(show.shootout, 'keep', { dive: AIMS[show.cursor] });
      enter(show, 'wait');
    }
  },
  wait(show) {
    show.kick = stepShootout(show.shootout);

    if (show.kick) {
      enter(show, 'kick');
    }
  },
  kick: (show) => show.stageTicks >= PENALTY_TICKS.kick && enter(show, 'result'),
  result(show) {
    if (show.stageTicks >= PENALTY_TICKS.result) {
      show.cursor = 1;
      enter(show, show.shootout.over ? 'over' : 'ready');
    }
  },
  over: (show) => show.stageTicks >= PENALTY_TICKS.over && enter(show, 'done'),
  done: () => {},
};

export function updatePenaltyShow(show, input = {}) {
  show.ticks += 1;
  show.stageTicks += 1;
  STAGES[show.stage](show, input);

  return show;
}
