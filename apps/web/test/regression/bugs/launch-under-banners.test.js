// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { bootWithSteelAndDust, press, stopHomes } from '../../support/home-harness.js';

// Bug: opening a game zoomed the home away behind the growing card, but the install banner and the
// coffee button float outside the home, so they stayed sharp on top of the launch until the card
// covered them. The root is marked while a game opens, and they leave with the home.
const SCREEN = { left: 0, top: 0, width: 400, height: 800 };
const CARD = { left: 40, top: 100, width: 320, height: 180 };
const NOTHING = { left: 0, top: 0, width: 0, height: 0 };

// happy-dom has no layout, so the screen and the card get a phone's boxes.
function boxFor(element) {
  if (element.classList.contains('launch') || element.id === 'home') {
    return SCREEN;
  }
  return element.classList.contains('card__frame') ? CARD : NOTHING;
}

function stubLayout() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function measure() {
    const box = boxFor(this);
    return { ...box, right: box.left + box.width, bottom: box.top + box.height, x: 0, y: 0 };
  });
}

const isMarkedLaunching = () => document.documentElement.classList.contains('is-launching');

beforeEach(async () => {
  document.body.innerHTML = '';
  document.documentElement.classList.remove('is-launching');
  stubLayout();
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('the banners and the coffee button while a game opens', () => {
  it('leave with the home as the card grows', async () => {
    await bootWithSteelAndDust();
    expect(isMarkedLaunching()).toBe(false);
    press('Enter');
    expect(isMarkedLaunching()).toBe(true);

    const css = await readFile(path.join(WEB_ROOT, 'src', 'home', 'launch.css'), 'utf8');
    const rule =
      /:root\.is-launching :is\(([^)]*)\)\s*\{[^}]*visibility: hidden;[^}]*opacity: 0;/.exec(css);
    expect(rule?.[1].split(',').map((name) => name.trim())).toEqual(
      expect.arrayContaining(['.install', '.coffee-fab', '.coffee-note']),
    );
  });
});
