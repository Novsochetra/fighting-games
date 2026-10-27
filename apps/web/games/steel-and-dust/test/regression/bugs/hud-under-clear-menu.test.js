import { describe, expect, it } from 'vitest';
import { LOOT_TIME } from '../../../src/data/loot.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { CLEAR_TICKS } from '../../../src/sim/stage/stage-clear.js';
import { FakeImage } from '../../support/fake-image.js';
import { spawnEnemy } from '../../support/loot-game.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

// Bug: once the last boss fell, the HUD, the ALL CLEAR card and the loot summary stayed painted on
// the road under the All missions clear menu, over its stats and buttons, and would have run
// through the credits rolling over it.

// the last boss felled, then on through its slow fall, the loot time and the clear until `reached`
function afterLastBoss(reached) {
  const game = createTestGame();
  selectMission(game, 11);
  startPlay(game);
  game.fighters = [game.player];
  const boss = spawnEnemy(game, 'guardian', game.player.x + 90);
  game.boss = boss;
  knockOut(game, boss, 1);
  for (let i = 0; i < 60 + LOOT_TIME.limit + CLEAR_TICKS && !reached(game); i++) {
    runTicks(game, 1);
  }
  return game;
}

function stampedTexts(game) {
  const createCanvas = (width, height) => Object.assign(new RecordingCanvas(), { width, height });
  const view = createView({
    context: createCanvas(768, 432).getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  // the first frame asks for the road and the sprites, which the fake images hand over at once
  renderFrame(game, view);
  view.painter.stamps.cache.clear();
  renderFrame(game, view);
  return [...view.painter.stamps.cache.keys()].filter((key) => key.startsWith('text|'));
}

describe('the road under the clear menu', () => {
  it('still sums up the loot over the road while the clear plays', () => {
    const game = afterLastBoss((run) => run.clearTime === CLEAR_TICKS - 20);
    expect(game.mode).toBe('play');
    expect(stampedTexts(game)).toEqual(expect.arrayContaining([expect.stringMatching(/\|LOOT$/)]));
  });

  it('draws the HUD, the card and the loot summary no more once the run is over', () => {
    const game = afterLastBoss((run) => run.mode === 'clear');
    expect(game.mode).toBe('clear');
    expect(stampedTexts(game)).toEqual([]);
  });
});
