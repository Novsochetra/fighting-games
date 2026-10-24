import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import {
  APPEARANCE_KEY,
  createAppearance,
  resolveAppearance,
  systemAppearance,
} from '../../../src/home/appearance.js';
import { createMemoryStorage } from '../../../src/home/preferences.js';

const SAVED_CASES = [
  [null, 'dark', 'dark'],
  [null, 'light', 'light'],
  [{ choice: 'light', system: 'dark' }, 'dark', 'light'],
  [{ choice: 'dark', system: 'light' }, 'light', 'dark'],
  [{ choice: 'light', system: 'dark' }, 'light', 'light'],
  [{ choice: 'dark', system: 'light' }, 'dark', 'dark'],
  [{ choice: 'sepia', system: 'dark' }, 'dark', 'dark'],
  ['light', 'dark', 'dark'],
];

function fakeWindow({ light = false, localStorage } = {}) {
  const device = { light };
  const listeners = [];
  const query = {
    get matches() {
      return device.light;
    },
    addEventListener: (type, listener) => listeners.push(listener),
  };
  return {
    matchMedia: vi.fn(() => query),
    localStorage,
    setLight: (isLight) => {
      device.light = isLight;
      listeners.forEach((listener) => listener());
    },
  };
}

function fakeDocument(window) {
  const meta = { setAttribute: vi.fn() };
  const document = {
    documentElement: { dataset: {} },
    defaultView: {
      ...window,
      getComputedStyle: () => ({
        getPropertyValue: () =>
          document.documentElement.dataset.appearance === 'light' ? 'white' : 'black',
      }),
    },
    querySelector: () => meta,
  };
  return { document, meta };
}

describe('resolveAppearance', () => {
  it.each(SAVED_CASES)('with %j saved and the device %s, shows %s', (saved, system, expected) => {
    expect(resolveAppearance(saved, system)).toBe(expected);
  });
});

describe('appearance-early.js, the script in the head', () => {
  const run = async ({ stored, light, throws = false }) => {
    const code = await readFile(path.join(WEB_ROOT, 'src/home/appearance-early.js'), 'utf8');
    const localStorage = {
      getItem: (key) => {
        if (throws) {
          throw new Error('SecurityError');
        }
        return key === APPEARANCE_KEY ? stored : null;
      },
    };
    const window = fakeWindow({ light, localStorage });
    const document = { documentElement: { dataset: {} } };
    new Function('document', 'window', code)(document, window);
    return document.documentElement.dataset.appearance;
  };

  it.each(SAVED_CASES)('agrees with resolveAppearance for %j and %s', async (saved, system) => {
    const shown = await run({ stored: JSON.stringify(saved), light: system === 'light' });
    expect(shown).toBe(resolveAppearance(saved, system));
  });

  it('follows the device when storage is refused or holds no JSON', async () => {
    expect(await run({ light: true, throws: true })).toBe('light');
    expect(await run({ stored: '{oops', light: false })).toBe('dark');
  });
});

describe('createAppearance', () => {
  const setup = ({ light = false, saved = null } = {}) => {
    const storage = createMemoryStorage();
    storage.write(APPEARANCE_KEY, saved);
    const window = fakeWindow({ light });
    const { document, meta } = fakeDocument(window);
    const appearance = createAppearance({ document, storage });
    return { appearance, document, meta, storage, window };
  };

  it("starts in the device's appearance and colors the browser bar to match", () => {
    const { appearance, document, meta } = setup({ light: true });
    expect(appearance.current()).toBe('light');
    expect(document.documentElement.dataset.appearance).toBe('light');
    expect(meta.setAttribute).toHaveBeenCalledWith('content', 'white');
  });

  it('flips with the switch and keeps the choice with the device appearance it was made under', () => {
    const { appearance, storage, meta } = setup({ light: false });
    expect(appearance.toggle()).toBe('light');
    expect(storage.read(APPEARANCE_KEY)).toEqual({ choice: 'light', system: 'dark' });
    expect(meta.setAttribute).toHaveBeenLastCalledWith('content', 'white');
    expect(appearance.toggle()).toBe('dark');
    expect(storage.read(APPEARANCE_KEY)).toBeNull();
  });

  it('cross-fades through a view transition where the browser has one', () => {
    const { appearance, document } = setup();
    document.startViewTransition = vi.fn((update) => update());
    appearance.toggle();
    expect(document.startViewTransition).toHaveBeenCalledOnce();
    expect(appearance.current()).toBe('light');
    appearance.toggle({ smooth: false });
    expect(document.startViewTransition).toHaveBeenCalledOnce();
  });

  it('lets go of the switch and follows the device once the device changes', () => {
    const { appearance, storage, window } = setup({ saved: { choice: 'light', system: 'dark' } });
    expect(appearance.current()).toBe('light');
    window.setLight(true);
    expect(storage.read(APPEARANCE_KEY)).toBeNull();
    window.setLight(false);
    expect(appearance.current()).toBe('dark');
  });

  it('reads dark from a browser that cannot tell', () => {
    expect(systemAppearance({})).toBe('dark');
  });
});
