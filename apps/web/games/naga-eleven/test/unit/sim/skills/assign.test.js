import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../../src/data/formats.js';
import { skillOf, skillPostOf, skillStyleOf } from '../../../../src/sim/skills/assign.js';
import { createMatch } from '../../../../src/sim/create-match.js';

const slots = (format) => FORMATS[format].formation;

describe('who has which skill', () => {
  it('sends a midfielder or forward out wide to the wing, nobody else', () => {
    expect(slots('7').map(skillPostOf)).toEqual([
      'keeper',
      'defender',
      'defender',
      'wing',
      'midfielder',
      'wing',
      'forward',
    ]);
    expect(slots('11').map(skillPostOf).slice(5)).toEqual([
      'midfielder',
      'midfielder',
      'midfielder',
      'wing',
      'forward',
      'wing',
    ]);
  });

  it('plays the world’s skills in a foreign kit and the Khmer ones in any other', () => {
    expect(skillStyleOf('japan')).toBe('world');
    expect(skillStyleOf('chrey-school')).toBe('khmer');
    expect(skillStyleOf(null)).toBe('khmer');
  });

  it('gives a star with moves none, a cast member his own, anyone else his post’s', () => {
    const [keeper, , , wing] = slots('7');

    expect(
      skillOf({ star: 'rithy', moves: ['power-shot'] }, { slot: wing, kit: 'royal-kids' }),
    ).toBe(null);
    expect(skillOf({ star: 'dara', moves: [] }, { slot: keeper, kit: 'chrey-school' })).toBe(
      'belly-block',
    );
    expect(skillOf({}, { slot: keeper, kit: 'brazil' })).toBe('panther-dive');
    expect(skillOf({}, { slot: wing, kit: 'cambodia' })).toBe('kite-cross');
  });

  it('puts each player’s skill on him as the match is made, none before the story has them', () => {
    const match = createMatch({ seed: 1 });
    const quiet = createMatch({ seed: 1, systems: { roleSkills: false } });

    expect(match.players[9].skill).toBe('kouprey-kick');
    expect(match.players[20].skill).toBe('thunder-shot');
    expect(match.players.every((player) => player.cooldown === 0 && player.chain === null)).toBe(
      true,
    );
    expect(quiet.players.every((player) => player.skill === null)).toBe(true);
  });
});
