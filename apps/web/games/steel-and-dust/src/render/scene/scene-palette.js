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

function groundColors({ sand }) {
  return {
    sand,
    edge: shade(sand, 0.35),
    lip: shade(sand, 0.15),
    pebble: shade(sand, -0.25),
    glint: shade(sand, 0.3),
    rut: shade(sand, -0.17),
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

// every color the scenery of one mission is painted with, worked out once per theme
export function scenePalette(themeId) {
  if (!palettes.has(themeId)) {
    palettes.set(themeId, buildPalette(SCENE_THEMES[themeId]));
  }
  return palettes.get(themeId);
}
