import { MOST_NAGA_STEP, NAGA_SHAKES, NAGA_SHOTS } from './camera/shots.js';
import { NAGA_TIMINGS, STAGE_IDS } from './sequence.js';

// the Naga Shot's own lists for the lab's editor: its camera stage by stage, its timings and the
// strength of its shakes
export const NAGA_EDITABLE = {
  'naga.timings': { label: 'Naga Shot: timings', value: NAGA_TIMINGS, timings: true },
  'naga.shakes': { label: 'Naga Shot: shakes', value: NAGA_SHAKES, timings: true },
  ...Object.fromEntries(
    STAGE_IDS.map((stage) => [
      `naga.${stage}`,
      { label: `Naga Shot: ${stage}`, value: NAGA_SHOTS[stage], most: MOST_NAGA_STEP },
    ]),
  ),
};
