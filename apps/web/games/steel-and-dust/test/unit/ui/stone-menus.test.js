import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const STYLES = new URL('../../../styles/', import.meta.url);
const css = readFileSync(new URL('stone-menus.css', STYLES), 'utf8');

describe('the carved stone menus', () => {
  it('draws only images that are there', () => {
    const images = [...css.matchAll(/url\('([^']+)'\)/g)].map((match) => new URL(match[1], STYLES));
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(existsSync(image), image.pathname).toBe(true);
    }
  });

  // the logo's pixels come out even only at whole multiples of the size its tool drew it at
  it("draws the logo at whole multiples of the art's own size", () => {
    const png = readFileSync(new URL('../assets/ui/logo/logo.png', STYLES));
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);

    expect(css).toContain(`calc(var(--stone, 2) * ${width}px)`);
    expect(css).toContain(`aspect-ratio: ${width} / ${height};`);
  });

  // the stone buttons are grids, which beat the page's own hiding, so the pause menu showed the
  // training Weapon button and the defeat menu showed Start from mission 1 with lives still left
  it('keeps a menu button hidden while the menu hides it', () => {
    expect(css).toMatch(/\.mlist \.mbtn \{[^}]*display: grid;/);
    expect(css).toMatch(/\.mlist \.mbtn\[hidden\] \{\s*display: none;\s*\}/);
  });
});
