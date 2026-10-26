// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage, STORAGE_KEYS } from '../../../src/home/preferences.js';
import { CUES } from '../../../src/home/sound-cues.js';
import { createFakeAudioContext } from '../../support/fake-audio.js';
import {
  createFakeInstaller,
  DAY_MS,
  offerInstall,
  installApp,
} from '../../support/fake-installer.js';
import { bootWithRealCatalog, byId, click, onPage, stopHomes } from '../../support/home-harness.js';

const banner = () => byId('install');
const offer = () => (banner().hidden ? null : banner().dataset.offer);

beforeEach(async () => {
  document.body.innerHTML = '';
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('the install banner', () => {
  it('stays hidden until the browser can install the arcade, then offers Install', async () => {
    const installer = createFakeInstaller();
    await bootWithRealCatalog({ installer });
    expect(offer()).toBeNull();

    const prompt = offerInstall(installer);
    expect(prompt.defaultPrevented).toBe(true);
    expect(offer()).toBe('prompt');
    expect(banner().querySelector('.install__icon').getAttribute('src')).toBe(
      onPage('assets/icons/icon-192.png'),
    );
  });

  it('opens the browser install dialog from Install, with the sheet sound', async () => {
    const installer = createFakeInstaller();
    const storage = createMemoryStorage();
    const context = createFakeAudioContext();
    await bootWithRealCatalog({ installer, storage, createAudioContext: vi.fn(() => context) });
    const prompt = offerInstall(installer, 'accepted');

    click(byId('install-add'));
    expect(prompt.prompt).toHaveBeenCalledOnce();
    expect(offer()).toBeNull();
    expect(context.started).toHaveLength(CUES.sheetOpen.length);
    await prompt.userChoice;
    expect(storage.read(STORAGE_KEYS.installDismissedAt)).toBeNull();

    installApp(installer);
    expect(offer()).toBeNull();
  });

  it('waits two weeks after the install dialog is turned down', async () => {
    const installer = createFakeInstaller();
    const storage = createMemoryStorage();
    await bootWithRealCatalog({ installer, storage });
    const prompt = offerInstall(installer, 'dismissed');
    click(byId('install-add'));
    await prompt.userChoice;
    await Promise.resolve();
    expect(storage.read(STORAGE_KEYS.installDismissedAt)).toBe(installer.clock.time);

    stopHomes();
    await bootWithRealCatalog({ installer, storage });
    offerInstall(installer);
    expect(offer()).toBeNull();
  });

  it('closes on Not now and comes back two weeks later', async () => {
    const installer = createFakeInstaller();
    const storage = createMemoryStorage();
    await bootWithRealCatalog({ installer, storage });
    offerInstall(installer);
    click(byId('install-close'));
    expect(offer()).toBeNull();

    stopHomes();
    installer.clock.time += 13 * DAY_MS;
    await bootWithRealCatalog({ installer, storage });
    offerInstall(installer);
    expect(offer()).toBeNull();

    stopHomes();
    installer.clock.time += 2 * DAY_MS;
    await bootWithRealCatalog({ installer, storage });
    offerInstall(installer);
    expect(offer()).toBe('prompt');
  });

  it('tells iPhone visitors to add it from the Share menu', async () => {
    await bootWithRealCatalog({ installer: createFakeInstaller({ isIos: true }) });
    expect(offer()).toBe('ios');
    expect(banner().querySelector('.install__hint--ios').textContent).toContain(
      'Add to Home Screen',
    );
  });

  it('never shows inside the installed app', async () => {
    const installer = createFakeInstaller({ isIos: true, isInstalled: true });
    await bootWithRealCatalog({ installer });
    offerInstall(installer);
    expect(offer()).toBeNull();
  });

  it('is left out when the page boots without an installer', async () => {
    await bootWithRealCatalog();
    expect(offer()).toBeNull();
  });
});
