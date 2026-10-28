import { describe, expect, it } from 'vitest';
import { NEST, SWARM } from '../../../src/data/nests.js';
import { nestFrame, tremble } from '../../../src/render/scene/nests.js';
import { createNests, knockNestsIn, nestBox, updateNests } from '../../../src/sim/hazards/nests.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

const AWAY = 200;

function gameWithNest() {
  const { game, sounds } = createLootGame();
  const x = game.player.x + AWAY;
  game.nests = createNests([{ x, y: game.player.y }]);

  return { game, sounds, nest: game.nests[0] };
}

// a raider tumbling in the air with its feet this far over the road
function tumbling(game, x, height) {
  const raider = spawnEnemy(game, 'grunt', x);
  Object.assign(raider, { state: 'juggle', airborne: true, y: game.player.y - height, vy: -2 });

  return raider;
}

function untilBroken(game) {
  for (let i = 0; i < NEST.sway + 40; i++) {
    updateNests(game);
  }
}

describe('a hornet nest', () => {
  it('is knocked loose by a raider launched up through it', () => {
    const { game, sounds, nest } = gameWithNest();

    tumbling(game, nest.x + 4, NEST.hang - 10);
    updateNests(game);

    expect(nest.state).toBe('struck');
    expect(soundKeys(sounds)).toEqual(['break']);
  });

  it('hangs over a raider walking under it, and one knocked along the road below it', () => {
    const { game, nest } = gameWithNest();

    spawnEnemy(game, 'brute', nest.x);
    tumbling(game, nest.x - 4, 12);
    updateNests(game);

    expect(nest.state).toBe('hanging');
  });

  it('is knocked loose by a blow that reaches it, not by one struck on the road under it', () => {
    const { game, nest } = gameWithNest();
    const box = nestBox(nest);

    knockNestsIn(game, { x: nest.x - 20, y: nest.y - 36, width: 40, height: 36 });
    expect(nest.state).toBe('hanging');

    knockNestsIn(game, { x: box.x - 10, y: box.y + 4, width: 16, height: 12 });
    expect(nest.state).toBe('struck');
  });

  it('sways, falls and breaks open on the road, and lets the swarm out', () => {
    const { game, sounds, nest } = gameWithNest();

    knockNestsIn(game, nestBox(nest));
    for (let i = 0; i < NEST.sway; i++) {
      updateNests(game);
    }
    expect(nest.state).toBe('falling');

    untilBroken(game);
    expect(nest).toMatchObject({ state: 'broken', drop: NEST.hang });
    expect(nest.swarm.hornets).toHaveLength(SWARM.hornets);
    expect(soundKeys(sounds).slice(0, 3)).toEqual(['break', 'break', 'buzz']);
  });

  it('drops only once', () => {
    const { game, nest } = gameWithNest();

    knockNestsIn(game, nestBox(nest));
    untilBroken(game);
    const { swarm } = nest;
    knockNestsIn(game, { x: nest.x - 40, y: 0, width: 80, height: nest.y });
    tumbling(game, nest.x, NEST.hang - 10);
    untilBroken(game);

    expect(nest.state).toBe('broken');
    expect(nest.swarm).toBe(swarm);
  });

  it('hangs, trembles on its branch when struck, cracks as it falls and lies broken', () => {
    const shakes = [0, 1, 2, 3].map((time) => tremble({ state: 'struck', time }));

    expect(['hanging', 'struck', 'falling', 'broken'].map((state) => nestFrame({ state }))).toEqual(
      [0, 0, 1, 2],
    );
    expect(shakes).toEqual([-1, -1, 1, 1]);
    expect(tremble({ state: 'falling', time: 2 })).toBe(0);
  });
});
