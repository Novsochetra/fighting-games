import { describe, expect, it, vi } from 'vitest';
import { fetchCatalog } from '../../../src/home/catalog-client.js';
import { createHomeController } from '../../../src/home/home-controller.js';
import { createMemoryStorage, createPreferences } from '../../../src/home/preferences.js';

const game = (id) => ({ id, title: `Game ${id}`, path: `games/${id}/` });

const fakeView = () => ({
  showLoading: vi.fn(),
  showError: vi.fn(),
  showGames: vi.fn(),
  select: vi.fn(),
  revealHero: vi.fn(),
  spotlight: { setFavorite: vi.fn() },
  carousel: { nudge: vi.fn() },
  library: { render: vi.fn(), select: vi.fn() },
});

const setup = ({ games = [game('a'), game('b'), game('c')], recent = [] } = {}) => {
  const view = fakeView();
  const launcher = { launch: vi.fn(), isFlying: vi.fn(() => false) };
  const sound = { play: vi.fn() };
  const preferences = createPreferences(createMemoryStorage());
  recent.forEach((id) => preferences.recordPlay(id));
  const loadGames = vi.fn(async () => games);
  const controller = createHomeController({ view, loadGames, launcher, preferences, sound });
  return { view, launcher, sound, preferences, loadGames, controller };
};

const lastRender = (view) => view.library.render.mock.lastCall;

