import { describe, expect, it } from 'vitest';
import { KEG } from '../../../src/data/kegs.js';
import { blowKeg } from '../../../src/sim/hazards/keg-blast.js';
import { createKegs, lightKeg, lightKegsIn, updateKegs } from '../../../src/sim/hazards/kegs.js';
import { kegFrame } from '../../../src/render/scene/kegs.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

function gameWithKegs(...xs) {
  const { game, sounds } = createLootGame();
  game.kegs = createKegs(xs.map((x) => ({ x, y: game.player.y })));
  return { game, sounds, kegs: game.kegs };
}

function burnDown(game) {
  for (let i = 0; i < KEG.fuse; i++) {
    updateKegs(game);
  }
}

describe('a powder keg', () => {
  it('is lit by a blow that reaches it, with one fizz of its fuse', () => {
    const { game, sounds, kegs } = gameWithKegs(200);

    lightKegsIn(game, { x: 190, y: kegs[0].y - 20, width: 12, height: 12 });
    lightKegsIn(game, { x: 190, y: kegs[0].y - 20, width: 12, height: 12 });

    expect(kegs[0]).toMatchObject({ lit: true, fuse: KEG.fuse });
    expect(soundKeys(sounds)).toEqual(['sizzle']);
  });

  it('is not lit by a blow that falls short', () => {
    const { game, kegs } = gameWithKegs(200);

    lightKegsIn(game, { x: 150, y: kegs[0].y - 20, width: 12, height: 12 });

    expect(kegs[0].lit).toBe(false);
  });

  it('blows up once its fuse burns down, and is gone', () => {
    const { game, sounds, kegs } = gameWithKegs(200);

    lightKeg(game, kegs[0]);
    burnDown(game);

    expect(kegs[0]).toMatchObject({ gone: true, lit: false });
    expect(soundKeys(sounds)).toContain('boom');
    expect(game.summons.some((summon) => summon.sprite === 'blast')).toBe(true);
  });

  it('bursts from the foot of the keg where it is drawn, set down into the road grass', () => {
    const { game, kegs } = gameWithKegs(200);

    blowKeg(game, kegs[0]);

    const blast = game.summons.find((summon) => summon.sprite === 'blast');
    expect(blast.y).toBeGreaterThan(kegs[0].y);
    expect(blast).toMatchObject({ x: 200, y: kegs[0].y + KEG.setIn });
  });

  it('knocks out the raiders in its reach and leaves the rest alone', () => {
    const { game, kegs } = gameWithKegs(200);
    const near = spawnEnemy(game, 'grunt', 220);
    const far = spawnEnemy(game, 'grunt', 200 + KEG.reach + 40);

    blowKeg(game, kegs[0]);

    expect(near.state).toBe('ko');
    expect(far.hp).toBe(far.def.hp);
  });

  it('throws what it hits away from it', () => {
    const { game, kegs } = gameWithKegs(200);
    const left = spawnEnemy(game, 'grunt', 185);
    const right = spawnEnemy(game, 'grunt', 215);

    blowKeg(game, kegs[0]);

    expect(left.vx).toBeLessThan(0);
    expect(right.vx).toBeGreaterThan(0);
  });

  it('hurts the hero too, when he stands too close', () => {
    const { game } = createLootGame();
    const [keg] = createKegs([{ x: game.player.x + 20, y: game.player.y }]);
    const before = game.player.hp;

    blowKeg(game, keg);

    expect(game.player.hp).toBeLessThan(before);
    expect(game.player.hp).toBeGreaterThan(0);
  });

  it('is lit by a raider knocked flying into it, not by one walking past', () => {
    const { game, kegs } = gameWithKegs(200, 400);
    const thrown = spawnEnemy(game, 'grunt', 200);
    const walker = spawnEnemy(game, 'grunt', 400);
    Object.assign(thrown, { state: 'juggle', airborne: true, vx: 3 });
    Object.assign(walker, { state: 'walk', vx: 1.2 });

    updateKegs(game);

    expect(kegs[0].lit).toBe(true);
    expect(kegs[1].lit).toBe(false);
  });

  it('sets off a keg next to it, on a short fuse', () => {
    const { game, kegs } = gameWithKegs(200, 230, 400);

    lightKeg(game, kegs[0]);
    burnDown(game);

    expect(kegs[1]).toMatchObject({ lit: true });
    expect(kegs[1].fuse).toBeLessThanOrEqual(KEG.chainFuse);
    expect(kegs[2].lit).toBe(false);
  });

  it('shows unlit, then burning, then flashing as it is about to blow', () => {
    const keg = { lit: false, fuse: 0 };

    expect(kegFrame(keg, 0)).toBe(0);
    expect(kegFrame({ lit: true, fuse: KEG.fuse }, 3)).toBe(1);
    const flashing = [0, 3, 6, 9].map((tick) => kegFrame({ lit: true, fuse: 4 }, tick));
    expect(flashing).toEqual([1, 2, 1, 2]);
  });
});
