import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../src/art/painted-themes/index.js';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
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
  it('have a palette for every painted theme and nothing else', () => {
    expect(Object.keys(PAINTED_BACKDROPS).sort()).toEqual(Object.keys(PAINTED_THEMES).sort());
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

  // a road whose body draws the ends of its own courses hangs only its paving's end from the lip
  it('find a cliff face on disk for every road that has one, about 12 by 64', () => {
    const withCliffs = Object.entries(PAINTED_BACKDROPS).filter(([, spec]) => spec.cliff);
    expect(withCliffs.length).toBeGreaterThanOrEqual(6);
    for (const [themeId, { folder, deep }] of withCliffs) {
      const { width, height } = layerSize(folder, 'cliff');
      expect(width, themeId).toBeGreaterThanOrEqual(8);
      expect(width, themeId).toBeLessThanOrEqual(16);
      expect(height, themeId).toBe(deep?.faces ? 26 : 64);
    }
  });

  it('find the level body of every raised road that has one, the height of the view', () => {
    const withBodies = Object.entries(PAINTED_BACKDROPS).filter(([, spec]) => spec.deep);
    expect(withBodies.map(([themeId]) => themeId)).toEqual(['angkorWat', 'bayon']);
    for (const [themeId, { folder, deep }] of withBodies) {
      expect(layerSize(folder, 'deep'), themeId).toEqual({
        ...layerSize(folder, 'ground'),
        height: 216,
      });
      expect(deep.from, themeId).toBeLessThan(layerSize(folder, 'ground').height);
    }
    expect(layerSize('angkor-wat', 'face')).toEqual({ width: 4 * 11, height: 216 });
    expect(layerSize('angkor-wat', 'breach')).toEqual({ width: 2 * 16, height: 216 });
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
        const colors = PAINTED_THEMES[themeId].ambient;
        expect(drawsSomethingWithin(effect, colors, 1800), `${themeId} ${effect.kind}`).toBe(true);
      }
    }
  });
});
