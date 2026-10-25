import { describe, expect, it, vi } from 'vitest';
import {
  isAnalyticsEnabled,
  LIVE_HOSTS,
  MEASUREMENT_ID,
} from '../../../src/home/analytics-config.js';
import { EVENTS, onOff } from '../../../src/home/analytics-events.js';
import { CONSENT, createAnalytics, isConsentChoice } from '../../../src/home/analytics.js';
import { createMemoryStorage, createPreferences } from '../../../src/home/preferences.js';

function setup({ isEnabled = true, choice = null } = {}) {
  const preferences = createPreferences(createMemoryStorage());
  if (choice !== null) {
    preferences.setAnalyticsConsent(choice);
  }
  const tag = { event: vi.fn(), grant: vi.fn(), deny: vi.fn() };
  const loadTag = vi.fn(() => tag);
  const analytics = createAnalytics({ isEnabled, loadTag, preferences });
  return { analytics, preferences, tag, loadTag };
}

describe('createAnalytics', () => {
  it('asks first, and loads nothing and sends nothing before a yes', () => {
    const { analytics, loadTag } = setup();
    expect(analytics.needsAnswer()).toBe(true);
    analytics.track(EVENTS.play, { game_id: 'a' });
    expect(loadTag).not.toHaveBeenCalled();
  });

  it('loads the tag on a yes, once, and sends events while the yes stands', () => {
    const { analytics, preferences, tag, loadTag } = setup();
    analytics.allow();
    analytics.allow();
    analytics.track(EVENTS.play, { game_id: 'a', source: 'card' });
    expect(loadTag).toHaveBeenCalledOnce();
    expect(tag.grant).toHaveBeenCalledTimes(2);
    expect(tag.event).toHaveBeenCalledWith('play_game', { game_id: 'a', source: 'card' });
    expect(preferences.analyticsConsent()).toBe(CONSENT.granted);
    expect(analytics.needsAnswer()).toBe(false);
  });

  it('stops every event on a no, even one given after a yes', () => {
    const { analytics, preferences, tag } = setup();
    analytics.allow();
    analytics.refuse();
    analytics.track(EVENTS.favorite);
    expect(tag.deny).toHaveBeenCalledOnce();
    expect(tag.event).not.toHaveBeenCalled();
    expect(preferences.analyticsConsent()).toBe(CONSENT.denied);
  });

  it('starts the tag at once for a player who said yes on an earlier visit', () => {
    const { analytics, loadTag, tag } = setup({ choice: CONSENT.granted });
    expect(loadTag).toHaveBeenCalledOnce();
    expect(analytics.needsAnswer()).toBe(false);
    analytics.track(EVENTS.details, { game_id: 'a' });
    expect(tag.event).toHaveBeenCalledOnce();
  });

  it('asks again when the stored answer is not one it knows', () => {
    expect(setup({ choice: 'maybe' }).analytics.needsAnswer()).toBe(true);
  });

  it('asks nothing and loads nothing off the live site', () => {
    const { analytics, loadTag } = setup({ isEnabled: false, choice: CONSENT.granted });
    analytics.allow();
    analytics.track(EVENTS.play);
    expect(analytics.needsAnswer()).toBe(false);
    expect(loadTag).not.toHaveBeenCalled();
  });

  it('knows the two answers', () => {
    expect(isConsentChoice('granted')).toBe(true);
    expect(isConsentChoice('denied')).toBe(true);
    expect(isConsentChoice(null)).toBe(false);
  });
});

describe('isAnalyticsEnabled', () => {
  const id = 'G-ABC123XYZ';

  it('is on only for the live hosts with a Google measurement id', () => {
    expect(isAnalyticsEnabled({ measurementId: id, hostname: 'www.khmerarcade.games' })).toBe(true);
    expect(isAnalyticsEnabled({ measurementId: id, hostname: 'khmerarcade.games' })).toBe(true);
    expect(isAnalyticsEnabled({ measurementId: id, hostname: 'localhost' })).toBe(false);
    expect(
      isAnalyticsEnabled({ measurementId: id, hostname: 'arcadeserver-production.up.railway.app' }),
    ).toBe(false);
  });

  it('is on for the arcade itself', () => {
    const hostname = LIVE_HOSTS[0];
    expect(isAnalyticsEnabled({ measurementId: MEASUREMENT_ID, hostname })).toBe(true);
  });

  it('is off without a well-formed id', () => {
    const hostname = 'www.khmerarcade.games';
    expect(isAnalyticsEnabled({ measurementId: '', hostname })).toBe(false);
    expect(isAnalyticsEnabled({ measurementId: 'UA-1234-1', hostname })).toBe(false);
  });
});

describe('EVENTS', () => {
  const names = Object.values(EVENTS);
  const reservedPrefixes = ['_', 'ga_', 'google_', 'firebase_', 'gtag.'];
  const reservedNames = ['first_visit', 'session_start', 'user_engagement', 'page_view', 'error'];

  it('names each event as Google Analytics allows, once', () => {
    names.forEach((name) => expect(name).toMatch(/^[a-z][a-z0-9_]{0,39}$/));
    expect(new Set(names).size).toBe(names.length);
  });

  it('keeps clear of the names Google keeps for itself', () => {
    names.forEach((name) => {
      expect(reservedNames).not.toContain(name);
      reservedPrefixes.forEach((prefix) => expect(name.startsWith(prefix)).toBe(false));
    });
  });

  it('says on or off', () => {
    expect([onOff(true), onOff(false)]).toEqual(['on', 'off']);
  });
});
