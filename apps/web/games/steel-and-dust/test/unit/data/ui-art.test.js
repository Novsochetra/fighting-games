import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UI_ART } from '../../../src/data/ui-art.js';

const GAME = new URL('../../../', import.meta.url);
const STYLES = new URL('styles/', GAME);

// every image a stylesheet draws, as a path from the game page
function stylesheetImages() {
  return readdirSync(STYLES).flatMap((file) => {
    const css = readFileSync(new URL(file, STYLES), 'utf8');
    return [...css.matchAll(/url\('([^']+)'\)/g)].map((match) =>
      new URL(match[1], STYLES).href.slice(GAME.href.length),
    );
  });
}

describe('the menu art list', () => {
  // the title showed black and its stone buttons popped in, because the page did not know which
  // images its menus would draw and so could not wait for them
  it('holds every image the stylesheets draw, so the loading screen waits for all of it', () => {
    const drawn = [...new Set(stylesheetImages())].sort();
    expect(drawn.length).toBeGreaterThan(10);
    expect([...UI_ART].sort()).toEqual(drawn);
  });
});
