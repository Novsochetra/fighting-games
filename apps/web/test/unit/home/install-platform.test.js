import { describe, expect, it } from 'vitest';
import { browserInstaller } from '../../../src/home/install-platform.js';

function fakeWindow({ modes = [], standalone } = {}) {
  return {
    matchMedia: (query) => ({ matches: modes.some((mode) => query.includes(mode)) }),
    navigator: { platform: 'Linux armv8l', maxTouchPoints: 5, standalone },
  };
}

describe('browserInstaller', () => {
  it('sees the installed app by its display mode, or by Safari standalone', () => {
    expect(browserInstaller(fakeWindow()).isInstalled()).toBe(false);
    expect(browserInstaller(fakeWindow({ modes: ['standalone'] })).isInstalled()).toBe(true);
    expect(browserInstaller(fakeWindow({ modes: ['fullscreen'] })).isInstalled()).toBe(true);
    expect(browserInstaller(fakeWindow({ standalone: true })).isInstalled()).toBe(true);
  });
});
