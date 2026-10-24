// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CUES } from '../../../src/home/sound-cues.js';
import { STORAGE_KEYS, createMemoryStorage } from '../../../src/home/preferences.js';
import { createFakeAudioContext } from '../../support/fake-audio.js';
import {
  bootWithGames,
  byId,
  click,
  loadHomeMarkup,
  press,
  stopHomes,
} from '../../support/home-harness.js';

const setup = async (storage = createMemoryStorage()) => {
  const context = createFakeAudioContext();
  const createAudioContext = vi.fn(() => context);
  const started = await bootWithGames(['alpha', 'bravo', 'charlie'], {
    storage,
    createAudioContext,
  });
  return { ...started, context, createAudioContext, storage };
};

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('sound effects', () => {
  it('stays silent and makes no audio context until the visitor does something', async () => {
    const { createAudioContext } = await setup();
    expect(createAudioContext).not.toHaveBeenCalled();
    expect(byId('sound-toggle').getAttribute('aria-pressed')).toBe('true');
  });

  it('ticks as the carousel moves, and plays the launch chime on Play', async () => {
    const { context } = await setup();
    press('ArrowRight');
    expect(context.started).toHaveLength(CUES.switch.length);
    click(byId('play'));
    expect(context.started).toHaveLength(CUES.switch.length + CUES.launch.length);
  });

  it('plays a cue for the heart, the segmented control and the details sheet', async () => {
    const { context } = await setup();
    click(byId('favorite'));
    click(document.querySelector('[data-filter="recent"]'));
    click(byId('details-open'));
    click(byId('details-close'));
    const expected = ['favoriteOn', 'switch', 'sheetOpen', 'sheetClose'];
    const voices = expected.reduce((sum, name) => sum + CUES[name].length, 0);
    expect(context.started).toHaveLength(voices);
  });

  it('goes quiet when switched off, remembers it, and chimes when switched back on', async () => {
    const { context, storage } = await setup();
    click(byId('sound-toggle'));
    expect(byId('sound-toggle').getAttribute('aria-pressed')).toBe('false');
    expect(storage.read(STORAGE_KEYS.sound)).toBe(false);
    press('ArrowRight');
    expect(context.started).toHaveLength(0);
    click(byId('sound-toggle'));
    expect(context.started).toHaveLength(CUES.soundOn.length);
  });

  it('starts muted when the visitor muted it last time', async () => {
    const storage = createMemoryStorage();
    storage.write(STORAGE_KEYS.sound, false);
    const { createAudioContext } = await setup(storage);
    expect(byId('sound-toggle').getAttribute('aria-pressed')).toBe('false');
    press('ArrowRight');
    expect(createAudioContext).not.toHaveBeenCalled();
  });
});
