import { STAGES } from '../data/stages.js';
import { TUNING } from '../data/tuning.js';

export function startPatience(run) {
  const total = STAGES[run.stage - 1].patience;

  run.patience = { left: total, total };
}

export function speedOf(run) {
  const { left, total } = run.patience;
  const share = total > 0 && Number.isFinite(total) ? left / total : 1;
  const { perfect, great } = TUNING.speedShares;

  if (share >= perfect) {
    return 'perfect';
  }

  return share >= great ? 'great' : 'good';
}

export function waitedMs(run) {
  return run.patience.total - run.patience.left;
}
