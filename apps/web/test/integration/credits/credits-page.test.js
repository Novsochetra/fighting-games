// @vitest-environment happy-dom
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { ORIGIN, stopArcades } from '../../support/arcade-harness.js';
import { CREDITS_PAGE, openCredits } from '../../support/credits-harness.js';
import { claimedAndRealSize } from '../../support/jpeg-size.js';

const SOCIAL_LINKS = [
  'https://buymeacoffee.com/sochetranov',
  'https://github.com/Novsochetra',
  'https://www.facebook.com/sochetra.nov.7',
];

let screen = null;

const one = (selector) => screen.querySelector(selector);
const all = (selector) => [...screen.querySelectorAll(selector)];
const isOutside = (link) => new URL(link.href).origin !== new URL(ORIGIN).origin;
const textOf = (element) => element.textContent.trim();

beforeEach(() => {
  document.body.innerHTML = '';
  screen = openCredits();
});

afterEach(stopArcades);

describe('the credits page', () => {
  it('names the release and build it runs at its foot, so a phone can be checked against the deploy', () => {
    expect(one('#credits-version')).toBeNull();

    stopArcades();
    screen = openCredits({ version: '1.0.0+06f31ee' });
    expect(textOf(one('#credits-version'))).toBe('Version 1.0.0 (06f31ee)');
    expect(one('#credits-version').closest('footer')).not.toBeNull();
  });

  it('names the maker in the large title and in the bar that takes over from it', () => {
    expect(textOf(one('h1'))).toBe('Nov Sochetra');
    expect(textOf(one('#credits-bar-title'))).toBe('Nov Sochetra');
  });

  it('links to the maker on Buy Me a Coffee first, then GitHub and Facebook', () => {
    const hrefs = all('#social-links a').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(SOCIAL_LINKS);
  });

  it('opens every outside link in a new tab over https, without handing it the page', () => {
    const outside = all('a').filter(isOutside);
    expect(outside.length).toBeGreaterThan(SOCIAL_LINKS.length);
    for (const link of outside) {
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel').split(' ')).toEqual(
        expect.arrayContaining(['noopener', 'noreferrer']),
      );
    }
  });

  it('names every row by its title, with the icons hidden from screen readers', () => {
    const rows = all('.credits-row');
    expect(rows).toHaveLength(6);
    for (const row of rows) {
      expect(textOf(row.querySelector('.credits-row__title'))).not.toBe('');
      expect(row.querySelector('.credits-tile').getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('leads back to the arcade, named even where a phone shows its chevron alone', () => {
    const back = one('[data-back]');
    expect(back.getAttribute('href')).toBe(ORIGIN);
    expect(back.getAttribute('aria-label')).toBe('Arcade');
  });

  it('leads on to the supporters page', async () => {
    expect(one('#credits-supporters-link').href).toBe(`${ORIGIN}supporters/`);
    const supporters = await stat(path.join(WEB_ROOT, 'supporters', 'index.html'));
    expect(supporters.isFile()).toBe(true);
  });

  it("sets the maker's photo on the edge of their childhood one, each the size of its file", async () => {
    const cover = one('.cover__photo');
    const portrait = one('.maker__photo');
    expect(cover.getAttribute('alt')).toMatch(/brother/);
    expect(textOf(one('.cover__caption'))).toBe('Me and my brother');
    for (const photo of [cover, portrait]) {
      const { claimed, real } = await claimedAndRealSize(photo, CREDITS_PAGE);
      expect(real).toBe(claimed);
    }
  });

  it('loads only stylesheets and scripts that are there', async () => {
    const html = await readFile(CREDITS_PAGE, 'utf8');
    const local = [...html.matchAll(/<(?:link|script)\b[^>]*\b(?:href|src)="(\.\.\/[^"]+)"/g)];
    expect(local.length).toBeGreaterThan(0);
    for (const [, reference] of local) {
      const file = await stat(path.resolve(path.dirname(CREDITS_PAGE), reference));
      expect(file.isFile()).toBe(true);
    }
  });
});
