import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  resolveStaticTarget,
  splitRequestTarget,
  toPublicSegments,
} from '../../src/static-path.js';

const webRoot = path.resolve('/srv/arcade/web');

describe('splitRequestTarget', () => {
  it('separates the path from the query', () => {
    expect(splitRequestTarget('/games/demo?debug=1&x=2')).toEqual({
      pathname: '/games/demo',
      query: '?debug=1&x=2',
    });
  });

  it('returns an empty query when there is none', () => {
    expect(splitRequestTarget('/')).toEqual({ pathname: '/', query: '' });
  });
});

describe('toPublicSegments', () => {
  it('reads the root as no segments with a trailing slash', () => {
    expect(toPublicSegments('/')).toEqual({ segments: [], trailingSlash: true });
  });

  it('decodes each segment', () => {
    expect(toPublicSegments('/games/my%20game/')).toEqual({
      segments: ['games', 'my game'],
      trailingSlash: true,
    });
  });
});

describe('resolveStaticTarget', () => {
  it('maps the root to the web root folder', () => {
    expect(resolveStaticTarget(webRoot, '/')).toEqual({
      filePath: webRoot,
      trailingSlash: true,
      canonicalPath: '/',
    });
  });

  it('maps a file path inside the web root', () => {
    const target = resolveStaticTarget(webRoot, '/games/demo/assets/cover.png');
    expect(target.filePath).toBe(path.join(webRoot, 'games', 'demo', 'assets', 'cover.png'));
    expect(target.trailingSlash).toBe(false);
  });

  it('builds the canonical path from the decoded segments, re-encoded', () => {
    expect(resolveStaticTarget(webRoot, '/games/my%20game').canonicalPath).toBe('/games/my%20game');
  });

  it.each([
    ['plain parent segments', '/../package.json'],
    ['parent segments inside the path', '/games/../../secret'],
    ['a trailing parent segment', '/games/..'],
    ['a current-folder segment', '/./index.html'],
    ['encoded slashes around parents', '/..%2f..%2fpackage.json'],
    ['encoded dots', '/%2e%2e/'],
    ['upper-case encoded dots', '/games/%2E%2E/%2E%2E/etc/passwd'],
    ['encoded backslashes', '/games/..%5c..%5csecret'],
    ['a raw backslash', '/games\\..\\secret'],
    ['an encoded null byte', '/index.html%00.png'],
    ['a double slash', '//etc/passwd'],
    ['an empty middle segment', '/games//demo/'],
    ['malformed percent encoding', '/games/%E0%A4%A'],
    ['a path without a leading slash', 'games/demo/'],
  ])('refuses %s', (_label, rawPath) => {
    expect(resolveStaticTarget(webRoot, rawPath)).toBeNull();
  });

  it.each([
    '/.env',
    '/.git/config',
    '/games/demo/.hidden.png',
    '/test/unit/home/navigation.test.js',
    '/games/demo/test/regression/fixture.json',
    '/TEST/anything.js',
    '/package.json',
    '/games/demo/PACKAGE.JSON',
    '/node_modules/vitest/package.json',
  ])('refuses the private path %s', (rawPath) => {
    expect(resolveStaticTarget(webRoot, rawPath)).toBeNull();
  });
});
