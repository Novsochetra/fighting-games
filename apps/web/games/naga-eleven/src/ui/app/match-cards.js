import { groupTable } from '../../campaign/index.js';
import { TEAMS } from '../../data/teams/index.js';
import { shootoutResult } from '../../sim/duel/index.js';

// the star of the other side the line-up card warns of
export function rivalOf(spec, heroAge) {
  const star = spec?.players?.find((player) => player.star && player.star !== 'sochetra');

  if (!star) {
    return null;
  }

  return { character: star.star, age: heroAge, mood: 'smirk', move: star.moves?.[0] ?? null };
}

export function prematchData(stage, session) {
  return {
    cup: stage?.at?.cup?.name ?? null,
    round: stage?.round ?? null,
    teams: session.specs,
    venue: session.venue,
    rival: rivalOf(session.specs[1], stage?.at?.heroAge ?? 'young'),
  };
}

function penaltiesOf(session) {
  if (!session.shootout) {
    return null;
  }

  const { goals } = shootoutResult(session.shootout);

  return { for: goals?.[0] ?? 0, against: goals?.[1] ?? 0 };
}

function groupOf(save, stage) {
  const cup = stage?.at?.cup;

  if (!cup || cup.kind !== 'group' || stage.rule !== 'group') {
    return null;
  }

  return { rows: groupTable(save, cup.id), teams: TEAMS, own: stage.at.team, advance: cup.advance };
}

const levelOf = (save) => ({ level: save.hero.level, xp: save.hero.xp });

// `before` and `after` are the saves either side of settling the match
export function postmatchData({ session, result, stage, before, after }) {
  return {
    teams: session.specs,
    score: [...session.match.score],
    side: 0,
    penalties: penaltiesOf(session),
    goals: result.goals,
    xp: before && after ? { before: levelOf(before), after: levelOf(after) } : null,
    woken: result.unlocked,
    group: after ? groupOf(after, stage) : null,
  };
}
