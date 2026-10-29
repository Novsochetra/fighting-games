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
} from '../../support/home-harness.js';

const TRAILER = 'games/steel-and-dust/assets/trailer/trailer.mp4';

// Steel & Dust with its trailer, then a game without one.
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

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('a game’s trailer', () => {
  it('has a Trailer button in the hero only for a game that has one', async () => {
    await bootWithTrailer();
    expect(shows('trailer-open')).toBe(true);
    expect(byId('trailer-open').getAttribute('aria-label')).toBe('Watch the Steel & Dust trailer');

    press('ArrowRight');
    await waitUntil(() => expect(spotlightTitle()).toBe('Plain'));
    await waitUntil(() => expect(shows('trailer-open')).toBe(false));
  });

  it('plays in the details sheet from the hero, in place of its art', async () => {
    await bootWithTrailer();
    click(byId('trailer-open'));

    expect(dialog().open).toBe(true);
    expect(byId('details-title').textContent).toBe('Steel & Dust');
    expect(video().getAttribute('src')).toBe(onPage(TRAILER));
    expect(video().getAttribute('poster')).toBe(
      onPage('games/steel-and-dust/assets/screenshots/angkor-wat.png'),
    );
    expect(video().controls).toBe(true);
    expect(video().muted).toBe(false);
    expect(byId('details-art')).toBeNull();
  });

  it('starts from the Trailer button on the art of the details sheet', async () => {
    await bootWithTrailer();
    click(byId('details-open'));
    expect(byId('details-art')).not.toBeNull();
    expect(video()).toBeNull();

    click(byId('details-trailer-open'));
    expect(video().getAttribute('src')).toBe(onPage(TRAILER));
    expect(dialog().open).toBe(true);
  });

  it('leaves with the sheet, which shows the art again the next time', async () => {
    await bootWithTrailer();
    click(byId('trailer-open'));
    const playing = video();

    click(byId('details-close'));
    await waitUntil(() => expect(dialog().open).toBe(false));
    expect(video()).toBeNull();
    expect(playing.hasAttribute('src')).toBe(false);

    click(byId('details-open'));
    expect(byId('details-art')).not.toBeNull();
    expect(shows('details-trailer-open')).toBe(true);
  });

  it('plays muted for a player who turned the arcade’s sound off', async () => {
    const { home } = await bootWithTrailer();

    home.preferences.setSound(false);
    click(byId('trailer-open'));

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
    click(byId('trailer-open'));
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
    click(byId('trailer-open'));

    expect(video().getAttribute('src')).toBe(`${CDN}steel-and-dust-trailer.mp4`);
  });

  it('plays the small copy on a phone, so it costs a phone less data', async () => {
    const wide = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
      query === '(max-width: 40rem)' ? { ...wide(query), matches: true } : wide(query),
    );
    await bootWithSteelAndDust();
    click(byId('trailer-open'));

    expect(video().getAttribute('src')).toBe(`${CDN}steel-and-dust-trailer-480.mp4`);
  });
});
