import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { UI_ART } from '../../../src/data/ui-art.js';
import { bootArt, heroCardArt } from '../../../src/ui/loading/boot-art.js';

const GAME = new URL('../../../', import.meta.url);

describe('the art loaded before the title', () => {
  it("takes every hero's standing and cheering strips from the heroes table", () => {
    const art = heroCardArt();
    expect(art).toHaveLength(HEROES.length * 2);
    expect(art).toContain('assets/sprites/hero/arsenal/hero_idle.png');
    expect(art).toContain('assets/sprites/heroes/bokator/arsenal/hero_win.png');
    expect(heroCardArt([{ directory: 'x/' }])).toEqual(['x/hero_idle.png', 'x/hero_win.png']);
  });

  it('is the menu art and the hero cards, each file once and every one of them there', () => {
    const art = bootArt();
    expect(art).toEqual([...UI_ART, ...heroCardArt()]);
    expect(new Set(art).size).toBe(art.length);
    for (const file of art) {
      expect(existsSync(new URL(file, GAME)), file).toBe(true);
    }
  });
});
