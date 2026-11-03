export const HERO_ID = 'sochetra';

export const HERO_NAME = 'Sochetra';

export const teamList = (teams) => (Array.isArray(teams) ? teams : Object.values(teams ?? {}));

export function findTeam(teams, teamId) {
  if (Array.isArray(teams)) {
    return teams.find((team) => team.id === teamId) ?? null;
  }

  return teams?.[teamId] ?? null;
}

export const isHeroSlot = (player) => player.hero === true || player.id === HERO_ID;
