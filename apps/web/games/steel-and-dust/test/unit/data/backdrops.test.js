import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FOREST_THEMES } from '../../../src/art/forest-themes.js';
import { PAINTED_BACKDROPS, isPaintedTheme } from '../../../src/data/backdrops.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawAmbient } from '../../../src/render/scene/ambient/index.js';
import { pngSize } from '../../support/png-size.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const layerPath = (folder, name) => join(GAME_ROOT, `assets/backdrops/${folder}/${name}.png`);
const layerSize = (folder, name) => pngSize(layerPath(folder, name));

function drawsSomethingWithin(effect, colors, ticks) {
  for (let tick = 0; tick <= ticks; tick += 30) {
    const { context, log } = createRecordingContext(null);
    drawAmbient(createPainter(context), {
      effects: [effect],
      plane: effect.plane,
      tick,
      cameraX: tick * 2,
      colors,
    });
    if (log.some((call) => call.startsWith('fillRect('))) {
      return true;
    }
  }
  return false;
}

describe('painted backdrops', () => {
  it('have a forest palette for every painted theme and nothing else', () => {
    expect(Object.keys(PAINTED_BACKDROPS).sort()).toEqual(Object.keys(FOREST_THEMES).sort());
    expect(isPaintedTheme('pineRidge')).toBe(true);
    expect(isPaintedTheme('storm')).toBe(false);
  });

  it('are used by a mission each', () => {
    const themes = new Set(MISSIONS.map((mission) => mission.theme));
    for (const themeId of Object.keys(PAINTED_BACKDROPS)) {
      expect(themes.has(themeId), themeId).toBe(true);
    }
  });

  it('find every layer on disk, as tall as the view and wide enough to tile', () => {
    for (const [themeId, { folder, layers }] of Object.entries(PAINTED_BACKDROPS)) {
      for (const { name, parallax } of layers) {
        const { width, height } = layerSize(folder, name);
        expect(height, `${themeId} ${name}`).toBe(216);
        expect(width, `${themeId} ${name}`).toBeGreaterThanOrEqual(256);
        expect(parallax, `${themeId} ${name}`).toBeGreaterThan(0);
        expect(parallax, `${themeId} ${name}`).toBeLessThan(1);
      }
    }
  });

  it('find every front layer on disk, as tall as the view, wide enough to tile and nearer than the road', () => {
    for (const [themeId, { folder, fronts = [] }] of Object.entries(PAINTED_BACKDROPS)) {
      for (const { name, parallax } of fronts) {
        const label = `${themeId} front ${name}`;
        expect(existsSync(layerPath(folder, name)), label).toBe(true);
        const { width, height } = layerSize(folder, name);
        expect(height, label).toBe(216);
        expect(width, label).toBeGreaterThanOrEqual(256);
        expect(parallax, label).toBeGreaterThan(1);
      }
    }
  });

  it('put every emitter inside its near layer, which repeats at the width the emitter expects', () => {
    for (const [themeId, { folder, ambient }] of Object.entries(PAINTED_BACKDROPS)) {
      for (const effect of ambient.filter((item) => item.emitters)) {
        expect(effect.tileWidth, themeId).toBe(layerSize(folder, 'near').width);
        for (const emitter of effect.emitters) {
          expect(emitter.x, themeId).toBeLessThan(effect.tileWidth);
        }
      }
    }
  });

  it('only ask for air its forest has colors for, so every effect shows up', () => {
    for (const [themeId, { ambient }] of Object.entries(PAINTED_BACKDROPS)) {
      for (const effect of ambient) {
        expect(['back', 'front'], `${themeId} ${effect.kind}`).toContain(effect.plane);
        const colors = FOREST_THEMES[themeId].ambient;
        expect(drawsSomethingWithin(effect, colors, 1800), `${themeId} ${effect.kind}`).toBe(true);
      }
    }
  });
});
