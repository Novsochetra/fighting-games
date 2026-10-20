import { describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../src/art/painted-themes/index.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';

const COLOR = /^(#[0-9a-f]{6}|rgba\(\d+,\d+,\d+,[\d.]+\))$/;

describe('scene palettes', () => {
  it('give each painted road its soil, any grass, the clumps in front and the colors of its air', () => {
    for (const themeId of Object.keys(PAINTED_THEMES)) {
      const palette = scenePalette(themeId);
      const { ground, rubble } = palette;
      const grass = PAINTED_THEMES[themeId].ground.grass ? [ground.grass] : [];
      for (const color of [ground.sand, ground.soil, ground.soilDeep, ...grass, rubble.fern]) {
        expect(color, themeId).toMatch(COLOR);
      }
      expect(ground.grass, themeId).toBe(PAINTED_THEMES[themeId].ground.grass);
      expect(palette.ambient, themeId).toBe(PAINTED_THEMES[themeId].ambient);
    }
  });

  it('leave the swaying blades off the sand of the canyon road and dress it in scrub', () => {
    const { ground, rubble } = scenePalette('sandstormPass');
    expect(ground.grass).toBeUndefined();
    expect(rubble.kind).toBe('scrub');
    expect(rubble.bone).toBe(PAINTED_THEMES.sandstormPass.front.bone);
  });

  it('are worked out once per theme', () => {
    expect(scenePalette('ironWorks')).toBe(scenePalette('ironWorks'));
  });
});
