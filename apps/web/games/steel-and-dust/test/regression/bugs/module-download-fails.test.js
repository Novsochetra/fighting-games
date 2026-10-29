// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { RETRY_AFTER_MS, STALL_MS, watchBoot } from '../../../src/boot/boot-recovery.js';
import { fakeBootWindow } from '../../support/boot-window.js';
import { PAGE } from '../../support/boot-page.js';

const GAME = 'https://example.com/games/steel-and-dust/';
const BOOT = join(import.meta.dirname, '../../../src/boot');
const importsOf = (file) =>
  [...readFileSync(join(BOOT, file), 'utf8').matchAll(/from '([^']+)'/g)].map((match) => match[1]);

// Bug: one of the game's modules that failed to come down (a dropped connection, a phone that put
// the home-screen app to sleep while it loaded, an answer the worker could not give) left the
// loading screen at 97% for good. The browser fires that error at the module's own <script>, and it
// never bubbles, so the window boot-recovery listened on never heard it and nothing reloaded.
const watches = [];

// the page's own events, as the browser sends them down to the window, at an address it can reload
function bootPage() {
  const page = fakeBootWindow(GAME);
  const script = document.createElement('script');

  page.addEventListener = (...listening) => window.addEventListener(...listening);
  page.removeEventListener = (...listening) => window.removeEventListener(...listening);
  script.type = 'module';
  script.src = 'src/main.js';
  document.head.append(script);
  watches.push(watchBoot(page));

  return { page, script };
}

afterEach(() => {
  watches.splice(0).forEach((watch) => watch.started());
  document.head.replaceChildren();
});

describe('a game module that fails to come down', () => {
  it('reloads the page under a fresh address', () => {
    const { page, script } = bootPage();

    script.dispatchEvent(new Event('error'));
    page.advance(RETRY_AFTER_MS);

    expect(page.replaced).toHaveLength(1);
    expect(new URL(page.replaced[0]).searchParams.get('fresh')).toBe('1');
  });

  it('leaves the page be when only an image fails, which the loading screen goes on without', () => {
    const { page } = bootPage();
    const art = document.createElement('img');

    document.body.append(art);
    art.dispatchEvent(new Event('error'));
    page.advance(RETRY_AFTER_MS);

    expect(page.replaced).toEqual([]);
  });

  // the loading screen's own modules failing left it at 0%, as the watch was one of them
  it('is watched before any other script of the page loads, from files that load nothing more', () => {
    const scripts = [...PAGE.matchAll(/<script type="module" src="([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(scripts[0]).toBe('src/boot/boot-watch.js');
    expect(importsOf('boot-watch.js')).toEqual(['./boot-recovery.js']);
    expect(importsOf('boot-recovery.js')).toEqual([]);
  });
});

// The same 97%, with no error to hear: requests to the arcade's worker that never answered held the
// game's start for good, and so did the one reload, when its own requests hung as well.
describe('a game module that never answers', () => {
  it('reloads once the load has heard of no file coming in for a while, a few times over', () => {
    const tries = [];
    let address = GAME;

    while (tries.length < 4) {
      const window = fakeBootWindow(address);

      watchBoot(window);
      window.fileIn();
      window.advance(STALL_MS + 3 * RETRY_AFTER_MS);
      address = window.replaced[0] ?? address;
      tries.push(window.replaced.length ? new URL(address).searchParams.get('fresh') : 'stuck');
    }

    expect(tries).toEqual(['1', '2', '3', 'stuck']);
  });
});
