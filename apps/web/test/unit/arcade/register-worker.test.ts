import { describe, expect, it, vi } from 'vitest';
import { registerWorker } from '../../../src/arcade/register-worker';

const windowWith = (serviceWorker?: { register: () => Promise<unknown> }) =>
  ({ navigator: { serviceWorker } }) as unknown as Window;

describe('registerWorker', () => {
  it('registers the worker at the arcade’s root, so it covers the arcade and every game', () => {
    const register = vi.fn(async () => ({}));

    registerWorker(windowWith({ register }), new URL('https://arcade.test/'));

    expect(register).toHaveBeenCalledWith(new URL('https://arcade.test/sw.js'));
  });

  it('leaves a browser without workers, or one that refuses it, to the network', async () => {
    const refused = vi.fn(async () => {
      throw new TypeError('Failed to register a ServiceWorker');
    });

    expect(() => registerWorker(windowWith(), new URL('https://arcade.test/'))).not.toThrow();
    registerWorker(windowWith({ register: refused }), new URL('https://arcade.test/'));
    await expect(refused.mock.results[0]!.value).rejects.toThrow();
  });
});
