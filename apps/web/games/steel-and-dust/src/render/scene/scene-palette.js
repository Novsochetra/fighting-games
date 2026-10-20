import { PAINTED_THEMES } from '../../art/painted-themes/index.js';
import { SCENE_THEMES } from '../../art/scene-themes.js';
import { gradientSteps, shadeColor as shade, withAlpha } from '../../lib/color.js';

const SKY_BANDS = 10;
const palettes = new Map();

function skyColors(theme) {
  const bands = gradientSteps(theme.sky, SKY_BANDS);
  const [sunTop, sunMiddle, sunBottom] = theme.sun;
  const [cloudDark, cloudLight] = theme.clouds;
  return { bands, sunTop, sunMiddle, sunBottom, cloudDark, cloudLight };
}

function hillColors({ hill }, bands) {
  return {
    body: hill,
    ridge: shade(hill, 0.2),
    speck: shade(hill, -0.12),
    haze: withAlpha(bands[SKY_BANDS - 4], 0.18),
  };
}

function skylineColors({ skyline, lights }) {
  return {
    wall: skyline,
    shade: shade(skyline, -0.25),
    roof: shade(skyline, 0.15),
    window: shade(skyline, -0.4),
    litWindow: lights,
    silhouette: shade(skyline, -0.3),
    tank: shade(skyline, -0.05),
    tankRim: shade(skyline, 0.1),
  };
}

// a painted road without grass (sand, slag, flagstones) keeps its own soil but no swaying blades;
// its darkest rock shades the foot of a cliff
function paintedSoil({ sand, grass, rock }) {
  const blades = grass
    ? { grass, grassLight: shade(grass, 0.25), grassDark: shade(grass, -0.3) }
    : { grassDark: shade(sand, -0.3) };
  return { ...blades, soil: shade(sand, -0.18), soilDeep: shade(sand, -0.34), shadow: rock };
}

function groundColors({ sand, grass, rock }, painted = false) {
  const soil = painted ? paintedSoil({ sand, grass, rock }) : {};
  return {
    sand,
    edge: shade(sand, 0.35),
    lip: shade(sand, 0.15),
    pebble: shade(sand, -0.25),
    glint: shade(sand, 0.3),
    rut: shade(sand, -0.17),
    ...soil,
  };
}

function rubbleColors({ rock }) {
  return { rock, top: shade(rock, 0.07), glint: shade(rock, 0.15) };
}

function buildPalette(theme) {
  const sky = skyColors(theme);
  return {
    skylineKind: theme.skyline,
    celestial: theme.celestial,
    sky,
    hills: hillColors(theme.colors, sky.bands),
    skyline: skylineColors(theme.colors),
    ground: groundColors(theme.ground),
    rubble: rubbleColors(theme.ground),
  };
}

// what grows or lies in front of the fighters: ferns by default, or the theme's own kind with
// any colors of its own in `front`
function foregroundColors({ ground, foreground = 'ferns', front }) {
  const { rock, grass = ground.sand } = ground;
  return {
    kind: foreground,
    ...rubbleColors({ rock }),
    fern: shade(grass, -0.55),
    fernLight: shade(grass, -0.35),
    ...front,
  };
}

function buildPaintedPalette(theme) {
  return {
    painted: true,
    ground: groundColors(theme.ground, true),
    rubble: foregroundColors(theme),
    ambient: theme.ambient,
  };
}

// every color the scenery of one mission is painted with, worked out once per theme
export function scenePalette(themeId) {
  if (!palettes.has(themeId)) {
    const painted = PAINTED_THEMES[themeId];
    palettes.set(
      themeId,
      painted ? buildPaintedPalette(painted) : buildPalette(SCENE_THEMES[themeId]),
    );
  }
  return palettes.get(themeId);
}
