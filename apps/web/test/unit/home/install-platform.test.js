import { describe, expect, it, vi } from 'vitest';
import { browserInstaller } from '../../../src/home/install-platform.js';

function fakeWindow({ modes = [], standalone, canPrompt = true, register } = {}) {
  const window = {
    matchMedia: (query) => ({ matches: modes.some((mode) => query.includes(mode)) }),
    navigator: {
      platform: 'Linux armv8l',
      maxTouchPoints: 5,
      standalone,
      serviceWorker: register ? { register } : undefined,
    },
  };
  if (canPrompt) {
    window.onbeforeinstallprompt = null;
  }
  return window;
}

describe('browserInstaller', () => {
  it('sees the installed app by its display mode, or by Safari standalone', () => {
    expect(browserInstaller(fakeWindow()).isInstalled()).toBe(false);
    expect(browserInstaller(fakeWindow({ modes: ['standalone'] })).isInstalled()).toBe(true);
    expect(browserInstaller(fakeWindow({ modes: ['fullscreen'] })).isInstalled()).toBe(true);
    expect(browserInstaller(fakeWindow({ standalone: true })).isInstalled()).toBe(true);
  });

  it('registers the service worker next to the page where the browser can prompt', async () => {
    const register = vi.fn(async () => ({ scope: 'http://localhost/' }));
    const installer = browserInstaller(fakeWindow({ register }));
    await expect(installer.registerWorker()).resolves.toEqual({ scope: 'http://localhost/' });
    expect(register).toHaveBeenCalledWith('sw.js');
  });

  it('leaves the worker out of browsers without an install prompt', async () => {
    const register = vi.fn(async () => ({}));
    const installer = browserInstaller(fakeWindow({ register, canPrompt: false }));
    await expect(installer.registerWorker()).resolves.toBeNull();
    expect(register).not.toHaveBeenCalled();
  });

  it('carries on when the browser refuses the worker', async () => {
    const register = vi.fn(async () => {
      throw new TypeError('Failed to register a ServiceWorker');
    });
    await expect(browserInstaller(fakeWindow({ register })).registerWorker()).resolves.toBeNull();
    await expect(browserInstaller(fakeWindow()).registerWorker()).resolves.toBeNull();
  });
});
