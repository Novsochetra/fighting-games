import { metFlag } from './flags.js';
import { inForm } from './match-form.js';
import { systemsForSave, systemsForStage } from './systems.js';
import { HERO_ID, HERO_NAME, findTeam, isHeroSlot, teamList } from './teams.js';

const copyPlayer = (player) => ({
  ...player,
  stats: { ...player.stats },
  moves: [...(player.moves ?? [])],
});

function heroPlayer(player, hero) {
  return {
    ...player,
    name: player.name ?? HERO_NAME,
    star: player.star ?? HERO_ID,
    stats: { ...hero.stats },
    moves: [...hero.moves],
    spiritMax: hero.spiritMax,
  };
}

export function teamSpecFor(save, teamId, teams) {
  const team = findTeam(teams, teamId);

  if (!team) {
    return null;
  }

  const players = (team.players ?? []).map((player) =>
    isHeroSlot(player) ? heroPlayer(player, save.hero) : copyPlayer(player),
  );

  return { ...team, players };
}

// each side carries the skills and combos the story has brought in by this match, which the match
// reads off them (src/sim/create-match.js)
const withSystems = (spec, systems) => (spec ? { ...spec, systems } : spec);

export function matchSidesFor(save, stage, teams, chapters) {
  const systems = systemsForStage(stage, chapters);

  return [
    withSystems(inForm(teamSpecFor(save, stage.at.team, teams), stage.teamForm), systems),
    withSystems(inForm(teamSpecFor(save, stage.opponent, teams), stage.opponentForm), systems),
  ];
}

export function quickMatchTeams(save, teams, chapters) {
  const systems = systemsForSave(save, chapters);

  return teamList(teams)
    .filter((team) => save.flags[metFlag(team.id)])
    .map((team) => withSystems(teamSpecFor(save, team.id, teams), systems));
}
