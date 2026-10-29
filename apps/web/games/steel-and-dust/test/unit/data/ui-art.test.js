import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SKIN_ART, UI_ART } from '../../../src/data/ui-art.js';

const GAME = new URL('../../../', import.meta.url);
const STYLES = new URL('styles/', GAME);

// every image a stylesheet draws, as a path from the game page; the pixel font's files are waited
// for on their own (src/ui/loading/fonts.js)
function stylesheetImages() {
  return readdirSync(STYLES).flatMap((file) => {
    const css = readFileSync(new URL(file, STYLES), 'utf8');
    return [...css.matchAll(/url\('([^']+\.(?:png|jpe?g|webp|gif|svg))'\)/g)].map((match) =>
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
    expect([...UI_ART, ...SKIN_ART].sort()).toEqual(drawn);
  });

  it("keeps the skins' own art apart, each file there, each skin's both ways up", () => {
    const folders = Map.groupBy(SKIN_ART, (file) => file.split('/')[2]);

    expect([...folders.keys()]).toEqual(['clear', 'sandstone', 'retro']);
    expect(SKIN_ART.filter((file) => UI_ART.includes(file))).toEqual([]);
    for (const [folder, files] of folders) {
      expect(files.filter((file) => file.includes('landscape')).length, folder).toBeGreaterThan(1);
      expect(files.filter((file) => file.includes('portrait')).length, folder).toBeGreaterThan(1);
    }
    for (const file of SKIN_ART) {
      expect(existsSync(new URL(file, GAME)), file).toBe(true);
    }
  });
});
