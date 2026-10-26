import { describe, expect, it } from 'vitest';
import { arcadeRoot, depthOf, routeOf, screenAtRoute } from '../../../src/arcade/screens';

const ROOT = new URL('https://www.khmerarcade.games/');

describe('arcadeRoot', () => {
  it('is the folder above a screen under the arcade, and the arcade’s own folder', () => {
    expect(arcadeRoot(new URL(`${ROOT}supporters/#give`), 'supporters').href).toBe(ROOT.href);
    expect(arcadeRoot(new URL(`${ROOT}credits/`), 'credits').href).toBe(ROOT.href);
    expect(arcadeRoot(new URL(`${ROOT}index.html?from=share`), 'home').href).toBe(ROOT.href);
  });

  it('follows the arcade to whatever path it is served from', () => {
    const page = new URL('https://example.com/arcade/supporters/');

    expect(arcadeRoot(page, 'supporters').href).toBe('https://example.com/arcade/');
  });
});

describe('screenAtRoute', () => {
  it('knows each screen by its route, with or without its index.html or its slash', () => {
    expect(screenAtRoute('/')).toBe('home');
    expect(screenAtRoute('/index.html')).toBe('home');
    expect(screenAtRoute('/supporters/')).toBe('supporters');
    expect(screenAtRoute('/supporters')).toBe('supporters');
    expect(screenAtRoute('/credits/index.html')).toBe('credits');
  });

  it('turns down a game, a file and anything else', () => {
    expect(screenAtRoute('/games/steel-and-dust/')).toBeNull();
    expect(screenAtRoute('/assets/donate/khqr.jpg')).toBeNull();
    expect(screenAtRoute('/supporters/extra/')).toBeNull();
  });
});

describe('the routes of the screens', () => {
  it('put the arcade at the root and the others a step above it', () => {
    expect([routeOf('home'), routeOf('supporters'), routeOf('credits')]).toEqual([
      '/',
      '/supporters/',
      '/credits/',
    ]);
    expect([depthOf('home'), depthOf('supporters'), depthOf('credits')]).toEqual([0, 1, 1]);
  });
});
