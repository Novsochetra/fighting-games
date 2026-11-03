import { describe, expect, it } from 'vitest';
import { KICK } from '../../../src/data/tuning.js';
import { canAffordShotMove, canSpecial } from '../../../src/sim/specials.js';
import { matchInPlay } from '../../support/match-driver.js';

// in range of the goal he attacks, with the ball
function star(match, fields) {
  const player = Object.assign(
    match.players[9],
    { star: 'sochetra', moves: ['naga-shot'], spirit: 100, charge: KICK.chargeTicks },
    { x: match.pitch.length - 300, y: match.pitch.width / 2 },
    fields,
  );

  Object.assign(match.ball, { owner: player.index, x: player.x + 12, y: player.y });

  return player;
}

describe('a special', () => {
  it('needs a star with the spirit for one of their shot moves', () => {
    const match = matchInPlay();

    expect(canAffordShotMove(star(match, {}))).toBe(true);
    expect(canAffordShotMove(star(match, { spirit: 1 }))).toBe(false);
    expect(canAffordShotMove(star(match, { star: null }))).toBe(false);
    expect(canAffordShotMove(star(match, { moves: ['hanuman-leap'] }))).toBe(false);
  });

  it('is let go only from a full charge in range, with the duels attached', () => {
    const match = matchInPlay();

    expect(canSpecial(match, star(match, {}))).toBe(false);

    match.hooks = { special: () => true };

    expect(canSpecial(match, star(match, {}))).toBe(true);
    expect(canSpecial(match, star(match, { charge: 10 }))).toBe(false);
    expect(canSpecial(match, star(match, { x: 300 }))).toBe(false);
  });

  it('is not let go for a role shot skill alone, which plays on', () => {
    const match = matchInPlay();

    match.hooks = { special: () => true };

    expect(canSpecial(match, star(match, { star: null, moves: [], skill: 'kouprey-kick' }))).toBe(
      false,
    );
  });
});
