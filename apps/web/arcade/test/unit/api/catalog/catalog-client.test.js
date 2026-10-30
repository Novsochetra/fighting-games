import { describe, expect, it, vi } from 'vitest';
import { fetchCatalog } from '@/api/catalog/catalog-client.js';

const reply = (status, body) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const game = (id) => ({ id, title: id, path: `games/${id}/` });

describe('fetchCatalog', () => {
  it('requests the address it is given and returns its games', async () => {
    const fetchFn = vi.fn(reply(200, { games: [game('a')] }));

    expect(await fetchCatalog(fetchFn, 'https://arcade.test/api/games')).toEqual([game('a')]);
    expect(fetchFn).toHaveBeenCalledWith('https://arcade.test/api/games', expect.any(Object));
  });

  it('fails on an HTTP error', async () => {
    await expect(fetchCatalog(reply(500, {}))).rejects.toThrow('HTTP 500');
  });

  it('fails when the payload has no game list', async () => {
    await expect(fetchCatalog(reply(200, { items: [] }))).rejects.toThrow('did not return');
  });
});
