// @vitest-environment happy-dom
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { CREDITS_PAGE, loadCreditsMarkup } from '../../support/credits-harness.js';

const SOCIAL_LINKS = [
  'https://buymeacoffee.com/sochetranov',
  'https://github.com/Novsochetra',
  'https://www.facebook.com/sochetra.nov.7',
];

const all = (selector) => [...document.querySelectorAll(selector)];
const isOutside = (link) => /^[a-z]+:/i.test(link.getAttribute('href'));
const textOf = (element) => element.textContent.trim();

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadCreditsMarkup();
});

describe('the credits page', () => {
  it('names the maker in the large title and in the bar that takes over from it', () => {
    expect(textOf(document.querySelector('h1'))).toBe('Nov Sochetra');
    expect(textOf(document.getElementById('bar-title'))).toBe('Nov Sochetra');
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
    const back = document.getElementById('back');
    expect(back.getAttribute('href')).toBe('../');
    expect(back.getAttribute('aria-label')).toBe('Arcade');
  });

  it('leads on to the supporters page', async () => {
    expect(document.getElementById('supporters-link').getAttribute('href')).toBe('../supporters/');
    const supporters = await stat(path.join(WEB_ROOT, 'supporters', 'index.html'));
    expect(supporters.isFile()).toBe(true);
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
