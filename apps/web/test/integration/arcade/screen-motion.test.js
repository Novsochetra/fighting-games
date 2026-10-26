// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import {
  changed,
  homeLoaded,
  screenOf,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../support/arcade-harness.js';

const played = [];

function fakeAnimate(keyframes, options) {
  let finish = () => {};
  const finished = new Promise((resolve) => {
    finish = resolve;
  });
  const animation = { element: this, keyframes, options, finished, finish, cancel: () => {} };

  played.push(animation);

  return animation;
}

const setTokens = (tokens) =>
  Object.entries(tokens).forEach(([name, value]) =>
    document.documentElement.style.setProperty(name, value),
  );

beforeEach(() => {
  played.length = 0;
  vi.spyOn(HTMLElement.prototype, 'animate').mockImplementation(fakeAnimate);
  setTokens({ '--duration-navigation': '400ms', '--easing-navigation': 'ease' });
});

afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

async function moveToSupporters() {
  startArcadeAt('home');
  await homeLoaded();
  tap(document.getElementById('supporters-link'));

  const layers = played.filter((animation) => animation.element.matches('.screen-layer'));

  await act(async () => layers.forEach((animation) => animation.finish()));
  await changed();

  return layers;
}

const propertiesOf = (animation) =>
  new Set(animation.keyframes.flatMap((frame) => Object.keys(frame)));

describe('a move between screens', () => {
  it('zooms on a desktop, the supporters growing in over the arcade', async () => {
    setTokens({ '--motion-navigation': 'zoom', '--scale-away': '0.96', '--scale-under': '1.03' });

    const [front, back] = await moveToSupporters();

    expect(front.element).toBe(screenOf('supporters'));
    expect(front.keyframes[0]).toEqual({ opacity: 0, scale: '0.96' });
    expect(back.keyframes.at(-1)).toEqual({ scale: '1.03' });
    expect([front, back].some((animation) => propertiesOf(animation).has('translate'))).toBe(false);
  });

  it('slides on a phone, the supporters coming over from the right', async () => {
    setTokens({ '--motion-navigation': 'slide' });

    const [front] = await moveToSupporters();

    expect(front.element).toBe(screenOf('supporters'));
    expect(front.keyframes[0].translate).toBe('100% 0');
  });

  it('takes the desktop’s zoom from a mouse or trackpad and the phone’s slide from a touch', async () => {
    const css = await readFile(path.join(WEB_ROOT, 'src', 'home', 'tokens.css'), 'utf8');
    const desktop = /@media \(hover: hover\) and \(pointer: fine\) \{\s*:root \{([^}]*)\}/.exec(
      css,
    );

    expect(css).toMatch(/^:root \{[^}]*--motion-navigation: slide;/m);
    expect(desktop?.[1]).toMatch(/--motion-navigation: zoom;/);
    expect(desktop?.[1]).toMatch(/--duration-navigation: \d+ms;/);
  });
});
