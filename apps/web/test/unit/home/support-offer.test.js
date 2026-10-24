import { describe, expect, it } from 'vitest';
import {
  createMemoryStorage,
  createPreferences,
  STORAGE_KEYS,
} from '../../../src/home/preferences.js';
import {
  isBackFromGame,
  shouldOfferSupport,
  SUPPORT_AFTER_PLAYS,
  SUPPORT_RESHOW_MS,
  SUPPORT_SNOOZE_MS,
} from '../../../src/home/support-offer.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const now = 100 * DAY_MS;
const fan = { isReturn: true, playCount: 3, hasGiven: false, snoozedUntil: null, now };

describe('shouldOfferSupport', () => {
  it('asks a player back from a game after their third play', () => {
    expect(SUPPORT_AFTER_PLAYS).toBe(3);
    expect(shouldOfferSupport(fan)).toBe(true);
  });

  it.each([
    ['on arrival, not back from a game', { isReturn: false }],
    ['before the third play', { playCount: 2 }],
    ['after a gift from this device', { hasGiven: true }],
    ['while held back', { snoozedUntil: now + 1 }],
  ])('stays quiet %s', (_label, change) => {
    expect(shouldOfferSupport({ ...fan, ...change })).toBe(false);
  });

  it('asks again once the hold is over', () => {
    expect(shouldOfferSupport({ ...fan, snoozedUntil: now })).toBe(true);
  });

  it('holds back a month after Not now and a week after a banner left alone', () => {
    expect(SUPPORT_SNOOZE_MS).toBe(30 * DAY_MS);
    expect(SUPPORT_RESHOW_MS).toBe(7 * DAY_MS);
  });
});

describe('isBackFromGame', () => {
  it('sees a game opened since the banner last looked', () => {
    expect(isBackFromGame({ playCount: 4, seenPlays: 3 })).toBe(true);
    expect(isBackFromGame({ playCount: 3, seenPlays: 3 })).toBe(false);
  });

  it('only takes the count on its very first look', () => {
    expect(isBackFromGame({ playCount: 9, seenPlays: null })).toBe(false);
  });
});

describe('the preferences behind the banner', () => {
  it('counts plays, and keeps the count for the next visit', () => {
    const storage = createMemoryStorage();
    const preferences = createPreferences(storage);
    preferences.recordPlay('a');
    preferences.recordPlay('a');
    expect(preferences.playCount()).toBe(2);
    expect(createPreferences(storage).playCount()).toBe(2);
  });

  it('counts the Recent list of a player from before the count was kept', () => {
    const storage = createMemoryStorage();
    storage.write(STORAGE_KEYS.recent, ['a', 'b', 'c']);
    expect(createPreferences(storage).playCount()).toBe(3);
  });

  it('keeps a gift and a hold, and reads junk as neither', () => {
    const storage = createMemoryStorage();
    const preferences = createPreferences(storage);
    preferences.recordGift(5);
    preferences.snoozeSupport(9);
    preferences.markSupportSeen(3);
    expect(createPreferences(storage).hasGiven()).toBe(true);
    expect(createPreferences(storage).supportSnoozedUntil()).toBe(9);
    expect(createPreferences(storage).supportSeenPlays()).toBe(3);

    const junk = createMemoryStorage();
    junk.write(STORAGE_KEYS.gaveAt, 'yes');
    junk.write(STORAGE_KEYS.supportSnoozedUntil, 'later');
    junk.write(STORAGE_KEYS.plays, '7');
    const read = createPreferences(junk);
    expect([read.hasGiven(), read.supportSnoozedUntil(), read.playCount()]).toEqual([
      false,
      null,
      0,
    ]);
  });
});
