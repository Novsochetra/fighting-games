import { describe, expect, it } from 'vitest';
import { playHitSound } from '../../../src/sim/combat/hit-sound.js';

function gameWith(heroState) {
  const played = [];
  const game = {
    player: { state: heroState },
    combo: { count: 0 },
    io: { sfx: (key, big) => played.push({ key, big }) },
  };
  return { game, played };
}

const hero = { side: 'player', weapon: { id: 'fists' } };
const summon = { side: 'player', weapon: { id: 'sword' } };
const raider = { side: 'enemy', weapon: { id: 'knife' } };
const hitBy = (attacker) => ({ attacker, x: 100 });

describe('playHitSound', () => {
  it("plays the hero's weapon hit outside the ultimate", () => {
    const { game, played } = gameWith('attack');
    playHitSound(game, hitBy(hero), 4);
    playHitSound(game, hitBy(summon), 12);
    expect(played).toEqual([
      { key: 'blunt', big: false },
      { key: 'blade', big: true },
    ]);
  });

  it("bursts every blow on the hero's side during the ultimate, the summons' too", () => {
    const { game, played } = gameWith('ult');
    playHitSound(game, hitBy(hero), 4);
    playHitSound(game, hitBy(summon), 12);
    expect(played).toEqual([
      { key: 'ultHit', big: false },
      { key: 'ultHit', big: true },
    ]);
  });

  it("keeps a raider's own hit sound while the hero's ultimate runs", () => {
    const { game, played } = gameWith('ult');
    playHitSound(game, hitBy(raider), 4);
    expect(played).toEqual([{ key: 'blade', big: false }]);
  });
});
