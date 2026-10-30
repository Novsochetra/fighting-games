// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ARCADE_SRC } from '../../../../../server/src/paths.js';
import { CREDITS_ENTRANCES } from '@/screens/credits/CreditsScreen.tsx';
import { SUPPORTERS_ENTRANCES } from '@/screens/supporters/SupportersScreen.tsx';
import {
  changed,
  homeLoaded,
  screenOf,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../support/arcade-harness.js';

// Bug: each time the supporters screen slid in again, its podium and its list rose in from nothing
// over the slide, as they do while the page first loads, so the cards came in late and the slide
// dropped frames at its start; the credits rose in over every slide too. A screen that slides in now
// arrives drawn, as an iOS screen does, and only a page that loads plays its entrance.
const ENTRANCES = ['place-rise', 'row-rise', 'credits-rise', 'portrait-in'];
const OTHERS = ['spin', 'tier-glint', 'cover-zoom', 'bar-condense'];

// happy-dom plays no CSS, so each screen stands in for its animations with these
const played = new Map();

function animationsOf(screen) {
  if (!played.has(screen)) {
    const named = (animationName) => ({ animationName, finish: vi.fn() });

    played.set(screen, [...ENTRANCES, ...OTHERS].map(named));
  }

  return played.get(screen);
}

function cssAnimations() {
  const screen = this.closest?.('.screen-layer')?.dataset.screen;

  return screen ? animationsOf(screen) : [];
}

const finishedOn = (screen) =>
  animationsOf(screen)
    .filter((animation) => animation.finish.mock.calls.length > 0)
    .map((animation) => animation.animationName);

beforeEach(() => {
  played.clear();
  vi.spyOn(Element.prototype, 'getAnimations').mockImplementation(cssAnimations);
});

afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
});

async function openFromHome(link) {
  tap(document.getElementById(link));
  await changed();
}

async function backToHome(screen) {
  tap(screenOf(screen).querySelector('[data-back]'));
  await changed();
}

describe('a screen sliding in', () => {
  it('arrives with its supporters drawn when it slides in again, not rising in over the slide', async () => {
    startArcadeAt('home');
    await homeLoaded();
    await openFromHome('supporters-link');
    await backToHome('supporters');
    played.clear();

    await openFromHome('supporters-link');

    expect(finishedOn('supporters')).toEqual(['place-rise', 'row-rise']);
  });

  it('arrives with the credits drawn, leaving what keeps moving alone', async () => {
    startArcadeAt('home');
    await homeLoaded();
    await openFromHome('credits-link');

    expect(finishedOn('credits')).toEqual(['credits-rise', 'portrait-in']);
  });

  it('still plays its entrance where the page loads on it', () => {
    startArcadeAt('credits');

    expect(finishedOn('credits')).toEqual([]);
  });

  it('names the entrances its CSS plays', async () => {
    const css = await Promise.all(
      ['supporters/podium.css', 'supporters/roll.css', 'credits/credits.css', 'credits/maker.css']
        .map((file) => path.join(ARCADE_SRC, 'screens', file))
        .map((file) => readFile(file, 'utf8')),
    );
    const keyframes = css.join('\n').matchAll(/@keyframes ([\w-]+)/g);
    const names = [...keyframes].map(([, name]) => name);

    expect(names).toEqual(expect.arrayContaining([...SUPPORTERS_ENTRANCES, ...CREDITS_ENTRANCES]));
  });
});
