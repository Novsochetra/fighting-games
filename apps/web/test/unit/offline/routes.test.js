import { describe, expect, it } from 'vitest';
import { routeOf } from '../../../src/offline/routes.js';

const SCOPE = 'https://arcade.test/';
const get = (path, mode = 'cors') => ({ url: `${SCOPE}${path}`, method: 'GET', mode });

describe('routeOf', () => {
  it('keeps the arcade’s pages under their index.html, with or without it', () => {
    expect(routeOf(get('', 'navigate'), SCOPE)).toEqual({ kind: 'page', key: 'index.html' });
    expect(routeOf(get('supporters/?from=share#give', 'navigate'), SCOPE)).toEqual({
      kind: 'page',
      key: 'supporters/index.html',
    });
    expect(routeOf(get('credits/index.html', 'navigate'), SCOPE)).toEqual({
      kind: 'page',
      key: 'credits/index.html',
    });
  });

  it('serves the arcade’s files and its API reads, and knows each game by its folder', () => {
    expect(routeOf(get('build/main-3f9a.js'), SCOPE)).toEqual({
      kind: 'file',
      key: 'build/main-3f9a.js',
    });
    expect(routeOf(get('api/supporters'), SCOPE)).toEqual({ kind: 'api' });
    expect(routeOf(get('games/steel-and-dust/', 'navigate'), SCOPE)).toEqual({
      kind: 'game',
      id: 'steel-and-dust',
    });
    expect(routeOf(get('games/steel-and-dust/src/main.js'), SCOPE).kind).toBe('game');
  });

  it('opens any other page from the network', () => {
    expect(routeOf(get('robots.txt', 'navigate'), SCOPE)).toEqual({ kind: 'navigate' });
  });

  it('leaves a gift sent, another site and a page outside its scope to the browser', () => {
    expect(routeOf({ ...get('api/supporters'), method: 'POST' }, SCOPE)).toEqual({ kind: 'pass' });
    expect(routeOf({ url: 'https://morodokangkor.com/', method: 'GET' }, SCOPE).kind).toBe('pass');
    expect(routeOf(get('elsewhere/'), 'https://arcade.test/arcade/').kind).toBe('pass');
  });

  it('follows the arcade to whatever path it is served from', () => {
    const scope = 'https://example.com/arcade/';

    expect(routeOf({ url: `${scope}credits/`, method: 'GET', mode: 'navigate' }, scope)).toEqual({
      kind: 'page',
      key: 'credits/index.html',
    });
  });
});
