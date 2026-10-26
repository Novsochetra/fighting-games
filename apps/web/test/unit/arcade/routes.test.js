// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { arcadeRoot, screenAt, screenLink, screenUrl } from '../../../src/arcade/routes.js';

const ROOT = new URL('https://www.khmerarcade.games/');

describe('arcadeRoot', () => {
  it('is the folder above a screen under the arcade, and the arcade’s own folder', () => {
    expect(arcadeRoot(new URL(`${ROOT}supporters/#give`), 'supporters').href).toBe(ROOT.href);
    expect(arcadeRoot(new URL(`${ROOT}credits/`), 'credits').href).toBe(ROOT.href);
    expect(arcadeRoot(new URL(`${ROOT}index.html?from=share`), 'home').href).toBe(ROOT.href);
  });

  it('follows the arcade to whatever path it is served from', () => {
    const page = new URL('https://example.com/arcade/supporters/');

    expect(arcadeRoot(page, 'supporters').href).toBe('https://example.com/arcade/');
  });
});

describe('screenAt', () => {
  it('knows each screen by its path, with or without its index.html', () => {
    expect(screenAt(new URL(ROOT), ROOT)).toBe('home');
    expect(screenAt(new URL(`${ROOT}index.html`), ROOT)).toBe('home');
    expect(screenAt(new URL(`${ROOT}supporters/#give`), ROOT)).toBe('supporters');
    expect(screenAt(new URL(`${ROOT}credits/index.html`), ROOT)).toBe('credits');
    expect(screenUrl(ROOT, 'credits').href).toBe(`${ROOT}credits/`);
  });

  it('turns down a game, a file, another site and a page outside the arcade', () => {
    expect(screenAt(new URL(`${ROOT}games/steel-and-dust/`), ROOT)).toBeNull();
    expect(screenAt(new URL(`${ROOT}assets/donate/khqr.jpg`), ROOT)).toBeNull();
    expect(screenAt(new URL('https://morodokangkor.com/'), ROOT)).toBeNull();
    expect(
      screenAt(new URL('https://example.com/elsewhere/'), new URL('https://example.com/a/')),
    ).toBeNull();
  });
});

describe('screenLink', () => {
  function linkTo(href, attributes = {}) {
    document.body.innerHTML = '';
    const link = document.createElement('a');

    link.href = new URL(href, ROOT).href;
    for (const [name, value] of Object.entries(attributes)) {
      link.setAttribute(name, value);
    }

    link.innerHTML = '<span>label</span>';
    document.body.append(link);

    return link.firstElementChild;
  }

  const click = (target, init = {}) => ({
    target,
    button: 0,
    defaultPrevented: false,
    ...init,
  });

  it('takes a plain click on a link to a screen, even on something inside the link', () => {
    const link = screenLink(click(linkTo('supporters/#give')), ROOT);

    expect(link).toMatchObject({ screen: 'supporters', back: false });
    expect(link.url.hash).toBe('#give');
    expect(screenLink(click(linkTo('./', { 'data-back': '' })), ROOT)).toMatchObject({
      screen: 'home',
      back: true,
    });
  });

  it('leaves a new tab, a download, a game and a click already handled to the browser', () => {
    expect(screenLink(click(linkTo('credits/'), { metaKey: true }), ROOT)).toBeNull();
    expect(screenLink(click(linkTo('credits/'), { button: 1 }), ROOT)).toBeNull();
    expect(screenLink(click(linkTo('credits/', { target: '_blank' })), ROOT)).toBeNull();
    expect(screenLink(click(linkTo('credits/', { download: '' })), ROOT)).toBeNull();
    expect(screenLink(click(linkTo('games/steel-and-dust/')), ROOT)).toBeNull();
    expect(screenLink(click(linkTo('credits/'), { defaultPrevented: true }), ROOT)).toBeNull();
    expect(screenLink(click(document.body), ROOT)).toBeNull();
  });
});
