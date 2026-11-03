import { rewardFlag, withFlags } from './flags.js';

// a stage's rewards come once, the first time it is passed, however often it is played again
export function claimRewards(save, stage, passed) {
  const flag = rewardFlag(stage.at);

  if (!passed || save.flags[flag]) {
    return { save, xp: 0, moves: [] };
  }

  return {
    save: withFlags(save, [flag]),
    xp: Number(stage.rewards?.xp) || 0,
    moves: [stage.rewards?.moves ?? []].flat(),
  };
}
