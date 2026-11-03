// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { STRINGS } from '../../../src/ui/screens/strings.js';
import { loadPageBody, readPage } from '../../support/page-body.js';

const SITE = 'https://www.khmerarcade.games/games/naga-eleven/';

// a Khmer text names a control by its row in How to play (ទាត់បាល់, not SHOOT), whose caps show the
// key or button for it
const latinWords = (text) => text.replace(/\{\w+\}/g, '').match(/[A-Za-z]{3,}/g) ?? [];

const metaContent = (html, key) =>
  html.match(new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`))?.[1];

describe('the game’s page', () => {
  beforeEach(async () => {
    await loadPageBody(document);
  });

  it('has a string in both languages for every word it names', () => {
    const keys = [...document.querySelectorAll('[data-text], [data-label], [data-ask], [data-yes]')]
      .flatMap((node) => [
        node.dataset.text,
        node.dataset.label,
        node.dataset.ask,
        node.dataset.yes,
      ])
      .filter(Boolean);

    expect(keys.length).toBeGreaterThan(40);
    expect(keys.filter((key) => !STRINGS[key])).toEqual([]);
  });

  it('writes every string in English and in Khmer', () => {
    const missing = Object.entries(STRINGS).filter(([, text]) => !text.en || !text.km);
    const untranslated = Object.entries(STRINGS).filter(
      ([, text]) => latinWords(text.km).length > 0 && text.km !== text.en,
    );

    expect(missing).toEqual([]);
    expect(untranslated.map(([key]) => key)).toEqual([]);
  });

  it('gives every element an id of its own', () => {
    const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('points every label at an element that is there', () => {
    const labelled = [...document.querySelectorAll('[aria-labelledby]')];

    for (const node of labelled) {
      expect(document.getElementById(node.getAttribute('aria-labelledby'))).not.toBe(null);
    }
  });

  it('gives every button a name', () => {
    for (const button of document.querySelectorAll('#screens button')) {
      const named = button.textContent.trim() || button.dataset.text || button.dataset.label;

      expect(named || button.dataset.slot).toBeTruthy();
    }
  });

  it('keeps the tags search engines and link previews read, named for the story', async () => {
    const html = await readPage();

    expect(html).toContain(`<link rel="canonical" href="${SITE}" />`);
    expect(metaContent(html, 'og:url')).toBe(SITE);
    expect(metaContent(html, 'og:title')).toMatch(/Naga Eleven/);
    expect(metaContent(html, 'og:description')).toMatch(/Khmer/);
    expect(metaContent(html, 'og:image')).toBe(`${SITE}assets/social/share.jpg`);
    expect(metaContent(html, 'twitter:card')).toBe('summary_large_image');
    expect(html).toMatch(/<title>Naga Eleven · The Sochetra Story/);
  });

  it('loads the pixel face and every stylesheet the screens stand on', async () => {
    const html = await readPage();
    const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(sheets[0]).toBe('styles/fonts.css');
    expect(sheets).toContain('styles/tokens.css');
    expect(sheets).toContain('styles/touch.css');
  });
});
