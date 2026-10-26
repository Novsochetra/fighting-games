// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../../../src/home/preferences.js';
import {
  clearBannerClasses,
  createFakeAnalytics,
  sentEvents,
  storageWithConsent,
} from '../../support/fake-analytics.js';
import { createFakeInstaller, offerInstall, installApp } from '../../support/fake-installer.js';
import {
  bootWithGames,
  bootWithRealCatalog,
  bootWithSteelAndDust,
  byId,
  click,
  press,
  realCatalogJson,
  stopHomes,
} from '../../support/home-harness.js';

// A player who said yes before, so every event goes out from the first tap.
async function bootCounted(bootFn = bootWithRealCatalog, options = {}) {
  const { tag, setup } = createFakeAnalytics();
  const storage = options.storage ?? storageWithConsent('granted');
  const started = await bootFn({ ...options, storage, analytics: setup });
  return { ...started, tag };
}

// The links lead to other pages, which happy-dom would try to load.
const stayOnPage = (event) => event.preventDefault();

beforeEach(async () => {
  document.body.innerHTML = '';
  clearBannerClasses();
  window.addEventListener('click', stayOnPage);
});

afterEach(() => {
  window.removeEventListener('click', stayOnPage);
  stopHomes();
});

describe('the home page events', () => {
  it('count a play from the Play button, with the game', async () => {
    const { tag } = await bootCounted();
    const gameId = JSON.parse(await realCatalogJson()).games[0].id;
    click(byId('play'));
    expect(sentEvents(tag)).toContainEqual([
      'play_game',
      { game_id: gameId, source: 'play_button' },
    ]);
  });

  it('count a play from the keyboard', async () => {
    const { tag } = await bootCounted(bootWithSteelAndDust);
    press('Enter');
    expect(sentEvents(tag)).toContainEqual([
      'play_game',
      { game_id: 'steel-and-dust', source: 'keyboard' },
    ]);
  });

  it('count a tap on a Coming Soon card', async () => {
    const { tag } = await bootCounted(bootWithSteelAndDust);
    press('ArrowRight');
    press('Enter');
    expect(sentEvents(tag)).toContainEqual(['tap_coming_soon', { card_id: 'coming-soon-1' }]);
  });

  it('count Details, the heart and the library', async () => {
    const ids = Array.from({ length: 10 }, (_, i) => `game-${i}`);
    const { tag } = await bootCounted((options) => bootWithGames(ids, options));
    click(byId('details-open'));
    click(byId('details-close'));
    click(byId('favorite'));
    click(document.querySelector('[data-value="recent"]'));
    click(document.querySelector('[data-value="all"]'));
    click(byId('show-more'));
    expect(sentEvents(tag)).toEqual([
      ['view_game_details', { game_id: 'game-0' }],
      ['favorite_game', { game_id: 'game-0', favorite: 'on' }],
      ['filter_library', { filter: 'recent' }],
      ['filter_library', { filter: 'all' }],
      ['show_more_games', {}],
    ]);
  });

  it('count the sound and appearance switches', async () => {
    const { tag, home } = await bootCounted();
    click(byId('sound-toggle'));
    click(byId('appearance-toggle'));
    expect(sentEvents(tag)).toEqual([
      ['toggle_sound', { sound: 'off' }],
      ['toggle_appearance', { appearance: home.appearance.current() }],
    ]);
  });

  it('count each way to the supporters page, and to the credits', async () => {
    const { tag } = await bootCounted();
    click(byId('supporters-link'));
    click(document.querySelector('.support-callout__link'));
    click(byId('credits-link'));
    expect(sentEvents(tag)).toEqual([
      ['open_supporters', { placement: 'top_bar' }],
      ['open_supporters', { placement: 'library' }],
      ['open_credits', {}],
    ]);
  });

  it('count the coffee button, its note and each way to give from its sheet', async () => {
    const { tag } = await bootCounted();
    click(byId('coffee-open'));
    click(byId('coffee-khqr'));
    click(byId('coffee-note-open'));
    click(byId('coffee-bmc'));
    expect(sentEvents(tag)).toEqual([
      ['open_coffee_sheet', { placement: 'button' }],
      ['open_supporters', { placement: 'coffee_sheet' }],
      ['open_coffee_sheet', { placement: 'note' }],
      ['open_buy_me_a_coffee', {}],
    ]);
  });

  it('count the install banner from offer to install', async () => {
    const installer = createFakeInstaller();
    const { tag } = await bootCounted(bootWithRealCatalog, { installer });
    const prompt = offerInstall(installer);
    click(byId('install-add'));
    await prompt.userChoice;
    await Promise.resolve();
    installApp(installer);
    expect(sentEvents(tag)).toEqual([
      ['install_banner_shown', { offer: 'prompt' }],
      ['install_click', {}],
      ['install_choice', { outcome: 'accepted' }],
      ['app_installed', {}],
    ]);
  });

  it('count the install and support banners turned down', async () => {
    const storage = storageWithConsent('granted');
    storage.write(STORAGE_KEYS.plays, 3);
    storage.write(STORAGE_KEYS.supportSeenPlays, 2);
    const installer = createFakeInstaller({ isIos: true });
    const { tag } = await bootCounted(bootWithRealCatalog, { installer, storage });
    click(byId('install-close'));
    expect(sentEvents(tag)).toEqual([
      ['install_banner_shown', { offer: 'ios' }],
      ['install_dismiss', {}],
    ]);

    stopHomes();
    storage.write(STORAGE_KEYS.supportSeenPlays, 2);
    const again = await bootCounted(bootWithRealCatalog, { installer, storage });
    click(byId('support-give'));
    click(byId('support-close'));
    expect(sentEvents(again.tag)).toEqual([
      ['support_banner_shown', {}],
      ['open_supporters', { placement: 'banner' }],
      ['support_dismiss', {}],
    ]);
  });
});
