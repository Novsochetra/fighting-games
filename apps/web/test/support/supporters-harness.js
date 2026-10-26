import { fireEvent, waitFor } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { renderArcade, unmountArcade } from './render-arcade.tsx';

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

export const byId = (id) => document.getElementById(id);

const isSettled = () => {
  const notice = byId('supporters-notice');

  return notice.hidden || notice.dataset.tone === 'error';
};

// Opens the arcade on the supporters screen and waits for the list (or its error) to show.
export async function bootPage(fetchFn, { path = '/supporters/', ...options } = {}) {
  const page = renderArcade({ path, fetch: fetchFn, ...options });

  await waitFor(() => expect(isSettled()).toBe(true));

  return page;
}

export const stopPages = () => unmountArcade();

export const texts = (selector) =>
  [...document.querySelectorAll(selector)].map((element) => element.textContent.trim());

export const click = (target) => fireEvent.click(target);

export const type = (id, value) => fireEvent.input(byId(id), { target: { value } });

export const submit = (id) => fireEvent.submit(byId(id));

export const apiUrl = (page) => new URL('api/supporters', page.root).href;
