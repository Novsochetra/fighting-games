import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderFrame } from '../../../src/render/render-frame.js';
import { createLateView } from '../../support/late-images.js';
import { stampCalls } from '../../support/stamp-calls.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: an iPhone ran hot playing. Each frame drew the HUD's pixel font one fillRect per lit pixel
// (about 650 calls), its carved frames from about 110 nine-slice pieces, the title's sun glow one
// row at a time, and the whole game screen under the menus' opaque painting; a phone's canvas
// pays for every call, sixty times a second.
const source = (path) => readFileSync(join(import.meta.dirname, '../../..', path), 'utf8');
const count = (log, name) => log.filter((call) => call.startsWith(`${name}(`)).length;

function fightView() {
  const game = createPlayingGame();
  const late = createLateView();
  renderFrame(game, late.view);
  late.images.loadAll();
  runTicks(game, 120);
  renderFrame(game, late.view);
  late.log.length = 0;
  return { game, ...late };
}

describe('a frame on a phone', () => {
  it('draws a fight in well under the fillRects it took when the text was drawn pixel by pixel', () => {
    const { game, view, log } = fightView();
    renderFrame(game, view);
    // the same frame took 1723 before
    expect(count(log, 'fillRect')).toBeLessThan(900);
  });

  it('cuts the HUD text and frames once and only lays them down after', () => {
    const { game, view } = fightView();
    const cut = stampCalls(view).length;
    renderFrame(game, view);
    expect(stampCalls(view).length).toBe(cut);
  });

  it('does not draw the game screen while the opaque painting of the menus covers it', () => {
    const scene = source('styles/hero-scene.css');
    expect(scene).toMatch(/\.menu-scene \{[^}]*background: url\([^)]*\)[^;]*var\(--color-night\);/);
    expect(scene).toMatch(/#menus\[data-scene='on'\] \.menu-scene \{\s*opacity: 1;/);
    expect(source('src/main.js')).toMatch(
      /if \(!screenCovered\(\)\) \{\s*renderFrame\(game, view\);/,
    );
  });
});
