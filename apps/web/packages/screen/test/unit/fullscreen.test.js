import { describe, expect, it, vi } from 'vitest';
import { createFullscreen, installFullscreen } from '../../src/fullscreen.js';

function fakeDocument({ request = vi.fn(async () => {}) } = {}) {
  const listeners = {};
  return {
    listeners,
    documentElement: { requestFullscreen: request },
    fullscreenElement: null,
    exitFullscreen: vi.fn(),
    addEventListener: (type, listener) => {
      listeners[type] = listener;
    },
  };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('full screen', () => {
  it('goes full screen without the browser’s bar, and locks a phone to landscape', async () => {
    const document = fakeDocument();
    const screen = { orientation: { lock: vi.fn(async () => {}) } };
    const fullscreen = createFullscreen({ document, screen, lockLandscape: () => true });

    fullscreen.enter();
    await settle();

    expect(document.documentElement.requestFullscreen).toHaveBeenCalledWith({
      navigationUI: 'hide',
    });
    expect(screen.orientation.lock).toHaveBeenCalledWith('landscape');
  });

  it('leaves the orientation alone when asked to, and comes out of full screen on a toggle', async () => {
    const document = fakeDocument();
    const screen = { orientation: { lock: vi.fn(async () => {}) } };
    const fullscreen = createFullscreen({ document, screen });

    fullscreen.toggle();
    await settle();
    expect(screen.orientation.lock).not.toHaveBeenCalled();
    document.fullscreenElement = document.documentElement;
    expect(fullscreen.isActive()).toBe(true);
    fullscreen.toggle();
    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('says so where the browser has none, as Safari on iPhone, and does nothing', () => {
    const document = fakeDocument({ request: null });
    const fullscreen = createFullscreen({ document, screen: {} });

    expect(fullscreen.supported).toBe(false);
    expect(() => fullscreen.enter()).not.toThrow();
  });

  it('swallows a browser that refuses, or a lock it does not allow', async () => {
    const refusing = fakeDocument({ request: vi.fn(async () => Promise.reject(new Error('no'))) });
    const throwing = fakeDocument({
      request: () => {
        throw new TypeError('not allowed');
      },
    });
    const screen = { orientation: { lock: vi.fn(async () => Promise.reject(new Error('no'))) } };

    expect(() => createFullscreen({ document: refusing, screen }).enter()).not.toThrow();
    expect(() => createFullscreen({ document: throwing, screen }).enter()).not.toThrow();
    await settle();
  });

  it('toggles on F, not with a modifier or a held key, and tells of every change', () => {
    const document = fakeDocument();
    const window = {
      addEventListener: (type, listener) => (document.listeners.keydown = listener),
    };
    const fullscreen = { toggle: vi.fn() };
    const changed = vi.fn();

    installFullscreen({ window, document, fullscreen, changed });
    document.listeners.keydown({ code: 'KeyF', repeat: false });
    document.listeners.keydown({ code: 'KeyF', repeat: true });
    document.listeners.keydown({ code: 'KeyF', ctrlKey: true });
    document.listeners.fullscreenchange();
    document.listeners.webkitfullscreenchange();

    expect(fullscreen.toggle).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledTimes(2);
  });
});
