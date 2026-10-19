import { describe, expect, it, vi } from 'vitest';
import { fetchCatalog } from '../../../src/home/catalog-client.js';
import { createHomeController } from '../../../src/home/home-controller.js';

const game = (id) => ({ id, title: `Game ${id}`, path: `games/${id}/` });

const fakeView = (columns = 2) => ({
  showLoading: vi.fn(),
  showError: vi.fn(),
  showShelf: vi.fn(),
  select: vi.fn(),
  countColumns: () => columns,
});

const setup = ({ games = [game('a'), game('b'), game('c')], columns } = {}) => {
  const view = fakeView(columns);
  const navigate = vi.fn();
  const loadGames = vi.fn(async () => games);
  const controller = createHomeController({ view, loadGames, navigate });
  return { view, navigate, loadGames, controller };
};

describe('createHomeController', () => {
  it('shows loading, then the shelf, then selects the first game', async () => {
    const { view, controller } = setup();
    await controller.load();
    expect(view.showLoading).toHaveBeenCalledOnce();
    expect(view.showShelf.mock.calls[0][0].cards).toHaveLength(3);
    expect(view.select).toHaveBeenCalledWith(0, expect.objectContaining({ id: 'a' }), {});
    expect(controller.selectedIndex()).toBe(0);
  });

  it('shows the error state when loading fails, and recovers on retry', async () => {
    const { view, controller, loadGames } = setup();
    loadGames.mockRejectedValueOnce(new Error('offline'));
    await controller.load();
    expect(view.showError).toHaveBeenCalledOnce();
    expect(controller.handleAction('start')).toBe(false);
    await controller.load();
    expect(view.showShelf).toHaveBeenCalledOnce();
  });

  it('moves the selection with the grid width and focuses the new card', async () => {
    const { view, controller } = setup({ columns: 2 });
    await controller.load();
    expect(controller.handleAction('down')).toBe(true);
    expect(controller.selectedIndex()).toBe(2);
    expect(view.select).toHaveBeenLastCalledWith(2, expect.objectContaining({ id: 'c' }), {
      focus: true,
    });
    controller.handleAction('right');
    expect(controller.selectedIndex()).toBe(0);
  });

  it('starts the selected game', async () => {
    const { navigate, controller } = setup();
    await controller.load();
    controller.select(1);
    controller.handleAction('start');
    expect(navigate).toHaveBeenCalledWith('games/b/');
  });

  it('ignores selections outside the list', async () => {
    const { controller } = setup();
    await controller.load();
    controller.select(7);
    controller.select(-1);
    expect(controller.selectedIndex()).toBe(0);
  });

  it('does nothing on input when the catalog is empty', async () => {
    const { navigate, controller } = setup({ games: [] });
    await controller.load();
    expect(controller.handleAction('start')).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
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
