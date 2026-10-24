import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HOST,
  DEFAULT_PORT,
  describeServerUrl,
  readServerConfig,
} from '../../src/config.js';
import { chooseRoute } from '../../src/router.js';
import { isPublishedPath } from '../../src/static-site/build-site.js';

describe('readServerConfig', () => {
  it('defaults to port 8765 on the loopback address', () => {
    expect(readServerConfig({})).toEqual({
      port: DEFAULT_PORT,
      host: DEFAULT_HOST,
      databaseUrl: '',
      trustProxy: false,
    });
    expect(DEFAULT_PORT).toBe(8765);
    expect(DEFAULT_HOST).toBe('127.0.0.1');
  });

  it('reads PORT and HOST from the environment', () => {
    expect(readServerConfig({ PORT: '9000', HOST: '0.0.0.0' })).toMatchObject({
      port: 9000,
      host: '0.0.0.0',
    });
  });

  it('reads the database address and whether to trust one proxy', () => {
    const config = readServerConfig({ DATABASE_URL: ' postgres://db/arcade ', TRUST_PROXY: '1' });
    expect(config).toMatchObject({ databaseUrl: 'postgres://db/arcade', trustProxy: true });
    expect(readServerConfig({ TRUST_PROXY: 'yes' }).trustProxy).toBe(false);
  });

  it.each(['abc', '-1', '70000', '80.5'])('rejects PORT=%s', (value) => {
    expect(() => readServerConfig({ PORT: value })).toThrow(/PORT must be a whole number/);
  });
});

describe('describeServerUrl', () => {
  it('shows loopback and wildcard hosts as localhost', () => {
    expect(describeServerUrl('127.0.0.1', 8765)).toBe('http://localhost:8765/');
    expect(describeServerUrl('0.0.0.0', 80)).toBe('http://localhost:80/');
  });

  it('wraps other IPv6 hosts in brackets', () => {
    expect(describeServerUrl('fe80::1', 8765)).toBe('http://[fe80::1]:8765/');
    expect(describeServerUrl('arcade.local', 8765)).toBe('http://arcade.local:8765/');
  });
});

describe('chooseRoute', () => {
  const handle = () => {};
  const add = () => {};
  const routes = [
    { path: '/api/games', handlers: { GET: handle } },
    { path: '/api/supporters', handlers: { GET: handle, POST: add } },
  ];

  it('picks the handler registered for the exact path', () => {
    expect(chooseRoute(routes, { method: 'GET', pathname: '/api/games' })).toEqual({
      type: 'handler',
      handle,
    });
    expect(chooseRoute(routes, { method: 'HEAD', pathname: '/api/games' }).type).toBe('handler');
  });

  it('falls back to static files for any other path', () => {
    expect(chooseRoute(routes, { method: 'GET', pathname: '/api/games/' })).toEqual({
      type: 'static',
    });
  });

  it('picks the handler for each method a route takes', () => {
    expect(chooseRoute(routes, { method: 'POST', pathname: '/api/supporters' })).toEqual({
      type: 'handler',
      handle: add,
    });
  });

  it.each(['POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])(
    'refuses %s on a read-only route',
    (method) => {
      expect(chooseRoute(routes, { method, pathname: '/api/games' })).toEqual({
        type: 'method-not-allowed',
        allow: ['GET', 'HEAD'],
      });
    },
  );

  it('names every method a route takes when it refuses one', () => {
    expect(chooseRoute(routes, { method: 'OPTIONS', pathname: '/api/supporters' })).toEqual({
      type: 'method-not-allowed',
      allow: ['GET', 'POST', 'HEAD'],
    });
  });

  it('serves static files only to GET and HEAD', () => {
    expect(chooseRoute(routes, { method: 'POST', pathname: '/index.html' })).toEqual({
      type: 'method-not-allowed',
      allow: ['GET', 'HEAD'],
    });
  });
});

describe('isPublishedPath', () => {
  const webRoot = path.resolve('/repo/apps/web');
  const at = (...parts) => path.join(webRoot, ...parts);

  it('publishes the root and public files', () => {
    expect(isPublishedPath(webRoot, webRoot)).toBe(true);
    expect(isPublishedPath(webRoot, at('index.html'))).toBe(true);
    expect(isPublishedPath(webRoot, at('games', 'demo', 'game.json'))).toBe(true);
  });

  it.each([
    ['test'],
    ['games', 'demo', 'test', 'unit', 'a.test.js'],
    ['package.json'],
    ['.DS_Store'],
  ])('leaves out %j', (...parts) => {
    expect(isPublishedPath(webRoot, at(...parts))).toBe(false);
  });
});