describe('createHomeController', () => {
  it('shows loading, then the games, then selects the first game without a sound', async () => {
    const { view, sound, controller } = setup();
    await controller.load();
    expect(view.showLoading).toHaveBeenCalledOnce();
    expect(view.showGames.mock.calls[0][0].map((card) => card.id)).toEqual([
      'a',
      'b',
      'c',
      'coming-soon-1',
      'coming-soon-2',
    ]);
    expect(view.select).toHaveBeenCalledWith(0, expect.objectContaining({ id: 'a' }), {
      animate: false,
      focus: null,
    });
    expect(controller.selectedIndex()).toBe(0);
    expect(sound.play).not.toHaveBeenCalled();
  });

  it('opens on the game played last', async () => {
    const { controller } = setup({ recent: ['c'] });
    await controller.load();
    expect(controller.selectedIndex()).toBe(2);
  });

  it('shows the error state when loading fails, and recovers on retry', async () => {
    const { view, controller, loadGames } = setup();
    loadGames.mockRejectedValueOnce(new Error('offline'));
    await controller.load();
    expect(view.showError).toHaveBeenCalledOnce();
    expect(controller.handleAction('start')).toBe(false);
    await controller.load();
    expect(view.showGames).toHaveBeenCalledOnce();
  });

  it('steps around the loop with a tick and a rise of the new title', async () => {
    const { view, sound, controller } = setup();
    await controller.load();
    expect(controller.handleAction('left', { focus: 'carousel' })).toBe(true);
    expect(controller.selectedIndex()).toBe(4);
    expect(view.select).toHaveBeenLastCalledWith(
      4,
      expect.objectContaining({ id: 'coming-soon-2' }),
      { animate: true, focus: 'carousel' },
    );
    expect(sound.play).toHaveBeenLastCalledWith('move');
    controller.handleAction('right');
    expect(controller.selectedIndex()).toBe(0);
  });

  it('leaves up and down to the page, which scrolls', async () => {
    const { controller } = setup();
    await controller.load();
    expect(controller.handleAction('up')).toBe(false);
    expect(controller.handleAction('down')).toBe(false);
    expect(controller.selectedIndex()).toBe(0);
  });

  it('launches the selected game with its sound and remembers it was played', async () => {
    const { launcher, sound, preferences, controller } = setup();
    await controller.load();
    controller.select(1);
    expect(controller.handleAction('start')).toBe(true);
    expect(launcher.launch).toHaveBeenCalledWith({
      index: 1,
      card: expect.objectContaining({ href: 'games/b/' }),
    });
    expect(sound.play).toHaveBeenLastCalledWith('launch');
    expect(preferences.recent()).toEqual(['b']);
  });

  it('opens nothing outside the list or while a game is already opening', async () => {
    const { launcher, controller } = setup();
    await controller.load();
    expect(controller.open(5)).toBe(false);
    expect(controller.open(-1)).toBe(false);
    launcher.isFlying.mockReturnValue(true);
    expect(controller.open(0)).toBe(false);
    expect(launcher.launch).not.toHaveBeenCalled();
  });

  it('refuses a teaser with a shake and a low knock, and remembers nothing', async () => {
    const { view, launcher, sound, preferences, controller } = setup();
    await controller.load();
    expect(controller.open(3)).toBe(false);
    expect(controller.selectedIndex()).toBe(3);
    expect(view.carousel.nudge).toHaveBeenCalledWith(3);
    expect(sound.play).toHaveBeenLastCalledWith('locked');
    expect(launcher.launch).not.toHaveBeenCalled();
    expect(preferences.recent()).toEqual([]);
    controller.toggleFavorite();
    expect(preferences.favorites()).toEqual([]);
  });

  it('ignores selections outside the list', async () => {
    const { controller } = setup();
    await controller.load();
    controller.select(7);
    controller.select(-1);
    controller.select(1.5);
    expect(controller.selectedIndex()).toBe(0);
  });

  it('does nothing on input when the catalog is empty', async () => {
    const { view, launcher, controller } = setup({ games: [] });
    await controller.load();
    expect(view.showGames).toHaveBeenCalledWith([]);
    expect(controller.handleAction('start')).toBe(false);
    expect(controller.handleAction('right')).toBe(false);
    expect(controller.step(1)).toBe(false);
    expect(launcher.launch).not.toHaveBeenCalled();
  });

  it('toggles the selected game as a favorite with a sound for each way', async () => {
    const { view, sound, preferences, controller } = setup();
    await controller.load();
    controller.toggleFavorite();
    expect(preferences.isFavorite('a')).toBe(true);
    expect(view.spotlight.setFavorite).toHaveBeenLastCalledWith(true, { pop: true });
    expect(sound.play).toHaveBeenLastCalledWith('favoriteOn');
    controller.toggleFavorite();
    expect(view.spotlight.setFavorite).toHaveBeenLastCalledWith(false, { pop: true });
    expect(sound.play).toHaveBeenLastCalledWith('favoriteOff');
  });

  it('filters the library with the segmented control, once per change', async () => {
    const { view, sound, controller } = setup();
    await controller.load();
    expect(lastRender(view)[1]).toBe('all');
    expect(controller.setFilter('favorites')).toBe(true);
    expect(lastRender(view)).toEqual([expect.objectContaining({ entries: [] }), 'favorites']);
    expect(sound.play).toHaveBeenLastCalledWith('segment');
    expect(controller.setFilter('favorites')).toBe(false);
    expect(controller.setFilter('playable')).toBe(false);
  });

  it('refreshes the favorites list as soon as a favorite changes', async () => {
    const { view, controller } = setup();
    await controller.load();
    controller.setFilter('favorites');
    controller.toggleFavorite();
    expect(lastRender(view)[0].entries.map(({ card }) => card.id)).toEqual(['a']);
  });

  it('selects a tile in the library and brings the hero back into view', async () => {
    const { view, sound, controller } = setup();
    await controller.load();
    controller.pickTile(2);
    expect(controller.selectedIndex()).toBe(2);
    expect(view.revealHero).toHaveBeenCalledOnce();
    expect(sound.play).toHaveBeenLastCalledWith('move');
  });
});

describe('fetchCatalog', () => {
  const reply = (status, body) => async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

  it('requests the relative api/games URL and returns its games', async () => {
    const fetchFn = vi.fn(reply(200, { games: [game('a')] }));
    expect(await fetchCatalog(fetchFn)).toEqual([game('a')]);
    expect(fetchFn).toHaveBeenCalledWith('api/games', expect.any(Object));
  });

  it('fails on an HTTP error', async () => {
    await expect(fetchCatalog(reply(500, {}))).rejects.toThrow('HTTP 500');
  });

  it('fails when the payload has no game list', async () => {
    await expect(fetchCatalog(reply(200, { items: [] }))).rejects.toThrow('did not return');
  });
});
