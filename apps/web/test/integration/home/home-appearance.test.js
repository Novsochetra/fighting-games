// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { APPEARANCE_KEY } from '../../../src/home/appearance.js';
import { createMemoryStorage } from '../../../src/home/preferences.js';
import { CUES } from '../../../src/home/sound-cues.js';
import { createFakeAudioContext } from '../../support/fake-audio.js';
import { bootWithRealCatalog, byId, click, stopHomes } from '../../support/home-harness.js';

const appearance = () => document.documentElement.dataset.appearance;

// A device in dark mode that allows motion; happy-dom alone reports light.
beforeEach(async () => {
  document.body.innerHTML = '';
  delete document.documentElement.dataset.appearance;
  vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
    matches: false,
    addEventListener: () => {},
  }));
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('light and dark appearance', () => {
  it('picks the appearance in the head, before any stylesheet or the body is drawn', async () => {
    const html = await readFile(path.join(WEB_ROOT, 'index.html'), 'utf8');
    const early = html.indexOf('<script src="src/home/appearance-early.js"></script>');
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(html.search(/<link\s+rel="stylesheet"/));
    expect(early).toBeLessThan(html.indexOf('<script type="module"'));
    expect(html).toContain('<meta name="color-scheme" content="dark light" />');
  });

  it('switches between dark and light from the top bar, with a soft chime', async () => {
    const storage = createMemoryStorage();
    const context = createFakeAudioContext();
    await bootWithRealCatalog({ storage, createAudioContext: vi.fn(() => context) });
    const toggle = byId('appearance-toggle');
    expect(appearance()).toBe('dark');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    click(toggle);
    expect(appearance()).toBe('light');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(storage.read(APPEARANCE_KEY)).toEqual({ choice: 'light', system: 'dark' });
    expect(context.started).toHaveLength(CUES.appearance.length);

    click(toggle);
    expect(appearance()).toBe('dark');
    expect(storage.read(APPEARANCE_KEY)).toBeNull();
  });

  it('keeps the switch for the next visit while the device stays as it was', async () => {
    const storage = createMemoryStorage();
    storage.write(APPEARANCE_KEY, { choice: 'light', system: 'dark' });
    await bootWithRealCatalog({ storage });
    expect(appearance()).toBe('light');
    expect(byId('appearance-toggle').getAttribute('aria-pressed')).toBe('false');
  });
});
