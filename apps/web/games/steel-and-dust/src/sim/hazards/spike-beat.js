import { SPIKE_TRAP } from '../../data/spike-traps.js';

const PHASES = ['rest', 'warn', 'rise', 'up', 'sink'];
// the sheet's frames: the tile flat, dust puffing, spikes half up, fully up and sinking back
const FRAMES = { rest: 0, warn: 1, rise: 2, up: 3, sink: 4 };

export const SPIKE_BEAT = PHASES.reduce((total, phase) => total + SPIKE_TRAP[phase], 0);

// where in its beat a tile is: the phase, and how many ticks into it
export function spikePhase(time) {
  let at = time % SPIKE_BEAT;
  for (const phase of PHASES) {
    if (at < SPIKE_TRAP[phase]) {
      return { phase, at };
    }
    at -= SPIKE_TRAP[phase];
  }

  return { phase: 'rest', at: 0 };
}

export const spikeFrame = (time) => FRAMES[spikePhase(time).phase];

// the spikes stab from the moment they shoot up until they start to sink
export function spikesUp(time) {
  const { phase } = spikePhase(time);

  return phase === 'rise' || phase === 'up';
}
