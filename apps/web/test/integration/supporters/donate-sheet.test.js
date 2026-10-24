// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEND_FAILED } from '../../../src/supporters/donate-client.js';
import {
  bootPage,
  byId,
  click,
  fakeApi,
  jsonReply,
  loadSupportersMarkup,
  stopPages,
  texts,
} from '../../support/supporters-harness.js';

const visibleStep = () =>
  [...document.querySelectorAll('[data-step-panel]')]
    .filter((panel) => !panel.hidden)
    .map((panel) => panel.dataset.stepPanel);

const type = (id, value) => {
  byId(id).value = value;
  byId(id).dispatchEvent(new Event('input', { bubbles: true }));
};

const submitForm = () =>
  byId('donate-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

async function openSheet(api = fakeApi()) {
  await bootPage(api.fetchFn);
  click(byId('donate'));
  return api;
}

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadSupportersMarkup();
});

afterEach(() => {
  stopPages();
  vi.restoreAllMocks();
});

describe('the donate sheet', () => {
  it('opens on the form, and a quick amount fills the field', async () => {
    await openSheet();
    expect(byId('donate-sheet').open).toBe(true);
    expect(visibleStep()).toEqual(['form']);

    click(document.querySelector('[data-amount="10"]'));
    expect(byId('donate-amount').value).toBe('10');
    expect(document.querySelector('[data-amount="10"]').getAttribute('aria-pressed')).toBe('true');
    type('donate-amount', '12');
    expect(document.querySelector('[data-amount="10"]').getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps the form up and says why when the amount is wrong', async () => {
    await openSheet();
    type('donate-amount', '0.50');
    submitForm();
    expect(visibleStep()).toEqual(['form']);
    expect(byId('donate-form-error').hidden).toBe(false);
    expect(byId('donate-form-error').textContent).toBe('Enter an amount from $1 to $10,000.');
  });

  it('shows the KHQR code for the amount, with a way to save it on a phone', async () => {
    await openSheet();
    type('donate-amount', '5');
    submitForm();
    expect(visibleStep()).toEqual(['pay']);
    expect(byId('donate-pay-title').textContent).toBe('Send $5');
    expect(byId('donate-pay-amount').textContent).toBe('$5');
    const qr = document.querySelector('.donate__qr');
    expect(qr.getAttribute('src')).toBe('../assets/donate/khqr.jpg');
    expect(document.querySelector('.donate__save').hasAttribute('download')).toBe(true);

    click(byId('donate-back'));
    expect(visibleStep()).toEqual(['form']);
    expect(byId('donate-amount').value).toBe('5');
  });

  it('adds the name to the list once the gift is sent', async () => {
    const api = await openSheet();
    type('donate-amount', '300');
    type('donate-name', '  Nov   Sochetra ');
    type('donate-message', 'For the next boss');
    submitForm();
    click(byId('donate-sent'));

    await vi.waitFor(() => expect(visibleStep()).toEqual(['thanks']));
    expect(api.posts).toEqual([
      {
        url: '../api/supporters',
        body: { name: 'Nov Sochetra', amount: 300, message: 'For the next boss' },
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      },
    ]);
    expect(byId('donate-thanks-title').textContent).toBe('Thank you, Nov Sochetra!');
    await vi.waitFor(() => expect(texts('.podium__name')[0]).toBe('Nov Sochetra'));
    expect(byId('donate-amount').value).toBe('');

    click(byId('donate-done'));
    await vi.waitFor(() => expect(byId('donate-sheet').open).toBe(false));
  });

  it('thanks an anonymous supporter without a name', async () => {
    await openSheet();
    type('donate-amount', '1');
    submitForm();
    click(byId('donate-sent'));
    await vi.waitFor(() => expect(visibleStep()).toEqual(['thanks']));
    expect(byId('donate-thanks-title').textContent).toBe('Thank you!');
  });

  it('shows the server reason when the gift is refused, and stays on the code', async () => {
    const message = 'That is a lot of gifts at once. Try again in a few minutes.';
    await openSheet(fakeApi({ postReply: () => jsonReply({ error: message }, 429) }));
    type('donate-amount', '5');
    submitForm();
    click(byId('donate-sent'));
    await vi.waitFor(() => expect(byId('donate-pay-error').hidden).toBe(false));
    expect(byId('donate-pay-error').textContent).toBe(message);
    expect(visibleStep()).toEqual(['pay']);
    expect(byId('donate-sent').disabled).toBe(false);
  });

  it('says to try again when the connection fails', async () => {
    await openSheet(
      fakeApi({
        postReply: () => {
          throw new TypeError('Failed to fetch');
        },
      }),
    );
    type('donate-amount', '5');
    submitForm();
    click(byId('donate-sent'));
    await vi.waitFor(() => expect(byId('donate-pay-error').textContent).toBe(SEND_FAILED));
  });
});
