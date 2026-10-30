// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  boot,
  bootWithSteelAndDust,
  byId,
  click,
  jsonReply,
  onPage,
  press,
  realCatalogJson,
  spotlightTitle,
  stopHomes,
  waitUntil,
} from '../../../support/home-harness.js';

const TRAILER = 'games/steel-and-dust/assets/trailer/trailer.mp4';

async function bootWithTrailer(options) {
  const { games } = JSON.parse(await realCatalogJson());
  const steelAndDust = games.find((game) => game.id === 'steel-and-dust');
  const base = { ...steelAndDust, trailer: TRAILER, trailerSmall: undefined };
  const plain = { ...base, id: 'plain', title: 'Plain', path: 'games/plain/', trailer: undefined };

  return boot(async () => jsonReply(JSON.stringify({ games: [base, plain] })), options);
}

const dialog = () => byId('details');
const video = () => byId('details-trailer');
const shows = (id) => byId(id) !== null && !byId(id).hidden;

const watchTrailer = () => {
  click(byId('details-open'));
  click(byId('details-trailer-open'));
};

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('a game’s trailer', () => {
  it('is in the details sheet, with no button of its own on the entry screen', async () => {
    await bootWithTrailer();
    expect(byId('trailer-open')).toBeNull();

    click(byId('details-open'));
    expect(shows('details-trailer-open')).toBe(true);
    expect(byId('details-trailer-open').getAttribute('aria-label')).toBe(
      'Watch the Steel & Dust trailer',
    );
  });

  it('plays in place of the sheet’s art, with no controls over it', async () => {
    await bootWithTrailer();
    click(byId('details-open'));
    expect(byId('details-art')).not.toBeNull();
    expect(video()).toBeNull();

    click(byId('details-trailer-open'));
    expect(dialog().open).toBe(true);
    expect(video().getAttribute('src')).toBe(onPage(TRAILER));
    expect(video().getAttribute('poster')).toBe(
      onPage('games/steel-and-dust/assets/screenshots/angkor-wat.png'),
    );
    expect(video().hasAttribute('controls')).toBe(false);
    expect(video().muted).toBe(false);
    expect(byId('details-art')).toBeNull();
  });

  it('leaves with the sheet, which shows the art again the next time', async () => {
    await bootWithTrailer();
    watchTrailer();
    const playing = video();

    click(byId('details-close'));
    await waitUntil(() => expect(dialog().open).toBe(false));
    expect(video()).toBeNull();
    expect(playing.hasAttribute('src')).toBe(false);

    click(byId('details-open'));
    expect(byId('details-art')).not.toBeNull();
    expect(shows('details-trailer-open')).toBe(true);
  });

  it('pauses on a tap and plays on with the next', async () => {
    await bootWithTrailer();
    watchTrailer();
    const playing = video();
    const pause = vi.spyOn(playing, 'pause');
    const play = vi.spyOn(playing, 'play');

    Object.defineProperty(playing, 'paused', { configurable: true, value: false });
    click(playing);
    expect(pause).toHaveBeenCalled();

    Object.defineProperty(playing, 'paused', { configurable: true, value: true });
    click(playing);
    expect(play).toHaveBeenCalled();
  });

  it('plays muted for a player who turned the arcade’s sound off', async () => {
    const { home } = await bootWithTrailer();

    home.preferences.setSound(false);
    watchTrailer();

    expect(video().muted).toBe(true);
  });

  it('is not offered for a game without one', async () => {
    await bootWithTrailer();
    press('ArrowRight');
    await waitUntil(() => expect(spotlightTitle()).toBe('Plain'));
    click(byId('details-open'));

    expect(byId('details-trailer-open')).toBeNull();
    expect(byId('details-art')).not.toBeNull();
  });

  it('gives way to the game when Play is pressed under it', async () => {
    const { navigate } = await bootWithTrailer();
    watchTrailer();
    click(byId('details-play'));

    expect(dialog().open).toBe(false);
    expect(video()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('games/steel-and-dust/');
  });
});

describe('Steel & Dust’s trailer, from its CDN', () => {
  const CDN = 'https://dphwn49s8chpb.cloudfront.net/promo-videos/';

  it('plays the full trailer on a wide screen', async () => {
    await bootWithSteelAndDust();
    watchTrailer();

    expect(video().getAttribute('src')).toBe(`${CDN}steel-and-dust-trailer.mp4`);
  });

  it('plays the small copy on a phone, so it costs a phone less data', async () => {
    const wide = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
      query === '(max-width: 40rem)' ? { ...wide(query), matches: true } : wide(query),
    );
    await bootWithSteelAndDust();
    watchTrailer();

    expect(video().getAttribute('src')).toBe(`${CDN}steel-and-dust-trailer-480.mp4`);
  });
});

describe('Morodok Angkor’s promo video, from the CDN', () => {
  const PROMO = 'https://dphwn49s8chpb.cloudfront.net/promo-videos/morodok-angkor.mp4';

  async function watchMorodokAngkor() {
    const { games } = JSON.parse(await realCatalogJson());
    const body = JSON.stringify({ games: games.filter((game) => game.id === 'morodok-angkor') });
    await boot(async () => jsonReply(body));
    watchTrailer();
  }

  it('plays as the trailer of a game hosted on its own site', async () => {
    await watchMorodokAngkor();

    expect(video().getAttribute('src')).toBe(PROMO);
  });

  it('plays the same copy on a phone, as it has no small one', async () => {
    const wide = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
      query === '(max-width: 40rem)' ? { ...wide(query), matches: true } : wide(query),
    );
    await watchMorodokAngkor();

    expect(video().getAttribute('src')).toBe(PROMO);
  });
});
