import { describe, expect, it } from 'vitest';
import { clientAddressOf, createRateLimiter } from '../../src/security/rate-limit.js';
import { isFromOtherSite, isFromOwnPage } from '../../src/security/request-origin.js';

const HOST = 'arcade.up.railway.app';
const headers = (extra) => ({ host: HOST, ...extra });

describe('isFromOtherSite', () => {
  it('lets the arcade page and requests without browser headers through', () => {
    expect(isFromOtherSite(headers({ 'sec-fetch-site': 'same-origin' }))).toBe(false);
    expect(isFromOtherSite(headers({ origin: `https://${HOST}` }))).toBe(false);
    expect(isFromOtherSite(headers({ 'sec-fetch-site': 'none' }))).toBe(false);
    expect(isFromOtherSite(headers({}))).toBe(false);
  });

  it.each(['cross-site', 'same-site'])('refuses a fetch the browser marks %s', (site) => {
    expect(isFromOtherSite(headers({ 'sec-fetch-site': site }))).toBe(true);
  });

  it.each(['https://evil.example', 'https://arcade.up.railway.app.evil.example', 'null', 'junk'])(
    'refuses the origin %s',
    (origin) => {
      expect(isFromOtherSite(headers({ origin }))).toBe(true);
    },
  );
});

describe('isFromOwnPage', () => {
  it('needs an Origin from the arcade itself', () => {
    expect(isFromOwnPage(headers({ origin: `https://${HOST}` }))).toBe(true);
    expect(isFromOwnPage(headers({}))).toBe(false);
    expect(isFromOwnPage(headers({ origin: 'https://evil.example' }))).toBe(false);
    expect(
      isFromOwnPage(headers({ origin: `https://${HOST}`, 'sec-fetch-site': 'cross-site' })),
    ).toBe(false);
  });
});

describe('createRateLimiter', () => {
  it('allows a few per address in the window, then waits for the window to pass', () => {
    let time = 0;
    const allow = createRateLimiter({ limit: 2, windowMs: 1000, now: () => time });
    expect([allow('a'), allow('a'), allow('a')]).toEqual([true, true, false]);
    expect(allow('b')).toBe(true);
    time = 999;
    expect(allow('a')).toBe(false);
    time = 1001;
    expect(allow('a')).toBe(true);
  });

  it('forgets addresses whose window has passed once it holds many', () => {
    let time = 0;
    const allow = createRateLimiter({ limit: 1, windowMs: 10, now: () => time });
    for (let i = 0; i < 1000; i += 1) {
      allow(`visitor-${i}`);
    }
    time = 20;
    expect(allow('visitor-0')).toBe(true);
    expect(allow('visitor-0')).toBe(false);
  });
});

describe('clientAddressOf', () => {
  const request = (forwardedFor) => ({
    headers: forwardedFor ? { 'x-forwarded-for': forwardedFor } : {},
    socket: { remoteAddress: '10.0.0.5' },
  });

  it('takes the address the proxy saw, not what the visitor wrote before it', () => {
    expect(clientAddressOf(request('6.6.6.6, 1.2.3.4'), { trustProxy: true })).toBe('1.2.3.4');
  });

  describe('behind Cloudflare', () => {
    const throughCloudflare = (edge, visitor) => ({
      headers: { 'x-forwarded-for': `${visitor}, ${edge}`, 'cf-connecting-ip': visitor },
      socket: { remoteAddress: '10.0.0.5' },
    });

    it('takes the visitor Cloudflare names, not the edge every visitor shares', () => {
      const overIpv4 = throughCloudflare('172.70.1.1', '203.0.113.7');
      expect(clientAddressOf(overIpv4, { trustProxy: true })).toBe('203.0.113.7');
      const overIpv6 = throughCloudflare('2400:cb00:2049::1', '2001:db8::7');
      expect(clientAddressOf(overIpv6, { trustProxy: true })).toBe('2001:db8::7');
    });

    it('believes no CF-Connecting-IP from an address outside Cloudflare', () => {
      const spoofed = throughCloudflare('198.51.100.9', '203.0.113.7');
      expect(clientAddressOf(spoofed, { trustProxy: true })).toBe('198.51.100.9');
    });

    it('keeps the edge when the header is missing or not an address', () => {
      const missing = throughCloudflare('172.70.1.1', '');
      missing.headers['cf-connecting-ip'] = undefined;
      expect(clientAddressOf(missing, { trustProxy: true })).toBe('172.70.1.1');
      const junk = throughCloudflare('172.70.1.1', 'not-an-ip');
      expect(clientAddressOf(junk, { trustProxy: true })).toBe('172.70.1.1');
    });
  });

  it('ignores X-Forwarded-For without a trusted proxy', () => {
    expect(clientAddressOf(request('1.2.3.4'), { trustProxy: false })).toBe('10.0.0.5');
    expect(clientAddressOf(request(''), { trustProxy: true })).toBe('10.0.0.5');
  });
});
