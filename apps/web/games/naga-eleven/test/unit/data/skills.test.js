import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../../../src/data/characters.js';
import { FORMATS } from '../../../src/data/formats.js';
import { MOVES } from '../../../src/data/moves.js';
import {
  CAST_SKILLS,
  ROLE_SKILLS,
  SAVE_STYLES,
  SKILL_AI,
  SKILL_PLAY,
  SKILL_POSTS,
  SKILL_RULES,
  WORLD_KITS,
} from '../../../src/data/skills.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { TEAM_KITS } from './story/readme-ids.js';

// what each post's skill plays in the open
const POST_PLAYS = {
  keeper: 'save',
  defender: 'block',
  midfielder: 'pass',
  wing: 'cross',
  forward: 'shot',
};

const STYLES = Object.keys(ROLE_SKILLS);

// the keeper's options in a duel: Catch and Punch, and a wall a skill may stand
const SAVE_KINDS = ['catch', 'punch', 'wall'];

const isOutfieldAttacker = (role) => role === 'midfielder' || role === 'forward';

const postOf = (slot) =>
  isOutfieldAttacker(slot.role) && Math.abs(slot.across - 0.5) >= SKILL_RULES.wingFromMiddle
    ? 'wing'
    : slot.role;

const isCambodian = (team) => TEAM_KITS[team.id][0] <= 2 || team.kit === 'cambodia';

describe('the role skills', () => {
  it('give every post a skill in every style, a role skill playing what the post plays', () => {
    expect(STYLES).toEqual(['khmer', 'world']);

    for (const style of STYLES) {
      expect(Object.keys(ROLE_SKILLS[style])).toEqual(SKILL_POSTS);

      for (const post of SKILL_POSTS) {
        const move = MOVES[ROLE_SKILLS[style][post]];

        expect(move, `${style} ${post}`).toBeDefined();
        expect(move).toMatchObject({ family: 'role', owner: null, play: POST_PLAYS[post] });
      }
    }
  });

  it('match post by post between the styles, so neither side is stronger for its names', () => {
    for (const post of SKILL_POSTS) {
      const [khmer, world] = STYLES.map((style) => MOVES[ROLE_SKILLS[style][post]]);
      const numbers = ({ kind, play, power, cost }) => ({ kind, play, power, cost });

      expect(numbers(world), post).toEqual(numbers(khmer));
      expect(world.id).not.toBe(khmer.id);
    }
  });

  it('use every role skill there is', () => {
    const given = STYLES.flatMap((style) => Object.values(ROLE_SKILLS[style]));
    const cast = Object.values(CAST_SKILLS);
    const roles = Object.values(MOVES).filter((move) => move.family === 'role');

    expect([...given, ...cast].sort()).toEqual(roles.map((move) => move.id).sort());
  });

  it('meet every post in both formats', () => {
    for (const format of Object.values(FORMATS)) {
      const posts = new Set(format.formation.map(postOf));

      expect([...posts].sort(), format.id).toEqual([...SKILL_POSTS].sort());
    }
  });
});

describe('the side styles', () => {
  it('play Khmer skills for Cambodian sides and the world style for the rest', () => {
    for (const team of Object.values(TEAMS)) {
      expect(WORLD_KITS.includes(team.kit), team.id).toBe(!isCambodian(team));
    }
  });

  it('name only kits a side wears', () => {
    const kits = new Set(Object.values(TEAMS).map((team) => team.kit));

    expect(WORLD_KITS.every((kit) => kits.has(kit))).toBe(true);
  });
});

describe('the cast skills', () => {
  it('belong to cast members who play some chapter with no move of their own', () => {
    const players = Object.values(TEAMS).flatMap((team) => team.players);

    for (const [character, id] of Object.entries(CAST_SKILLS)) {
      expect(CHARACTERS[character], character).toBeDefined();
      expect(MOVES[id]).toMatchObject({ family: 'role', owner: character });
      expect(players.some((player) => player.star === character && player.moves.length === 0)).toBe(
        true,
      );
    }
  });

  it('give Dara a save of his own in goal for Chrey', () => {
    expect(MOVES[CAST_SKILLS.dara]).toMatchObject({ kind: 'save', play: 'save' });
    expect(TEAMS['chrey-school'].players[0]).toMatchObject({ star: 'dara', moves: [] });
  });
});

describe('the keepers’ saves', () => {
  const saves = Object.values(MOVES).filter((move) => move.kind === 'save');

  it('give every save a way to keep the ball out that the save cam can show', () => {
    expect(Object.keys(SAVE_STYLES).sort()).toEqual(saves.map((move) => move.id).sort());
    expect(Object.values(SAVE_STYLES).every((style) => SAVE_KINDS.includes(style))).toBe(true);
  });

  it('let both styles’ keepers catch, and the cast keep a style of their own', () => {
    for (const style of STYLES) {
      expect(SAVE_STYLES[ROLE_SKILLS[style].keeper], style).toBe('catch');
    }

    expect(new Set(Object.values(SAVE_STYLES))).toEqual(new Set(SAVE_KINDS));
  });

  it('give every keeper who plays a save of his own or of his side', () => {
    const keepers = Object.values(TEAMS).map((team) => team.players[0]);

    for (const keeper of keepers) {
      const own = keeper.moves.filter((id) => MOVES[id].kind === 'save');
      const given = keeper.star ? (CAST_SKILLS[keeper.star] ?? null) : 'role';

      expect(own.length > 0 || given !== null, keeper.id).toBe(true);
    }
  });
});

describe('the skill rules', () => {
  it('say what every play does in the open', () => {
    const plays = new Set(Object.values(MOVES).map((move) => move.play));

    for (const play of plays) {
      expect(SKILL_PLAY[play], play).toBeDefined();
    }
  });

  it('keep every computer chance a share, and every rule a positive number', () => {
    const { answer, ...chances } = SKILL_AI;

    expect(Object.values(chances).every((chance) => chance > 0 && chance <= 1)).toBe(true);
    expect(answer).toBeGreaterThan(6);
    expect(Object.values(SKILL_RULES).every((value) => value > 0)).toBe(true);
    expect(SKILL_RULES.wingFromMiddle).toBeLessThan(0.5);
  });
});
