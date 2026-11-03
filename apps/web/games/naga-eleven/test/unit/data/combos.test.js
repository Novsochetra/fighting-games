import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../../../src/data/characters.js';
import {
  CHAIN_RULES,
  DUO_COMBOS,
  NAMED_CHAINS,
  PASS_COMBO,
  SYSTEMS_FROM,
} from '../../../src/data/combos.js';
import { FORMATS } from '../../../src/data/formats.js';
import { MOVES } from '../../../src/data/moves.js';
import { ROLE_SKILLS, SKILL_POSTS } from '../../../src/data/skills.js';
import { CHAPTERS } from '../../../src/data/story/index.js';
import { TEAMS } from '../../../src/data/teams/index.js';

const matchIds = CHAPTERS.flatMap((chapter) =>
  chapter.stages.filter((stage) => stage.kind === 'match').map((stage) => stage.id),
);

const comboMoves = Object.values(MOVES).filter((move) => move.family === 'combo');

const finisherIds = Object.values(PASS_COMBO.finishers).flatMap(Object.values);

const climbs = (values) => values.every((value, i) => i === 0 || value >= values[i - 1]);

const heroTeams = CHAPTERS.map((chapter) => TEAMS[chapter.team]);

const playsFor = (star, teams) =>
  teams.some((team) => team.players.some((player) => player.star === star));

describe('the pass combo', () => {
  const levels = PASS_COMBO.most + 1;

  it('reads every reward by the level, nothing below the first level the counter shows', () => {
    for (const rewards of [PASS_COMBO.stepSpirit, PASS_COMBO.shotPower, PASS_COMBO.shotSpeed]) {
      expect(rewards).toHaveLength(levels);
      expect(rewards.slice(0, PASS_COMBO.showFrom).every((value) => value === 0)).toBe(true);
      expect(rewards[PASS_COMBO.showFrom]).toBeGreaterThan(0);
      expect(climbs(rewards)).toBe(true);
    }
  });

  // the hold waits while a kick is charged, so it need only leave time to take the ball and look
  it('times a step in every format, and lets a one-two count more than a pass', () => {
    expect(Object.keys(PASS_COMBO.holdTicks).sort()).toEqual(Object.keys(FORMATS).sort());
    expect(Object.values(PASS_COMBO.holdTicks).every((ticks) => ticks >= 40)).toBe(true);
    expect(PASS_COMBO.oneTwo).toBeGreaterThan(1);
    expect(PASS_COMBO.finisherFrom).toBeGreaterThan(PASS_COMBO.showFrom);
  });

  it('finishes in each style with free shots, stronger from a longer run', () => {
    expect(Object.keys(PASS_COMBO.finishers)).toEqual(Object.keys(ROLE_SKILLS));

    for (const tiers of Object.values(PASS_COMBO.finishers)) {
      const entries = Object.entries(tiers).map(([level, id]) => [Number(level), MOVES[id]]);

      expect(entries.map(([level]) => level)).toEqual([PASS_COMBO.finisherFrom, PASS_COMBO.most]);
      expect(entries.every(([, move]) => move.family === 'combo' && move.cost === 0)).toBe(true);
      expect(entries[1][1].power).toBeGreaterThan(entries[0][1].power);
    }
  });
});

describe('the duo combos', () => {
  it('strike a shot two players pay for between them', () => {
    for (const duo of DUO_COMBOS) {
      const move = MOVES[duo.move];

      expect(move?.kind, duo.move).toBe('shot');
      expect(duo.shares.striker + duo.shares.partner, duo.move).toBe(move.cost);
      expect(Math.min(duo.shares.striker, duo.shares.partner)).toBeGreaterThanOrEqual(20);
      expect(['strike', 'pass']).toContain(duo.entry);
      expect(duo.reach > 0 && duo.reach <= 0.5, duo.move).toBe(true);
    }
  });

  it('pair a cast member with another or with a mate on a post', () => {
    for (const { move, striker, partner } of DUO_COMBOS) {
      expect(CHARACTERS[striker], move).toBeDefined();
      expect(Object.keys(partner)).toHaveLength(1);

      if (partner.star) {
        expect(CHARACTERS[partner.star], move).toBeDefined();
        expect(partner.star).not.toBe(striker);
      } else {
        expect(SKILL_POSTS, move).toContain(partner.post);
      }
    }
  });

  it("wake Sochetra's with a move he knows or a story match, and give the rivals theirs", () => {
    for (const duo of DUO_COMBOS) {
      const isHero = duo.striker === 'sochetra';
      const gates = [duo.needs, duo.from].filter(Boolean);

      expect(gates, duo.move).toHaveLength(isHero ? 1 : 0);
      expect(playsFor(duo.striker, isHero ? heroTeams : Object.values(TEAMS))).toBe(true);

      if (duo.needs) {
        expect(MOVES[duo.needs].owner, duo.move).toBe('sochetra');
      }

      if (duo.from) {
        expect(matchIds, duo.move).toContain(duo.from);
      }

      if (isHero && duo.partner.star) {
        expect(playsFor(duo.partner.star, heroTeams), duo.move).toBe(true);
      }
    }
  });

  it('keep the rivals to the two who beat Sochetra the first time', () => {
    const rivals = DUO_COMBOS.filter((duo) => duo.striker !== 'sochetra');

    expect(rivals.map((duo) => duo.striker)).toEqual(['haruto', 'rafael']);
  });
});

describe('the skill chains', () => {
  it('lead a skill that starts a chain into a shot of the same star', () => {
    for (const { from, to, move } of NAMED_CHAINS) {
      expect(CHAIN_RULES.starts, from).toContain(MOVES[from].play);
      expect(MOVES[to].kind, to).toBe('shot');
      expect(MOVES[from].owner).toBe(MOVES[to].owner);
      expect(MOVES[from].owner).not.toBeNull();
      expect(MOVES[move]).toMatchObject({ family: 'combo', kind: 'shot' });
    }
  });

  it("make a named chain the shot's power with the chain's, at the shot's cost", () => {
    for (const { to, move } of NAMED_CHAINS) {
      expect(MOVES[move].power, move).toBe(MOVES[to].power + CHAIN_RULES.power);
      expect(MOVES[move].cost, move).toBe(MOVES[to].cost);
    }
  });
});

describe('the combos together', () => {
  it('use every combo move once: a finisher, a duo or a chain', () => {
    const used = [
      ...finisherIds,
      ...DUO_COMBOS.map((duo) => duo.move).filter((id) => MOVES[id].family === 'combo'),
      ...NAMED_CHAINS.map((chain) => chain.move),
    ];

    expect(new Set(used).size).toBe(used.length);
    expect([...used].sort()).toEqual(comboMoves.map((move) => move.id).sort());
  });

  it('start in story matches, in the order the story teaches them', () => {
    const order = [SYSTEMS_FROM.passCombo, SYSTEMS_FROM.roleSkills, SYSTEMS_FROM.chains];
    const places = order.map((id) => matchIds.indexOf(id));

    expect(places.every((place) => place >= 0)).toBe(true);
    expect(places).toEqual([...places].sort((first, second) => first - second));
    expect(SYSTEMS_FROM.passCombo).toBe(matchIds[0]);
  });
});
