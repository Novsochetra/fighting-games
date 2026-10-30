// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ARCADE_SRC } from '../../../../../server/src/paths.js';
import {
  changed,
  homeLoaded,
  screenOf,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../support/arcade-harness.js';

// Bug: a move between the arcade's screens flickered as it ended. Each slide's last frame let go a
// frame before React settled the stack, so a popped screen stood back over the whole window for a
// frame, and on a push the arcade's top bar, coffee button and note (fixed, with z-indexes of their
// own) leapt over the screen pushed on it, once their layer lost the stacking context its transform
// had given it. The slide now holds its last frame until the stack settles, and every layer is a
// stacking context of its own.
const animations = [];

function fakeAnimate(keyframes, options) {
  const element = this;
  let finish = () => {};
  const finished = new Promise((resolve) => {
    finish = resolve;
  });
  const animation = {
    element,
    options,
    finished,
    finish,
    cancelledWhileShown: null,
    cancel: () => {
      animation.cancelledWhileShown = element.isConnected && !element.matches('.screen-layer--top');
    },
  };

  animations.push(animation);

  return animation;
}

beforeEach(() => {
  document.documentElement.style.setProperty('--duration-navigation', '500ms');
  document.documentElement.style.setProperty('--easing-navigation', 'ease');
  animations.length = 0;
  vi.spyOn(HTMLElement.prototype, 'animate').mockImplementation(fakeAnimate);
});

afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

const finishSlide = () =>
  act(async () => {
    animations.forEach((animation) => animation.finish());
  });

describe('a move between screens, as it ends', () => {
  it('holds its last frame until the screen it left is gone, so it never shows again', async () => {
    startArcadeAt('supporters');
    tap(screenOf('supporters').querySelector('[data-back]'));

    const slide = animations.filter((animation) => animation.element.matches('.screen-layer'));

    expect(slide).toHaveLength(2);
    expect(slide.map((animation) => animation.options.fill)).toEqual(['forwards', 'forwards']);

    await finishSlide();
    await changed();

    expect(screenOf('supporters')).toBeNull();
    expect(slide.map((animation) => animation.cancelledWhileShown)).toEqual([false, false]);
  });

  it('keeps each screen’s floating parts under the screen pushed over it', async () => {
    const css = await readFile(path.join(ARCADE_SRC, 'navigation', 'stack', 'stack.css'), 'utf8');

    expect(css).toMatch(/\.screen-layer \{[^}]*isolation: isolate;/);

    startArcadeAt('home');
    await homeLoaded();
    tap(document.getElementById('supporters-link'));
    await finishSlide();
    await changed();

    expect(screenOf('home').classList.contains('screen-layer--hidden')).toBe(true);
  });
});
