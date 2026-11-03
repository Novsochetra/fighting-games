import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../../../../src/data/characters.js';
import { FORMATS } from '../../../../src/data/formats.js';
import { CHAPTERS } from '../../../../src/data/story/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { STAT_NAMES } from '../../../../src/data/teams/squad.js';
import { SPIRIT } from '../../../../src/data/tuning.js';
import { KHMER, LEVELS, MOVE_OWNERS, TEAM_KITS } from '../story/readme-ids.js';

const teams = Object.values(TEAMS);

const chapterOf = (team) => TEAM_KITS[team.id][0];

const players = teams.flatMap((team) => team.players.map((player) => ({ team, player })));

const ordinary = players.filter(({ player }) => !player.star);

const heroTeams = CHAPTERS.map((chapter) => TEAMS[chapter.team]);

// the README's centre forward: index 6 in '7', 9 in '11'
const HERO_SLOT = { 7: 6, 11: 9 };

// a keeper's gift is keeping, an outfield player's is the best of the rest
const giftOf = (player) =>
  player.role === 'keeper'
    ? player.stats.keeping
    : Math.max(
        ...STAT_NAMES.filter((name) => name !== 'keeping').map((name) => player.stats[name]),
      );

describe('the teams', () => {
  it('are the README teams, each with its id, kit and format', () => {
    expect(Object.keys(TEAMS).sort()).toEqual(Object.keys(TEAM_KITS).sort());

    for (const team of teams) {
      const [chapter, kit] = TEAM_KITS[team.id];

      expect(team.kit).toBe(kit);
      expect(team.format).toBe(chapter === 1 ? '7' : '11');
    }
  });

  it('have a name in both languages and a three-letter short name', () => {
    for (const team of teams) {
      expect(team.name.en).toBeTruthy();
      expect(team.name.km).toMatch(KHMER);
      expect(team.short).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('field a full side in the formation order of their format', () => {
    for (const team of teams) {
      const roles = FORMATS[team.format].formation.map((slot) => slot.role);

      expect(team.players.map((player) => player.role)).toEqual(roles);
    }
  });

  it('give each player an id and a shirt number of their own in the team', () => {
    for (const team of teams) {
      const ids = team.players.map((player) => player.id);
      const numbers = team.players.map((player) => player.number);

      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(numbers).size).toBe(numbers.length);
      expect(numbers.every((number) => Number.isInteger(number) && number > 0)).toBe(true);
    }
  });
});

describe('the players', () => {
  it('each have every stat, between 1 and 99, but Sochetra, whom the save fills in', () => {
    for (const { player } of players.filter((each) => !each.player.hero)) {
      expect(Object.keys(player.stats).sort()).toEqual([...STAT_NAMES].sort());
      expect(Object.values(player.stats).every((stat) => stat >= 1 && stat <= 99)).toBe(true);
    }
  });

  it('are named in Khmer too when they play for a Cambodian side', () => {
    const cambodian = (team) => chapterOf(team) <= 2 || team.kit === 'cambodia';

    for (const { team, player } of players.filter((each) => cambodian(each.team))) {
      expect(player.name.km, `${team.id} ${player.id}`).toMatch(KHMER);
    }

    expect(players.every(({ player }) => player.name.en || player.name)).toBe(true);
  });

  it("have a gift in their chapter's README range when they are ordinary players", () => {
    for (const { team, player } of ordinary) {
      const { min, max } = LEVELS[chapterOf(team)];

      expect(giftOf(player), `${team.id} ${player.id}`).toBeGreaterThanOrEqual(min);
      expect(giftOf(player), `${team.id} ${player.id}`).toBeLessThanOrEqual(max);
    }
  });

  it('carry moves the README knows, a signature move only on its owner', () => {
    for (const { player } of players) {
      for (const move of player.moves) {
        expect(Object.hasOwn(MOVE_OWNERS, move)).toBe(true);
        expect([null, player.star]).toContain(MOVE_OWNERS[move]);
      }

      expect(player.moves.length > 0 && !player.star).toBe(false);
    }
  });

  it('are stars only for cast members, by their character id and name', () => {
    for (const { player } of players.filter((each) => each.player.star)) {
      expect(CHARACTERS[player.star]).toBeDefined();
      expect(player.id).toBe(player.star);
      expect(player.name).toEqual(CHARACTERS[player.star].name);
    }
  });
});

describe('the rivals', () => {
  const rivals = players.filter(
    ({ team, player }) => CHARACTERS[player.star]?.role === 'rival' && !heroTeams.includes(team),
  );

  it('lead the sides Sochetra meets, a step above the best of their chapter', () => {
    expect(rivals.map(({ player }) => player.star).sort()).toEqual(
      ['farhad', 'haruto', 'lukas', 'minjun', 'rafael', 'rithy', 'rithy'].sort(),
    );

    for (const { team, player } of rivals) {
      expect(giftOf(player), player.id).toBeGreaterThan(LEVELS[chapterOf(team)].max);
    }
  });

  it('carry a gauge bigger than any stamina gives from chapter 2 on, to spend in a match', () => {
    const outfield = rivals.filter(
      ({ team, player }) => chapterOf(team) > 1 && player.role !== 'keeper',
    );

    expect(outfield.map(({ player }) => player.star).sort()).toEqual(
      ['haruto', 'lukas', 'minjun', 'rafael', 'rithy'].sort(),
    );

    for (const { player } of outfield) {
      expect(player.spiritMax, player.id).toBeGreaterThan(SPIRIT.max[1]);
    }
  });
});

describe("Sochetra's sides", () => {
  it('put him up front with the ten, for the campaign to fill in', () => {
    for (const team of heroTeams) {
      const place = team.players[HERO_SLOT[team.format]];

      expect(team.players.filter((player) => player.hero)).toHaveLength(1);
      expect(place).toMatchObject({ id: 'sochetra', star: 'sochetra', hero: true, number: 10 });
      expect(place).toMatchObject({ role: 'forward', stats: null, moves: [] });
      expect(place.name).toEqual({ en: 'Sochetra', km: 'សុចិត្រា' });
    }
  });

  it('keep Dara in goal, with Angkor Wall from chapter 2 on', () => {
    heroTeams.forEach((team, i) => {
      expect(team.players[0]).toMatchObject({ star: 'dara', role: 'keeper' });
      expect(team.players[0].moves).toEqual(i === 0 ? [] : ['angkor-wall']);
    });
  });

  it('play Rithy among the forwards for Cambodia, with Preah Khan Strike', () => {
    for (const team of heroTeams.slice(2)) {
      const rithy = team.players.find((player) => player.star === 'rithy');

      expect(rithy).toMatchObject({ role: 'forward', moves: ['preah-khan-strike'] });
    }
  });
});
