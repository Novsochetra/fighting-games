// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage, STORAGE_KEYS } from '../../../src/home/preferences.js';
import { CUES } from '../../../src/home/sound-cues.js';
import { SEND_FAILED } from '../../../src/supporters/donate-client.js';
import { PAY_WAIT_SECONDS } from '../../../src/supporters/pay-wait.js';
import { createFakeAudioContext } from '../../support/fake-audio.js';
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

async function openSheet(api = fakeApi(), options = {}) {
  await bootPage(api.fetchFn, options);
  click(byId('donate'));
  return api;
}

const waitOut = (seconds = PAY_WAIT_SECONDS) => vi.advanceTimersByTime(seconds * 1000);

const sendAfterWait = () => {
  waitOut();
  click(byId('donate-sent'));
};

const tierLine = (id) => ({
  hidden: byId(id).hidden,
  tier: byId(id).querySelector('.tier-gem').dataset.tier,
  label: byId(id).querySelector('.tier__label').textContent,
  nudge: byId(id).querySelector('.tier__nudge')?.textContent,
});

// Only the countdown's interval is faked: the fetches and the sheet's closing timer stay real.
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  document.body.innerHTML = '';
  await loadSupportersMarkup();
});

afterEach(() => {
  stopPages();
  vi.useRealTimers();
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
    sendAfterWait();

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

  it('keeps the list up while it loads again with the gift, so it never blinks out', async () => {
    await openSheet();
    const notice = byId('supporters-notice');
    const noticeShown = [];
    const watch = new MutationObserver(() => noticeShown.push(!notice.hidden));

    watch.observe(notice, { attributes: true, attributeFilter: ['hidden'] });
    type('donate-amount', '300');
    type('donate-name', 'Nov Sochetra');
    submitForm();
    sendAfterWait();
    await vi.waitFor(() => expect(texts('.podium__name')[0]).toBe('Nov Sochetra'));
    watch.disconnect();

    expect(noticeShown).not.toContain(true);
    expect(notice.hidden).toBe(true);
  });

  it('thanks an anonymous supporter without a name', async () => {
    await openSheet();
    type('donate-amount', '1');
    submitForm();
    sendAfterWait();
    await vi.waitFor(() => expect(visibleStep()).toEqual(['thanks']));
    expect(byId('donate-thanks-title').textContent).toBe('Thank you!');
  });

  it('shows the server reason when the gift is refused, and stays on the code', async () => {
    const message = 'That is a lot of gifts at once. Try again in a few minutes.';
    await openSheet(fakeApi({ postReply: () => jsonReply({ error: message }, 429) }));
    type('donate-amount', '5');
    submitForm();
    sendAfterWait();
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
    sendAfterWait();
    await vi.waitFor(() => expect(byId('donate-pay-error').textContent).toBe(SEND_FAILED));
  });

  it('holds back I sent it while the supporter pays, counting down', async () => {
    const api = await openSheet();
    type('donate-amount', '5');
    submitForm();
    expect(byId('donate-sent').disabled).toBe(true);
    expect(byId('donate-sent').textContent).toBe(`I sent it (${PAY_WAIT_SECONDS})`);
    click(byId('donate-sent'));
    expect(api.posts).toEqual([]);

    waitOut(3);
    expect(byId('donate-sent').textContent).toBe(`I sent it (${PAY_WAIT_SECONDS - 3})`);
    waitOut(PAY_WAIT_SECONDS - 3);
    expect(byId('donate-sent').disabled).toBe(false);
    expect(byId('donate-sent').textContent).toBe('I sent it');
    expect(byId('donate-sent').classList.contains('is-waiting')).toBe(false);
  });

  it('starts the wait again when the supporter goes back and returns', async () => {
    await openSheet();
    type('donate-amount', '5');
    submitForm();
    waitOut();
    click(byId('donate-back'));
    submitForm();
    expect(byId('donate-sent').disabled).toBe(true);
  });

  it('shows the tier the amount reaches, and how far the next one is', async () => {
    await openSheet();
    expect(byId('donate-tier').hidden).toBe(true);
    type('donate-amount', '3');
    expect(tierLine('donate-tier')).toEqual({
      hidden: false,
      tier: 'bronze',
      label: 'Bronze supporter',
      nudge: '$2 more for Silver',
    });
    click(document.querySelector('[data-amount="10"]'));
    expect(tierLine('donate-tier')).toMatchObject({ tier: 'gold', nudge: '$15 more for Diamond' });
    click(document.querySelector('[data-amount="25"]'));
    expect(tierLine('donate-tier')).toMatchObject({
      tier: 'diamond',
      label: 'Diamond supporter',
      nudge: 'The top tier',
    });
    type('donate-amount', '0.50');
    expect(byId('donate-tier').hidden).toBe(true);
  });

  it('cheers and names the tier once the gift is in', async () => {
    const context = createFakeAudioContext();
    await openSheet(fakeApi(), { createAudioContext: vi.fn(() => context) });
    type('donate-amount', '12');
    submitForm();
    waitOut();
    const before = context.started.length;
    click(byId('donate-sent'));
    await vi.waitFor(() => expect(visibleStep()).toEqual(['thanks']));
    expect(tierLine('donate-thanks-tier')).toMatchObject({
      hidden: false,
      tier: 'gold',
      label: 'Gold supporter',
    });
    expect(context.started.length - before).toBe(CUES.cheer.length);
  });

  it('opens at once for a visitor sent by the home page Support banner', async () => {
    await bootPage(fakeApi().fetchFn, { visit: { openDonate: true } });
    expect(byId('donate-sheet').open).toBe(true);
    expect(visibleStep()).toEqual(['form']);
  });

  it('remembers a gift on this device, so the home page stops asking', async () => {
    const storage = createMemoryStorage();
    await openSheet(fakeApi(), { storage, visit: { now: () => 4242 } });
    type('donate-amount', '5');
    submitForm();
    sendAfterWait();
    await vi.waitFor(() => expect(visibleStep()).toEqual(['thanks']));
    expect(storage.read(STORAGE_KEYS.gaveAt)).toBe(4242);
  });
});
