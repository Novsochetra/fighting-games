import { describe, expect, it } from 'vitest';
import { SKILL_RULES } from '../../../../src/data/skills.js';
import {
  canFire,
  fireSkill,
  openMoveOf,
  ownMovesOf,
  roleSkillOf,
} from '../../../../src/sim/skills/fire.js';
import { MOVES } from '../../../../src/data/moves.js';
import { matchInPlay } from '../../../support/match-driver.js';

describe('a skill', () => {
  it('is his own skill, then a star’s moves, found by what it plays', () => {
    const star = { skill: null, moves: ['naga-shot', 'hanuman-leap'] };
    const mid = { skill: 'apsara-curl', moves: [] };

    expect(ownMovesOf(star).map((move) => move.id)).toEqual(['naga-shot', 'hanuman-leap']);
    expect(openMoveOf(star, 'dribble').id).toBe('hanuman-leap');
    expect(roleSkillOf(star, ['shot'])).toBeNull();
    expect(roleSkillOf(mid, ['pass', 'cross']).id).toBe('apsara-curl');
  });

  it('fires only with the spirit, rested, on his feet, and with the story’s skills on', () => {
    const match = matchInPlay();
    const player = Object.assign(match.players[9], { spirit: 50 });
    const move = MOVES['kouprey-kick'];

    expect(canFire(match, player, move)).toBe(true);
    expect(canFire(match, { ...player, spirit: 10 }, move)).toBe(false);
    expect(canFire(match, { ...player, cooldown: 1 }, move)).toBe(false);
    expect(canFire(match, { ...player, stun: 3 }, move)).toBe(false);
    expect(canFire({ ...match, systems: { roleSkills: false } }, player, move)).toBe(false);
  });

  it('costs its spirit, makes him wait, tells the match, and starts a chain', () => {
    const match = matchInPlay();
    const player = Object.assign(match.players[6], { spirit: 50 });

    match.events.length = 0;
    fireSkill(match, player, MOVES['apsara-curl'], { receiver: 9 });

    expect(player.spirit).toBe(10);
    expect(player.cooldown).toBe(SKILL_RULES.cooldown);
    expect(match.events).toEqual([{ type: 'skill', player: 6, move: 'apsara-curl' }]);
    expect(player.chain).toEqual({ move: 'apsara-curl', tick: match.tick, receiver: 9 });
  });
});
