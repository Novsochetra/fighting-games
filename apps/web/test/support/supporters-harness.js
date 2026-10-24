import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, vi } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { bootSupporters } from '../../src/supporters/boot.js';

export const SUPPORTERS_PAGE = path.join(WEB_ROOT, 'supporters', 'index.html');

export const samplePayload = () => ({
  currency: 'USD',
  supporters: [
    { name: 'Sok Dara', amount: 250, date: '2026-09-14', message: 'Keep it free!' },
    { name: 'Chan Bopha', amount: 120, date: '2026-10-02' },
    { name: 'Arun Kim', amount: 75.5, date: '2026-10-21' },
    { name: '', amount: 50, date: '2026-10-18' },
    { name: 'Srey Pov', amount: 5, date: '2026-10-24' },
  ],
});

export const jsonReply = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
});

// Stands in for the server: GET returns the list, POST saves a gift into it as the server would.
export function fakeApi({ payload = samplePayload(), postReply } = {}) {
  const posts = [];
  const fetchFn = vi.fn(async (url, options = {}) => {
    if (options.method !== 'POST') {
      return jsonReply(payload);
    }
    const body = JSON.parse(options.body);
    posts.push({ url, body, headers: options.headers });
    if (postReply) {
      return postReply(body);
    }
    const supporter = { ...body, date: '2026-10-24' };
    payload.supporters.push(supporter);
    return jsonReply({ supporter }, 201);
  });
  return { fetchFn, posts };
}

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
