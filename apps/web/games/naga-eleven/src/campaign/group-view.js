import { teamStrength } from './team-strength.js';
import { findTeam } from './teams.js';

const isGroupStageOf = (stage, cupId) =>
  stage.kind === 'match' && stage.rule === 'group' && stage.cup === cupId;

export function groupOf({ chapter, stageIndex, cup, teams }) {
  const indexes = chapter.stages.flatMap((stage, index) =>
    isGroupStageOf(stage, cup.id) ? [index] : [],
  );
  const opponents = indexes.map((index) => chapter.stages[index].opponent);
  const groupTeams = [...new Set([chapter.team, ...(cup.teams ?? []), ...opponents])];
  const strengths = groupTeams.map((teamId) => [teamId, teamStrength(findTeam(teams, teamId))]);

  return {
    teams: groupTeams,
    opponents,
    round: indexes.indexOf(stageIndex),
    first: indexes[0],
    last: indexes.at(-1) === stageIndex,
    advance: cup.advance ?? 2,
    failScene: cup.failScene ?? null,
    strengths: Object.fromEntries(strengths),
  };
}
