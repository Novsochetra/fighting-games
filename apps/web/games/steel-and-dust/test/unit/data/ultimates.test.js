import { describe, expect, it } from 'vitest';
import { FX_SPRITES, fxLength } from '../../../src/data/fx-sprites.js';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { ULTIMATES, ultimateOf } from '../../../src/data/ultimates/index.js';
import { pngSize } from '../../support/png-size.js';

const GAME_ROOT = new URL('../../../', import.meta.url).pathname;
const ultimateMoves = (ult) =>
  Object.values(ult).filter((value) => value && typeof value === 'object' && 'damage' in value);

describe('the ultimates', () => {
  it('gives every Shade an ultimate of its own', () => {
    expect(Object.keys(ULTIMATES)).toEqual(HEROES.map((hero) => hero.id));
    const names = Object.values(ULTIMATES).map((ult) => ult.name);
    expect(names).toEqual([
      'Thornwood Requiem',
      'Swarm Nova',
      'Spirit Stampede',
      'Absolute Zero',
      'Phoenix Pyre',
      'Pounding the Lion',
      'March of the Bayon',
    ]);
    expect(ultimateOf('nobody')).toBe(ULTIMATES.moss);
  });

  it('plays the cut-in first and ends after it', () => {
    for (const ult of Object.values(ULTIMATES)) {
      expect(ult.intro, ult.name).toBeGreaterThan(30);
      expect(ult.end, ult.name).toBeGreaterThan(ult.intro + 60);
    }
  });

  it('hits only with ultimate moves, which nothing can block or dodge', () => {
    for (const ult of Object.values(ULTIMATES)) {
      const moves = ultimateMoves(ult);
      expect(moves.length, ult.name).toBeGreaterThanOrEqual(2);
      for (const move of moves) {
        expect(move.ultimate, ult.name).toBe(true);
      }
    }
  });

  it("has an ultimate strip for every hero, the hero frames' width and at least their height", () => {
    for (const hero of HEROES) {
      const { width, height } = pngSize(GAME_ROOT + hero.ultStrip);
      expect(width, hero.id).toBe(HERO_SPRITES.frameWidth * HERO_SPRITES.frames.ult);
      expect(height, hero.id).toBeGreaterThanOrEqual(HERO_SPRITES.frameHeight);
    }
    // only the two Khmer fighters' raised swords need the room
    const taller = HEROES.filter(
      (hero) => pngSize(GAME_ROOT + hero.ultStrip).height > HERO_SPRITES.frameHeight,
    );
    expect(taller.map((hero) => hero.id)).toEqual(['bokator', 'angkor']);
  });

  it('has an effect strip for every effect, as long as its frames say', () => {
    for (const [name, sprite] of Object.entries(FX_SPRITES)) {
      const { width, height } = pngSize(`${GAME_ROOT}assets/sprites/fx/${name}.png`);
      expect(width, name).toBe(sprite.frameWidth * sprite.frames);
      expect(height, name).toBe(sprite.frameHeight);
      expect(fxLength(name), name).toBe(sprite.frames * sprite.ticks);
    }
  });
});
