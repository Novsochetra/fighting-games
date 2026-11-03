import { describe, expect, it } from 'vitest';
import { moveOf } from '../../../src/data/moves.js';
import { moveOption } from '../../../src/sim/combos/offers.js';
import { attackChance } from '../../../src/sim/duel/odds.js';

// "All our main hero's powerful shots are saved so easily." Any keeper's post skill (Bayon Eyes,
// Panther Dive) carried more power than Sochetra's Naga Shot, so a school keeper who answered with
// it stopped his special more often than not. The stats are the story's own for each match
const RANGE = 0.15;

function chanceOf({ shot, keeping }, attackMove, defendMove) {
  return attackChance({
    attacker: { stats: { shot } },
    defender: { stats: { keeping } },
    attack: moveOption(moveOf(attackMove)),
    defend: moveOption(moveOf(defendMove)),
    distanceShare: RANGE,
  });
}

describe('the hero’s special against a keeper’s skill', () => {
  it('beats a post’s save skill more often than not', () => {
    expect(chanceOf({ shot: 58, keeping: 48 }, 'power-shot', 'bayon-eyes')).toBeGreaterThan(0.6);
    expect(chanceOf({ shot: 71, keeping: 64 }, 'naga-shot', 'bayon-eyes')).toBeGreaterThan(0.6);
    expect(chanceOf({ shot: 92, keeping: 89 }, 'garuda-volley', 'panther-dive')).toBeGreaterThan(
      0.6,
    );
  });

  it('is still a fight against a star keeper’s own save', () => {
    expect(chanceOf({ shot: 80, keeping: 82 }, 'garuda-volley', 'mountain-guard')).toBeLessThan(
      0.5,
    );
  });
});
