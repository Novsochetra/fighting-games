import { VENT } from '../../data/vents.js';

const PHASES = ['rest', 'glow', 'erupt', 'cool'];
// the glowing grate pulses between its two glow frames, the warning
const PULSE = 6;
// the column bursts up through two frames, roars between its two tallest and breaks up in the last
const BURST = 4;
const BREAK_UP = 6;

export const VENT_BEAT = PHASES.reduce((total, phase) => total + VENT[phase], 0);

// where in its beat a vent is: the phase, and how many ticks into it
export function ventPhase(time) {
  let at = time % VENT_BEAT;

  for (const phase of PHASES) {
    if (at < VENT[phase]) {
      return { phase, at };
    }

    at -= VENT[phase];
  }

  return { phase: 'rest', at: 0 };
}

function eruptingFrame(at) {
  if (at < BURST * 2) {
    return 3 + Math.floor(at / BURST);
  }

  return at >= VENT.erupt - BREAK_UP ? 7 : 5 + (Math.floor(at / BURST) % 2);
}

const FRAME_OF = {
  rest: () => 0,
  glow: (at) => 1 + (Math.floor(at / PULSE) % 2),
  erupt: eruptingFrame,
  cool: (at) => 8 + Math.min(1, Math.floor((at * 2) / VENT.cool)),
};

// the frame of the slag vent strip (fx-sprites.js) a vent shows at a time in its beat
export function ventFrame(time) {
  const { phase, at } = ventPhase(time);

  return FRAME_OF[phase](at);
}
