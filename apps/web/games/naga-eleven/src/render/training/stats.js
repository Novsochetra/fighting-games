import { runTime } from '../../training/cone-dribble/index.js';
import { seconds } from './hud.js';
import { LABELS } from './labels.js';

const count = (list, test) => list.filter(test).length;

// the lines a result card shows under the score, each drill its own
const STATS = {
  'cone-dribble': ({ run }) => [
    { label: LABELS.time, value: run.timeUp ? LABELS.timeUp : `${seconds(runTime(run))}s` },
    {
      label: LABELS.cones,
      value: `${count(run.course.cones, (cone) => cone.clean)}/${run.course.cones.length}`,
    },
  ],
  'target-shot': ({ run }) => [
    {
      label: LABELS.hits,
      value: `${count(run.results, (kind) => kind === 'hit' || kind === 'lateHit')}/${run.results.length}`,
    },
    { label: LABELS.lateHit, value: String(count(run.results, (kind) => kind === 'lateHit')) },
  ],
  'spirit-focus': ({ run }) => [
    {
      label: LABELS.perfects,
      value: `${count(run.beats, (beat) => beat.rating === 'perfect')}/${run.beats.length}`,
    },
    { label: LABELS.good, value: String(count(run.beats, (beat) => beat.rating === 'good')) },
  ],
};

export const statsOf = (state) => [
  { label: LABELS.score, value: String(state.score), gold: true },
  { label: LABELS.bestCombo, value: `x${state.bestCombo}` },
  ...STATS[state.drill](state),
];
