import { describe, expect, it } from 'vitest';
import {
  RECENT_LIMIT,
  STORAGE_KEYS,
  createBrowserStorage,
  createMemoryStorage,
  createPreferences,
  pushRecent,
  toggleId,
} from '../../../src/home/preferences.js';

describe('toggleId and pushRecent', () => {
  it('adds a missing id and removes a present one', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('moves a played game to the front, once, and keeps the list short', () => {
    expect(pushRecent(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b']);
    const many = Array.from({ length: RECENT_LIMIT }, (_, i) => `game-${i}`);
    const pushed = pushRecent(many, 'new');
    expect(pushed).toHaveLength(RECENT_LIMIT);
    expect(pushed[0]).toBe('new');
  });
});

describe('createPreferences', () => {
  it('starts with no favorites, no recent games and the sound on', () => {
    const preferences = createPreferences(createMemoryStorage());
    expect(preferences.favorites()).toEqual([]);
    expect(preferences.recent()).toEqual([]);
    expect(preferences.isSoundOn()).toBe(true);
  });

  it('saves every change, so the next visit finds it', () => {
    const storage = createMemoryStorage();
    const first = createPreferences(storage);
    first.toggleFavorite('a');
    first.recordPlay('b');
    first.setSound(false);
    const next = createPreferences(storage);
    expect(next.isFavorite('a')).toBe(true);
    expect(next.recent()).toEqual(['b']);
    expect(next.isSoundOn()).toBe(false);
    expect(storage.read(STORAGE_KEYS.favorites)).toEqual(['a']);
  });

  it('remembers when the install banner was turned down', () => {
    const storage = createMemoryStorage();
    expect(createPreferences(storage).installDismissedAt()).toBeNull();
    createPreferences(storage).dismissInstall(1234);
    expect(createPreferences(storage).installDismissedAt()).toBe(1234);
    expect(storage.read(STORAGE_KEYS.installDismissedAt)).toBe(1234);
  });

  it('ignores stored values of the wrong shape', () => {
    const storage = createMemoryStorage();
    storage.write(STORAGE_KEYS.favorites, 'a');
    storage.write(STORAGE_KEYS.recent, [1, 2]);
    const preferences = createPreferences(storage);
    expect(preferences.favorites()).toEqual([]);
    expect(preferences.recent()).toEqual([]);
  });
});

describe('createBrowserStorage', () => {
  it('keeps values as JSON in localStorage', () => {
    const values = new Map();
    const localStorage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    };
    const storage = createBrowserStorage({ localStorage });
    storage.write('key', ['a']);
    expect(values.get('key')).toBe('["a"]');
    expect(storage.read('key')).toEqual(['a']);
    expect(storage.read('missing')).toBeNull();
  });

  it('carries on without saving when the browser refuses storage', () => {
    const refusing = {
      get localStorage() {
        throw new Error('SecurityError');
      },
    };
    const storage = createBrowserStorage(refusing);
    expect(() => storage.write('key', 1)).not.toThrow();
    expect(storage.read('key')).toBeNull();
    expect(createPreferences(storage).isSoundOn()).toBe(true);
  });
});
