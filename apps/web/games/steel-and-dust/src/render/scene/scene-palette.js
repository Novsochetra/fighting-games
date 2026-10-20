import { PAINTED_THEMES } from '../../art/painted-themes/index.js';
import { shadeColor as shade } from '../../lib/color.js';

const palettes = new Map();

// a road without grass (sand, slag, flagstones) keeps its own soil but no swaying blades; its
// darkest rock shades the foot of a cliff
function soilColors({ sand, grass, rock }) {
  const blades = grass
    ? { grass, grassLight: shade(grass, 0.25), grassDark: shade(grass, -0.3) }
    : { grassDark: shade(sand, -0.3) };
  return { ...blades, soil: shade(sand, -0.18), soilDeep: shade(sand, -0.34), shadow: rock };
}

function groundColors(ground) {
  const { sand } = ground;
  return {
    sand,
    edge: shade(sand, 0.35),
    lip: shade(sand, 0.15),
    pebble: shade(sand, -0.25),
    glint: shade(sand, 0.3),
    rut: shade(sand, -0.17),
    ...soilColors(ground),
  };
}

// what grows or lies in front of the fighters: ferns by default, or the theme's own kind with
// any colors of its own in `front`
function foregroundColors({ ground, foreground = 'ferns', front }) {
  const { rock, grass = ground.sand } = ground;
  return {
    kind: foreground,
    rock,
    top: shade(rock, 0.07),
    glint: shade(rock, 0.15),
    fern: shade(grass, -0.55),
    fernLight: shade(grass, -0.35),
    ...front,
  };
}

function buildPalette(theme) {
  return {
    ground: groundColors(theme.ground),
    rubble: foregroundColors(theme),
    ambient: theme.ambient,
  };
}

// every color the scenery of one mission is drawn with on top of its paintings, worked out once
// per theme
export function scenePalette(themeId) {
  if (!palettes.has(themeId)) {
    palettes.set(themeId, buildPalette(PAINTED_THEMES[themeId]));
  }
  return palettes.get(themeId);
}
