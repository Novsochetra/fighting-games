// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { WORLD_VIEW } from '../../../src/config.js';
import { fitStage } from '../../../src/ui/stage.js';

// The 1536 x 864 canvas was drawn nearest pixel at any size: in a 1280 px window on a screen of
// one pixel to a CSS px it stood at 0.83 of its pixels, so whole columns dropped, and with them
// thin pitch lines and strokes of small words. Shown smaller than its own pixels it is smoothed.
const PAGE_CSS = readFileSync(join(import.meta.dirname, '../../../styles/page.css'), 'utf8');
const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

let canvas;

const fit = (width, height, devicePixelRatio) =>
  fitStage(
    { innerWidth: width, innerHeight: height, devicePixelRatio },
    { canvas, safe: NO_INSETS, touchOn: false },
  );

const isShrunk = () => canvas.classList.contains('is-shrunk');

beforeEach(() => {
  document.body.innerHTML = '<canvas id="pitch"></canvas>';
  canvas = Object.assign(document.getElementById('pitch'), WORLD_VIEW);
});

describe('the canvas shown smaller than its own pixels', () => {
  it('is smoothed, not sampled pixel by pixel', () => {
    fit(1280, 720, 1);

    expect(isShrunk()).toBe(true);
    expect(PAGE_CSS).toMatch(/#pitch\.is-shrunk \{\s*image-rendering: auto;\s*\}/);
  });

  it('stays crisp pixel art at its own size and over it', () => {
    fit(1280, 720, 2);

    expect(isShrunk()).toBe(false);

    fit(1920, 1080, 1);

    expect(isShrunk()).toBe(false);

    fit(812, 375, 3);

    expect(isShrunk()).toBe(false);
  });
});
