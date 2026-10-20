import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { choosePerch, perchSpot } from '../../../src/sim/brains/enemy/perch.js';
import { buildTerrain } from '../../support/terrain-game.js';

const KEEP_AWAY = [64, 125];
const LOG = { at: 200, width: 80, rise: 36, kind: 'log' };

const raider = (x) => ({ x, y: GROUND_Y });
const hero = (x, y = GROUND_Y) => ({ x, y });

describe('the spot a raider hops onto a platform from', () => {
  it('is just inside whichever end of it is nearer', () => {
    const platform = { x: 200, width: 80 };
    expect(perchSpot(platform, 150)).toBe(210);
    expect(perchSpot(platform, 230)).toBe(210);
    expect(perchSpot(platform, 250)).toBe(270);
    expect(perchSpot(platform, 400)).toBe(270);
  });
});

describe('the platform a ranged raider throws from', () => {
  it('is one in reach that keeps the hero at throwing distance below', () => {
    const terrain = buildTerrain({ platforms: [LOG] });
    expect(choosePerch(terrain, raider(150), hero(320), KEEP_AWAY)).toBe(terrain.platforms[0]);
  });

  it('is none when the hero would stand too close to it or too far from it', () => {
    const terrain = buildTerrain({ platforms: [LOG] });
    expect(choosePerch(terrain, raider(150), hero(260), KEEP_AWAY)).toBeNull();
    expect(choosePerch(terrain, raider(150), hero(400), KEEP_AWAY)).toBeNull();
  });

  it('is none when it is too far off or too high to hop onto', () => {
    expect(choosePerch(buildTerrain({ platforms: [LOG] }), raider(60), hero(320), KEEP_AWAY)).toBe(
      null,
    );
    const high = buildTerrain({ platforms: [{ ...LOG, rise: 60 }] });
    expect(choosePerch(high, raider(150), hero(320), KEEP_AWAY)).toBeNull();
  });

  it('is never reached by walking past the hero or into a face', () => {
    const terrain = buildTerrain({ platforms: [LOG] });
    expect(choosePerch(terrain, raider(125), hero(140), KEEP_AWAY)).toBeNull();
    const walled = buildTerrain({
      ground: [
        [170, 0],
        [170, 20],
        [180, 20],
        [180, 0],
      ],
      platforms: [LOG],
    });
    expect(choosePerch(walled, raider(150), hero(320), KEEP_AWAY)).toBeNull();
  });

  it('is never the one the hero stands on', () => {
    const wide = buildTerrain({ platforms: [{ ...LOG, width: 140 }] });
    const top = GROUND_Y - 36;
    expect(choosePerch(wide, raider(160), hero(310, top), KEEP_AWAY)).toBeNull();
    expect(choosePerch(wide, raider(160), hero(310), KEEP_AWAY)).toBe(wide.platforms[0]);
  });

  it('is the nearer of two that suit', () => {
    const terrain = buildTerrain({
      platforms: [
        { at: 150, width: 40, rise: 30, kind: 'planks' },
        { at: 200, width: 40, rise: 30, kind: 'planks' },
      ],
    });
    const chosen = choosePerch(terrain, raider(100), hero(330), [64, 200]);
    expect(chosen).toBe(terrain.platforms[0]);
  });
});
