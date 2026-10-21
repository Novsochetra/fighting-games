import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../src/config.js';
import { TITLE_SCENES } from '../../../src/data/title-scene.js';
import { pngSize } from '../../support/png-size.js';

// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
const GAME_ROOT = join(import.meta.dirname, '../../..');
const TITLE_KINDS = new Set(['ripple', 'sway', 'sunGlow', 'sunRays']);
// a flock lifts and fans out this far around its line
const FLOCK_REACH = 16;

const scenes = Object.entries(TITLE_SCENES);
const ofKind = (scene, kind) => scene.effects.filter((effect) => effect.kind === kind);
const airOf = (scene) => scene.effects.filter((effect) => !TITLE_KINDS.has(effect.kind));

// the rows of the painting a shared air effect draws on: its own band moved down by its shift
function bandOf(effect) {
  const shiftY = effect.shiftY ?? 0;
  if ('top' in effect) {
    return { top: effect.top + shiftY, bottom: effect.bottom + shiftY };
  }
  if (effect.kind === 'leaves') {
    return { top: shiftY, bottom: shiftY + VIEW_HEIGHT };
  }
  return { top: effect.y - FLOCK_REACH + shiftY, bottom: effect.y + FLOCK_REACH + shiftY };
}

function isInside(box, scene) {
  return box.left >= 0 && box.right <= scene.width && box.top >= 0 && box.bottom <= scene.height;
}

const overlaps = (one, other) =>
  one.left < other.right &&
  other.left < one.right &&
  one.top < other.bottom &&
  other.top < one.bottom;

describe.each(scenes)('the %s title scene', (_orientation, scene) => {
  it('is the size of its painting', () => {
    const { width, height } = pngSize(join(GAME_ROOT, scene.painting));
    expect({ width, height }).toEqual({ width: scene.width, height: scene.height });
  });

  it('lays every air effect inside the painting', () => {
    for (const effect of airOf(scene)) {
      const band = bandOf(effect);
      expect(band.top, effect.kind).toBeGreaterThanOrEqual(0);
      expect(band.bottom, effect.kind).toBeLessThanOrEqual(scene.height);
      expect(band.top, effect.kind).toBeLessThanOrEqual(band.bottom);
    }
  });

  it('keeps any gathered glints on the painting', () => {
    for (const glints of ofKind(scene, 'glints')) {
      expect(glints.left).toBeGreaterThanOrEqual(0);
      expect(glints.left + glints.span).toBeLessThanOrEqual(scene.width);
    }
  });

  it('keeps every count small, so the scene stays calm', () => {
    for (const effect of scene.effects.filter((each) => 'count' in each)) {
      expect(effect.count, effect.kind).toBeGreaterThan(0);
      expect(effect.count, effect.kind).toBeLessThanOrEqual(20);
    }
  });

  it('shifts only the shared air effects; its own are placed on the painting itself', () => {
    for (const effect of scene.effects.filter((each) => TITLE_KINDS.has(each.kind))) {
      expect(effect.shiftY, effect.kind).toBeUndefined();
    }
  });

  it('ripples only open water inside the moat it measures depth across', () => {
    const [ripple] = ofKind(scene, 'ripple');
    for (const area of ripple.areas) {
      expect(isInside(area, scene)).toBe(true);
      expect(area.top).toBeGreaterThanOrEqual(ripple.top);
      expect(area.bottom).toBeLessThanOrEqual(ripple.bottom);
    }
  });

  it('sways crowns that lie on the painting and never on top of each other', () => {
    const [{ crowns }] = ofKind(scene, 'sway');
    crowns.forEach((crown, i) => {
      expect(isInside(crown, scene)).toBe(true);
      expect(crown.bottom - crown.top).toBeGreaterThan(4);
      crowns.slice(i + 1).forEach((other) => expect(overlaps(crown, other)).toBe(false));
    });
  });

  it('lights a sun that lies in its sky, and breathes and throws rays from the same one', () => {
    const [glow] = ofKind(scene, 'sunGlow');
    const [rays] = ofKind(scene, 'sunRays');
    expect(glow.x - glow.radius).toBeGreaterThanOrEqual(0);
    expect(glow.x + glow.radius).toBeLessThanOrEqual(scene.width);
    expect(glow.y).toBeLessThan(scene.height / 2);
    expect(rays).toMatchObject({ x: glow.x, y: glow.y, radius: glow.radius });
  });
});

describe('the title paintings', () => {
  it('are the game view on its side and a taller one for upright screens', () => {
    expect(TITLE_SCENES.landscape).toMatchObject({ width: VIEW_WIDTH, height: VIEW_HEIGHT });
    expect(TITLE_SCENES.portrait.height).toBeGreaterThan(TITLE_SCENES.portrait.width);
  });
});
