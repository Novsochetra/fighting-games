import { describe, expect, it } from 'vitest';
import { heroAtLevel } from '../../../src/campaign/levels.js';
import { newSave } from '../../../src/campaign/save.js';
import { systemsForSave, systemsForStage } from '../../../src/campaign/systems.js';
import { matchSidesFor, quickMatchTeams, teamSpecFor } from '../../../src/campaign/team-spec.js';
import {
  FIXTURE_CHAPTERS,
  FIXTURE_TEAMS,
  makeTeam,
  stageAt,
} from '../../support/campaign-fixtures.js';

const save = {
  ...newSave(),
  hero: { ...heroAtLevel(12), moves: ['power-shot', 'naga-shot'] },
  flags: { 'met:town-high': true, 'met:capital-elite': true, 'reward:chapter-1/4': true },
};

describe('a team for a match', () => {
  it("puts Sochetra's stats, moves and gauge from the save in his place", () => {
    const team = teamSpecFor(save, 'town-high', FIXTURE_TEAMS);
    const hero = team.players[9];

    expect(hero).toMatchObject({
      id: 'sochetra',
      name: 'Sochetra',
      star: 'sochetra',
      stats: save.hero.stats,
      moves: ['power-shot', 'naga-shot'],
      spiritMax: save.hero.spiritMax,
    });
    expect(team).toMatchObject({ id: 'town-high', kit: 'town-high', format: '11' });
    expect(team.players).toHaveLength(11);
  });

  it("names him by the team's own name for him, else Sochetra", () => {
    const team = makeTeam({ id: 'kids', format: '7', hero: true });

    team.players[6] = { ...team.players[6], name: { en: 'Sochetra', km: 'Sochetra (km)' } };

    expect(teamSpecFor(save, 'kids', [team]).players[6].name.km).toBe('Sochetra (km)');

    delete team.players[6].name;

    expect(teamSpecFor(save, 'kids', [team]).players[6].name).toBe('Sochetra');
  });

  it('copies the team, so the match cannot change the tables', () => {
    const team = teamSpecFor(save, 'capital-elite', FIXTURE_TEAMS);

    team.players[0].stats.keeping = 1;
    team.players[0].moves.push('angkor-wall');
    team.players[9].stats.shot = 1;

    expect(FIXTURE_TEAMS.find((each) => each.id === 'capital-elite').players[0].stats.keeping).toBe(
      62,
    );
    expect(teamSpecFor(save, 'town-high', FIXTURE_TEAMS).players[9].stats).toEqual(save.hero.stats);
    expect(FIXTURE_TEAMS[7].players[0].moves).toEqual([]);
  });

  it('reads teams kept in an object by id as well', () => {
    const byId = Object.fromEntries(FIXTURE_TEAMS.map((team) => [team.id, team]));

    expect(teamSpecFor(save, 'town-high', byId).players[9].stats).toEqual(save.hero.stats);
  });

  it('is none for a team that does not exist', () => {
    expect(teamSpecFor(save, 'atlantis', FIXTURE_TEAMS)).toBeNull();
  });
});

describe('the sides of a story match', () => {
  // chapter 3 of the fixtures opens its group against dragon-youth and meets them in the final
  const opener = { ...stageAt(FIXTURE_CHAPTERS, 2, 1), opponentForm: { stats: 6 } };
  const final = stageAt(FIXTURE_CHAPTERS, 2, 6);
  const statsOf = (spec) => spec.players.map((player) => player.stats);
  const withoutSystems = ({ systems: _systems, ...spec }) => spec;

  it("are Sochetra's side and the stage's opponent, as their tables have them", () => {
    const [ours, theirs] = matchSidesFor(save, final, FIXTURE_TEAMS, FIXTURE_CHAPTERS);

    expect([ours.id, theirs.id]).toEqual(['nation-youth', 'dragon-youth']);
    expect(withoutSystems(ours)).toEqual(teamSpecFor(save, 'nation-youth', FIXTURE_TEAMS));
    expect(withoutSystems(theirs)).toEqual(teamSpecFor(save, 'dragon-youth', FIXTURE_TEAMS));
  });

  it('carry the skills and combos the story has brought in by the match, the same for both', () => {
    const [ours, theirs] = matchSidesFor(save, final, FIXTURE_TEAMS, FIXTURE_CHAPTERS);

    expect(ours.systems).toEqual(systemsForStage(final, FIXTURE_CHAPTERS));
    expect(theirs.systems).toEqual(ours.systems);
  });

  it('field the opponent in the form the stage names, and only in that match', () => {
    const [, inOpener] = matchSidesFor(save, opener, FIXTURE_TEAMS);
    const [, inFinal] = matchSidesFor(save, final, FIXTURE_TEAMS);

    expect(final.opponent).toBe(opener.opponent);
    expect(statsOf(inOpener).every((stats) => stats.speed === 86 && stats.shot === 86)).toBe(true);
    expect(statsOf(inFinal).every((stats) => stats.speed === 80 && stats.shot === 80)).toBe(true);
    expect(FIXTURE_TEAMS.find((team) => team.id === 'dragon-youth').players[1].stats.speed).toBe(
      80,
    );
  });

  it("field Sochetra's teammates in the stage's form for them, Sochetra as the save has him", () => {
    const nervous = { ...final, teamForm: { stats: -4 } };
    const [ours, theirs] = matchSidesFor(save, nervous, FIXTURE_TEAMS);
    const [plain] = matchSidesFor(save, final, FIXTURE_TEAMS);

    expect(ours.players[1].stats.pass).toBe(plain.players[1].stats.pass - 4);
    expect(ours.players[9].stats).toEqual(save.hero.stats);
    expect(withoutSystems(theirs)).toEqual(teamSpecFor(save, 'dragon-youth', FIXTURE_TEAMS));
  });
});

describe('the quick match teams', () => {
  it('are the teams met in the story, in the order of the team list', () => {
    expect(quickMatchTeams(save, FIXTURE_TEAMS).map((team) => team.id)).toEqual([
      'town-high',
      'capital-elite',
    ]);
  });

  it("carry Sochetra's level in his place", () => {
    const [town] = quickMatchTeams(save, FIXTURE_TEAMS);

    expect(town.players[9].stats).toEqual(save.hero.stats);
  });

  it('play what the save has reached in the story', () => {
    const [town, capital] = quickMatchTeams(save, FIXTURE_TEAMS, FIXTURE_CHAPTERS);

    expect(town.systems).toEqual(systemsForSave(save, FIXTURE_CHAPTERS));
    expect(capital.systems).toEqual(town.systems);
  });

  it('are none on a new save', () => {
    expect(quickMatchTeams(newSave(), FIXTURE_TEAMS)).toEqual([]);
  });
});
