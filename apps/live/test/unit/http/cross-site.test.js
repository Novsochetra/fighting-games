import { describe, expect, it } from 'vitest';
import { corsHeaders, isAllowedOrigin } from '../../../src/http/cross-site.js';

const origins = ['https://morodokangkor.com'];

describe('pages from other sites', () => {
  it('get CORS only for a game in the list', () => {
    expect(corsHeaders({ origin: 'https://morodokangkor.com' }, origins)).toMatchObject({
      'Access-Control-Allow-Origin': 'https://morodokangkor.com',
      Vary: 'Origin',
    });
    expect(corsHeaders({ origin: 'https://evil.example' }, origins)).toEqual({});
    expect(corsHeaders({}, origins)).toEqual({});
  });

  it('are refused unless in the list; a call with no page behind it is let through', () => {
    expect(isAllowedOrigin({ origin: 'https://morodokangkor.com' }, origins)).toBe(true);
    expect(isAllowedOrigin({ origin: 'https://evil.example' }, origins)).toBe(false);
    expect(isAllowedOrigin({}, origins)).toBe(true);
  });
});
