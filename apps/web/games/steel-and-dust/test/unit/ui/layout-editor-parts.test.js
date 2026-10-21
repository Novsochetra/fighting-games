import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buttonVars } from '../../../src/ui/layout/apply-button-layout.js';
import {
  centreOf,
  coverCost,
  fractionOf,
  halfExtentOf,
  overlaps,
} from '../../../src/ui/layout/layout-geometry.js';
import { controlName, sizeLabel } from '../../../src/ui/layout/layout-markup.js';
import { customStickPlace } from '../../../src/ui/layout/stick-place.js';

const rect = (left, top, width, height) => ({ left, top, width, height });
const layer = rect(10, 20, 800, 400);

describe('layout editor geometry', () => {
  it('turns screen points into fractions of the touch layer', () => {
    expect(fractionOf({ x: 410, y: 120 }, layer)).toEqual({ x: 0.5, y: 0.25 });
    expect(fractionOf({ x: 5, y: 5 }, rect(0, 0, 0, 0))).toEqual({ x: 0.5, y: 0.5 });
  });

  it('measures a button centre and its half size at size 1', () => {
    const button = rect(100, 200, 120, 120);
    expect(centreOf(button)).toEqual({ x: 160, y: 260 });
    expect(halfExtentOf(button, layer, 1.5)).toEqual({ x: 0.05, y: 0.1 });
    expect(halfExtentOf(button, rect(0, 0, 0, 0), 1)).toEqual({ x: 0, y: 0 });
  });

  it('tells overlapping rects apart from touching ones', () => {
    expect(overlaps(rect(0, 0, 10, 10), rect(5, 5, 10, 10))).toBe(true);
    expect(overlaps(rect(0, 0, 10, 10), rect(10, 0, 10, 10))).toBe(false);
    expect(overlaps(rect(0, 0, 10, 10), rect(0, 20, 10, 10))).toBe(false);
  });

  // the toolbar once stayed on top of the button being dragged under it, because another button
  // also stood where it would have moved to
  it('counts the picked button over all the others when placing the toolbar', () => {
    const buttons = [
      { control: 'jump', rect: rect(380, 0, 100, 100) },
      { control: 'light', rect: rect(250, 240, 100, 100) },
      { control: 'heavy', rect: rect(640, 290, 80, 80) },
    ];
    const top = rect(180, 8, 480, 80);
    const bottom = rect(180, 302, 480, 80);
    expect(coverCost(buttons, top, 'jump')).toBe(10);
    expect(coverCost(buttons, bottom, 'jump')).toBe(2);
    expect(coverCost(buttons, bottom, 'light')).toBe(11);
    expect(coverCost(buttons, rect(0, 150, 10, 10), 'jump')).toBe(0);
  });
});

describe('a custom stick on the touch layer', () => {
  const screen = { width: 800, height: 400 };
  const place = (x, y, radius = 64) =>
    customStickPlace({ stick: { x, y, size: 1 }, layer: screen, radius });

  it('keeps the left half of the screen as its zone on the left', () => {
    expect(place(0.1, 0.75)).toEqual({ zone: { left: 0, width: 400 }, rest: { x: 80, y: 300 } });
  });

  it('takes the right half as its zone on the right, resting inside it', () => {
    expect(place(0.85, 0.7)).toEqual({ zone: { left: 400, width: 400 }, rest: { x: 280, y: 280 } });
  });

  it('widens the zone to reach past the rim of a stick near the middle', () => {
    expect(place(0.45, 0.5).zone).toEqual({ left: 0, width: 456 });
    const right = place(0.55, 0.5);
    expect(right.zone.left).toBeCloseTo(344);
    expect(right.zone.width).toBeCloseTo(456);
    expect(right.zone.left).toBeLessThan(440 - 64);
    expect(right.rest.x).toBeCloseTo(96);
  });

  it('keeps a stick that grew, or a screen that shrank, whole on the layer', () => {
    expect(place(1, 0, 96).rest).toEqual({ x: 304, y: 96 });
    expect(place(0, 1, 96)).toEqual({ zone: { left: 0, width: 400 }, rest: { x: 96, y: 304 } });
    expect(place(0.9, 0.5, 300).rest.y).toBe(200);
  });
});

describe('layout editor parts', () => {
  it('writes a layout entry as the custom properties the CSS places it by', () => {
    expect(buttonVars({ x: 0.25, y: 0.5, size: 1.2 })).toEqual({
      '--tb-x': '0.25',
      '--tb-y': '0.5',
      '--tb-size': '1.2',
    });
    expect(buttonVars(null)).toEqual({ '--tb-x': null, '--tb-y': null, '--tb-size': null });
  });

  it('names the stick, and a button by its label', () => {
    expect(controlName({ dataset: { control: 'stick' }, textContent: '' })).toBe('STICK');
    expect(controlName({ dataset: { control: 'light' }, textContent: 'ATTACK' })).toBe('ATTACK');
  });

  it('shows sizes as percentages', () => {
    expect(sizeLabel(1)).toBe('100%');
    expect(sizeLabel(1.2)).toBe('120%');
    expect(sizeLabel(0.6)).toBe('60%');
  });

  it('draws only images that are there', () => {
    const styles = new URL('../../../styles/', import.meta.url);
    const css = readFileSync(new URL('layout-editor.css', styles), 'utf8');
    const images = [...css.matchAll(/url\('([^']+)'\)/g)].map((match) => new URL(match[1], styles));
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(existsSync(image), image.pathname).toBe(true);
    }
  });
});
