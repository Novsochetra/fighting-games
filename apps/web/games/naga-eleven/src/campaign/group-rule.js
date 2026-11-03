import { playRound } from './group-fixtures.js';
import { rankOf } from './group-table.js';
import { afterScene, goalsOf } from './outcome.js';

// the group's first match starts its table afresh, so a group played again counts only the new round
function recordFor(save, at) {
  const previous = save.cups[at.cup.id];

  if (previous && at.group.round > 0) {
    return previous;
  }

  return {
    kind: 'group',
    teams: at.group.teams,
    results: [],
    replays: previous ? previous.replays + 1 : 0,
  };
}

function recordAfter(save, stage, result) {
  const { at } = stage;
  const record = recordFor(save, at);
  const heroResult = {
    home: at.team,
    away: stage.opponent,
    homeGoals: goalsOf(result.goalsFor),
    awayGoals: goalsOf(result.goalsAgainst),
  };
  const others = playRound({
    group: at.group,
    heroTeam: at.team,
    cupId: at.cup.id,
    record,
    seed: save.seed,
  });

  return { ...record, results: [...record.results, heroResult, ...others] };
}

export function judgeGroup({ save, stage, result, outcome }) {
  const { at } = stage;
  const record = recordAfter(save, stage, result);
  const next = { ...save, cups: { ...save.cups, [at.cup.id]: record } };
  const scenes = [afterScene(stage, outcome)];

  if (!at.group.last || rankOf(record, at.team) < at.group.advance) {
    return { save: next, passed: true, scenes };
  }

  return {
    save: next,
    passed: false,
    backTo: at.group.first,
    scenes: [...scenes, at.group.failScene],
  };
}
