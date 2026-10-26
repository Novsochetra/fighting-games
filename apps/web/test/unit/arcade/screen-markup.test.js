// @vitest-environment happy-dom
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  addStylesheets,
  fetchScreen,
  headOf,
  makeUrlsWhole,
  stylesheetsOf,
} from '../../../src/arcade/screen-markup.js';

const PAGE = new URL('https://www.khmerarcade.games/supporters/');

// happy-dom fetches no stylesheet; it reports each one as loaded rather than as an error
beforeAll(() => {
  window.happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
});

const parse = (html) => new DOMParser().parseFromString(html, 'text/html');

const SUPPORTERS_PAGE = `<!doctype html>
<html><head>
  <title>Supporters · Retro Arcade</title>
  <meta name="description" content="The people who keep every game free." />
  <link rel="canonical" href="https://www.khmerarcade.games/supporters/" />
  <link rel="stylesheet" href="../src/home/tokens.css" />
  <link rel="stylesheet" href="../src/supporters/podium.css" />
</head><body>
  <div data-screen="supporters" tabindex="-1">
    <a data-back href="../">Arcade</a>
    <img src="../assets/donate/khqr.jpg" srcset="../a.jpg 1x, ../b.jpg 2x" alt="" />
  </div>
</body></html>`;

describe('makeUrlsWhole', () => {
  it('makes every address whole against the page the markup came from', () => {
    const screen = parse(SUPPORTERS_PAGE).querySelector('[data-screen]');

    makeUrlsWhole(screen, PAGE);

    expect(screen.querySelector('a').getAttribute('href')).toBe('https://www.khmerarcade.games/');
    expect(screen.querySelector('img').getAttribute('src')).toBe(
      'https://www.khmerarcade.games/assets/donate/khqr.jpg',
    );
    expect(screen.querySelector('img').getAttribute('srcset')).toBe(
      'https://www.khmerarcade.games/a.jpg 1x, https://www.khmerarcade.games/b.jpg 2x',
    );
  });

  it('leaves a fragment, a full address and a data or mail address as they are', () => {
    const page = parse(`<div>
      <a href="#give">a</a><a href="https://buymeacoffee.com/x">b</a>
      <a href="mailto:hi@example.com">c</a><img src="data:image/png;base64,AA==" />
      <img src="//cdn.example.com/x.png" />
    </div>`);
    const root = page.querySelector('div');
    const before = root.innerHTML;

    makeUrlsWhole(root, PAGE);

    expect(root.innerHTML).toBe(before);
  });
});

describe('the head of a screen’s page', () => {
  it('gives its title, description, canonical address and stylesheets', () => {
    const page = parse(SUPPORTERS_PAGE);

    expect(headOf(page)).toEqual({
      title: 'Supporters · Retro Arcade',
      description: 'The people who keep every game free.',
      canonical: 'https://www.khmerarcade.games/supporters/',
    });
    expect(stylesheetsOf(page, PAGE)).toEqual([
      'https://www.khmerarcade.games/src/home/tokens.css',
      'https://www.khmerarcade.games/src/supporters/podium.css',
    ]);
  });
});

describe('fetchScreen', () => {
  const answer = (body, status = 200) =>
    vi.fn(async () => ({ ok: status === 200, status, text: async () => body }));

  it('takes in the screen, made whole, with its stylesheets and head', async () => {
    const fetch = answer(SUPPORTERS_PAGE);
    const screen = await fetchScreen({ document, fetch, url: PAGE, id: 'supporters' });

    expect(fetch).toHaveBeenCalledWith(PAGE.href, { credentials: 'same-origin' });
    expect(screen.root.ownerDocument).toBe(document);
    expect(screen.root.querySelector('a').getAttribute('href')).toBe(
      'https://www.khmerarcade.games/',
    );
    expect(screen.stylesheets).toHaveLength(2);
    expect(screen.head.title).toBe('Supporters · Retro Arcade');
  });

  it('fails on a page that does not come or holds no such screen', async () => {
    await expect(
      fetchScreen({ document, fetch: answer('', 503), url: PAGE, id: 'supporters' }),
    ).rejects.toThrow('503');
    await expect(
      fetchScreen({ document, fetch: answer(SUPPORTERS_PAGE), url: PAGE, id: 'credits' }),
    ).rejects.toThrow('no credits screen');
  });
});

describe('addStylesheets', () => {
  it('adds only the stylesheets the document lacks, in the page’s order', async () => {
    document.head.innerHTML =
      '<link rel="stylesheet" href="https://www.khmerarcade.games/src/home/tokens.css" />';
    const hrefs = [
      'https://www.khmerarcade.games/src/home/tokens.css',
      'https://www.khmerarcade.games/src/supporters/podium.css',
      'https://www.khmerarcade.games/src/supporters/roll.css',
    ];
    const added = addStylesheets(document, hrefs);
    const links = [...document.head.querySelectorAll('link')].map((link) => link.href);

    expect(links).toEqual(hrefs);

    for (const link of document.head.querySelectorAll('link')) {
      link.dispatchEvent(new Event('load'));
    }

    await expect(added).resolves.toHaveLength(2);
    document.head.innerHTML = '';
  });
});
