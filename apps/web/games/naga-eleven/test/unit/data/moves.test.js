import { describe, expect, it } from 'vitest';
import { DUEL_STATS } from '../../../src/data/duels.js';
import { LOOK_STAND_INS } from '../../../src/data/look-stand-ins.js';
import { MOVE_IDS, MOVES, moveOf } from '../../../src/data/moves.js';
import { SKILL_PLAY } from '../../../src/data/skills.js';
import { LOOK_NAMES } from '../../../src/render/duel/looks/index.js';
import { KHMER, MOVE_OWNERS } from './story/readme-ids.js';

const moves = Object.values(MOVES);

const familyOf = (family) => moves.filter((move) => move.family === family);

describe('every move', () => {
  it('has an id of its own, the key it is kept under', () => {
    expect(new Set(MOVE_IDS).size).toBe(MOVE_IDS.length);
    expect(MOVE_IDS).toEqual(moves.map((move) => move.id));

    for (const id of MOVE_IDS) {
      expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(moveOf(id)).toBe(MOVES[id]);
    }
  });

  it('is named in English and in Khmer', () => {
    for (const move of moves) {
      expect(move.name.en, move.id).toMatch(/^[A-Z][A-Za-z -]+$/);
      expect(move.name.km, move.id).toMatch(KHMER);
    }
  });

  it('is a kind of duel option, and plays in the open as a skill can', () => {
    for (const move of moves) {
      expect(Object.keys(DUEL_STATS), move.id).toContain(move.kind);
      expect(Object.keys(SKILL_PLAY), move.id).toContain(move.play);
    }
  });

  it('has a sane power and cost: no move is free but a pass combo finisher', () => {
    for (const move of moves) {
      expect(Number.isInteger(move.power) && move.power >= 10 && move.power <= 48, move.id).toBe(
        true,
      );
      expect(Number.isInteger(move.cost) && move.cost <= 80, move.id).toBe(true);
      expect(move.cost === 0 || move.cost >= 20, move.id).toBe(true);
    }
  });

  it('is drawn with a look the duel has, borrowed while its own is not drawn yet', () => {
    for (const move of moves) {
      const planned = move.plannedLook;
      const drawnNow = LOOK_NAMES.includes(planned) ? planned : LOOK_STAND_INS[planned];

      expect(LOOK_NAMES, move.id).toContain(move.look);
      expect(move.look, move.id).toBe(drawnNow);
    }

    for (const [planned, borrowed] of Object.entries(LOOK_STAND_INS)) {
      expect(LOOK_NAMES, `${planned} is drawn now: delete its stand-in`).not.toContain(planned);
      expect(LOOK_NAMES, planned).toContain(borrowed);
    }
  });
});

describe('the families of moves', () => {
  it("keep the stars' moves as the README has them, first and in the story's order", () => {
    const stars = familyOf('star');

    expect(stars.map((move) => move.id)).toEqual(Object.keys(MOVE_OWNERS));
    expect(MOVE_IDS.slice(0, stars.length)).toEqual(Object.keys(MOVE_OWNERS));

    for (const move of stars) {
      expect(move.owner, move.id).toBe(MOVE_OWNERS[move.id]);
      expect(move.play, move.id).toBe(move.kind);
    }
  });

  it('give skills and combos to no one to carry, but a cast skill to its cast member', () => {
    for (const move of [...familyOf('role'), ...familyOf('combo')]) {
      expect(Object.hasOwn(MOVE_OWNERS, move.id), move.id).toBe(false);
    }

    expect(familyOf('combo').every((move) => move.owner === null)).toBe(true);
    expect(familyOf('role').filter((move) => move.owner !== null)).toHaveLength(1);
  });

  it('make every combo a shot, struck by two or after a run of play', () => {
    expect(familyOf('combo').every((move) => move.kind === 'shot')).toBe(true);
  });

  it('leave who strikes with whom to the duos, none on the move itself', () => {
    expect(moves.some((move) => 'partner' in move)).toBe(false);
  });
});
