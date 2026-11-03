import { judgeGroup } from './group-rule.js';
import { afterScene, penaltiesWon } from './outcome.js';

function judgeFriendly({ save, stage, outcome }) {
  return { save, passed: true, scenes: [afterScene(stage, outcome)] };
}

function judgeKnockout({ save, stage, result, outcome }) {
  const passed = outcome === 'win' || (outcome === 'draw' && penaltiesWon(result.penalties));

  return { save, passed, scenes: [afterScene(stage, passed ? 'win' : 'lose')] };
}

export function judgeMatch(play) {
  const { at, rule } = play.stage;

  if (rule === 'group' && at.group) {
    return judgeGroup(play);
  }

  return rule === 'knockout' ? judgeKnockout(play) : judgeFriendly(play);
}
