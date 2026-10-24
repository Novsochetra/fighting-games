import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { bootSupporters } from '../../src/supporters/boot.js';

export const SUPPORTERS_PAGE = path.join(WEB_ROOT, 'supporters', 'index.html');
export const SUPPORTERS_DATA = path.join(WEB_ROOT, 'supporters', 'supporters.json');

export const samplePayload = () => ({
  currency: 'USD',
  donateUrl: 'https://ko-fi.com/retro-arcade',
  supporters: [
    { name: 'Sok Dara', amount: 250, date: '2026-09-14', message: 'Keep it free!' },
    { name: 'Chan Bopha', amount: 120, date: '2026-10-02' },
    { name: 'Arun Kim', amount: 75.5, date: '2026-10-21' },
    { name: '', amount: 50, date: '2026-10-18' },
    { name: 'Srey Pov', amount: 5, date: '2026-10-24' },
  ],
});

export const jsonReply = (payload, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => payload,
});

// Only the body: the head's stylesheet and module links would make happy-dom try to fetch them.
export async function loadSupportersMarkup() {
  const html = await readFile(SUPPORTERS_PAGE, 'utf8');
  const [, bodyMarkup] = /<body[^>]*>([\s\S]*)<\/body>/.exec(html);
  expect(bodyMarkup).not.toMatch(/<script|<link/);
  document.body.innerHTML = bodyMarkup;
}

const booted = [];

export async function bootPage(fetchFn, options = {}) {
  const page = bootSupporters({ document, fetch: fetchFn, locale: 'en-US', ...options });
  booted.push(page);
  await page.ready;
  return page;
}

export const stopPages = () => booted.splice(0).forEach((page) => page.stop());

export const byId = (id) => document.getElementById(id);
export const texts = (selector) =>
  [...document.querySelectorAll(selector)].map((element) => element.textContent.trim());
export const click = (target) =>
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
