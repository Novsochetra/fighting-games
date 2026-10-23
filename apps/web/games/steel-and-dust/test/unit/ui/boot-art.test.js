import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HEROES } from '../../../src/data/heroes.js';
import { UI_ART } from '../../../src/data/ui-art.js';
import { bootArt, heroCardArt } from '../../../src/ui/loading/boot-art.js';

const GAME = new URL('../../../', import.meta.url);

describe('the art loaded before the title', () => {
  it("takes every hero's card strips, standing and cheering, from the heroes table", () => {
    const art = heroCardArt();
    expect(art).toHaveLength(HEROES.length * 2);
    expect(art).toContain('assets/sprites/hero/card_idle.png');
    expect(art).toContain('assets/sprites/hero/card_win.png');
    expect(art).toContain('assets/sprites/heroes/bokator/card_pose.png');
    expect(art.some((file) => file.includes('arsenal/'))).toBe(false);
    expect(heroCardArt([{ cards: { side: 'x/a.png', middle: 'x/b.png' } }])).toEqual([
      'x/a.png',
      'x/b.png',
    ]);
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
