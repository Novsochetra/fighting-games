import { describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../src/art/painted-themes/index.js';
import { SCENE_THEMES } from '../../../src/art/scene-themes.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';

const COLOR = /^(#[0-9a-f]{6}|rgba\(\d+,\d+,\d+,[\d.]+\))$/;

function allColors(palette) {
  return [palette.sky, palette.hills, palette.skyline, palette.ground, palette.rubble].flatMap(
    (group) => Object.values(group).flat(),
  );
}

describe('scene palettes', () => {
  it('work out ten sky bands and every scenery shade for each theme', () => {
    for (const themeId of Object.keys(SCENE_THEMES)) {
      const palette = scenePalette(themeId);
      expect(palette.sky.bands, themeId).toHaveLength(10);
      for (const color of allColors(palette)) {
        expect(color, themeId).toMatch(COLOR);
      }
    }
  });

  it('keep the hand-picked dusk sky of the first mission exactly', () => {
    expect(scenePalette('dusk').sky.bands).toEqual(SCENE_THEMES.dusk.sky);
  });

  it('carry the skyline kind and the sun or moon of the theme', () => {
    expect(scenePalette('furnace')).toMatchObject({ skylineKind: 'factory', celestial: 'moon' });
    expect(scenePalette('noon')).toMatchObject({ skylineKind: 'dunes', celestial: 'sun' });
  });

  it('give each painted road its soil, any grass, the clumps in front and the colors of its air', () => {
    for (const themeId of Object.keys(PAINTED_THEMES)) {
      const palette = scenePalette(themeId);
      expect(palette.painted, themeId).toBe(true);
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
    expect(scenePalette('salt')).toBe(scenePalette('salt'));
  });
});
