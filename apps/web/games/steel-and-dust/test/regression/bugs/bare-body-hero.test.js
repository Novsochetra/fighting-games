import { describe, expect, it } from 'vitest';
import { renderFrame } from '../../../src/render/render-frame.js';
import { continueAs, startPlay } from '../../../src/sim/stage/flow.js';
import { createLateView } from '../../support/late-images.js';
import { createPlayingGame, createTestGame } from '../../support/test-game.js';

// Bug: coming back as another Shade after a fall, or starting a run as a Shade picked on the
// title, showed the hero as the bare jointed body the game drew before it had sprites, not one of
// the four Shades. A Shade's strips only started loading the first time it was drawn, and until
// they were in the renderer fell back to that body.
const drawsAnything = (log) => log.some((call) => call.startsWith('drawImage('));
const drawsHeroStrip = (log) => log.some((call) => call.startsWith('drawImage(img(hero_'));

// the hero blinks while invincible; it is held solid so every frame has to show it
function frameOf(game, { view, log }) {
  game.player.invincible = 0;
  log.length = 0;
  renderFrame(game, view);
  return log.slice();
}

function fallen() {
  const late = createLateView();
  const game = createPlayingGame();
  renderFrame(game, late.view);
  late.images.loadAll();
  frameOf(game, late);
  Object.assign(game, { mode: 'over' });
  game.player.hp = 0;
  return { game, late };
}

describe('a newly picked Shade', () => {
  it('is drawn from its own strips on its first frame back after a fall', () => {
    const { game, late } = fallen();
    continueAs(game, 'blue');
    expect(drawsHeroStrip(frameOf(game, late))).toBe(true);
  });

  it('is drawn from its own strips on the first frame of a run started from the title', () => {
    const late = createLateView();
    const game = createTestGame();
    renderFrame(game, late.view);
    late.images.loadAll();
    frameOf(game, late);
    game.settings.hero = 'antler';
    startPlay(game);
    expect(drawsHeroStrip(frameOf(game, late))).toBe(true);
  });

  it('keeps the loading screen up instead of the bare body while its strips are on their way', () => {
    const late = createLateView();
    const game = createTestGame({ settings: { hero: 'firefly' } });
    renderFrame(game, late.view);
    late.images.loadWhere((src) => !src.includes('heroes/firefly/'));
    expect(drawsAnything(frameOf(game, late))).toBe(false);
    late.images.loadAll();
    expect(drawsHeroStrip(frameOf(game, late))).toBe(true);
  });
});
