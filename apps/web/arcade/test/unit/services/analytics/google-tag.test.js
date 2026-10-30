// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browserAnalytics, loadGoogleTag } from '@/services/analytics/google-tag.js';

const ID = 'G-TEST123';
const entries = () => window.dataLayer.map((entry) => [...entry]);
// happy-dom loads no scripts, so the tag is caught on its way into the head instead.
const appended = () => document.head.append.mock.calls.flat();
const tagScript = () => appended().find((node) => node.tagName === 'SCRIPT');

function load() {
  return loadGoogleTag({ window, measurementId: ID, userProperties: { display_mode: 'browser' } });
}

beforeEach(() => {
  vi.spyOn(document.head, 'append').mockImplementation(() => {});
});

afterEach(() => {
  delete window.dataLayer;
  delete window.gtag;
  vi.restoreAllMocks();
});

describe('loadGoogleTag', () => {
  it('starts with ads off and Google signals off, then adds the tag script', () => {
    load();
    const [consent, , properties, config] = entries();
    expect(consent).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      },
    ]);
    expect(properties).toEqual(['set', 'user_properties', { display_mode: 'browser' }]);
    expect(config).toEqual(['config', ID, { allow_google_signals: false }]);
    expect(tagScript().src).toBe(`https://www.googletagmanager.com/gtag/js?id=${ID}`);
    expect(tagScript().async).toBe(true);
  });

  it('queues the same Arguments objects gtag.js reads', () => {
    load().event('play_game', { game_id: 'a' });
    expect(Object.prototype.toString.call(window.dataLayer.at(-1))).toBe('[object Arguments]');
    expect(entries().at(-1)).toEqual(['event', 'play_game', { game_id: 'a' }]);
  });

  it('turns analytics storage off and clears the _ga cookies on a no', () => {
    document.cookie = '_ga=GA1.1.1; path=/';
    document.cookie = '_ga_TEST123=GS1.1; path=/';
    document.cookie = 'other=1; path=/';
    load().deny();
    expect(entries().at(-1)).toEqual(['consent', 'update', { analytics_storage: 'denied' }]);
    expect(document.cookie).not.toMatch(/_ga/);
    expect(document.cookie).toMatch(/other=1/);
  });
});

describe('browserAnalytics', () => {
  it('stays off away from the live site', () => {
    expect(browserAnalytics(window, { isInstalled: false }).isEnabled).toBe(false);
  });
});
