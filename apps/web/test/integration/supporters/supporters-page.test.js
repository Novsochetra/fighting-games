// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CUES } from '../../../src/home/sound-cues.js';
import { readSupporters } from '../../../src/supporters/read-supporters.js';
import { ERROR_MESSAGE } from '../../../src/supporters/supporters-view.js';
import { createFakeAudioContext } from '../../support/fake-audio.js';
import {
  SUPPORTERS_DATA,
  bootPage,
  byId,
  click,
  jsonReply,
  loadSupportersMarkup,
  samplePayload,
  stopPages,
  texts,
} from '../../support/supporters-harness.js';

const sortOption = (order) => document.querySelector(`[data-sort="${order}"]`);

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadSupportersMarkup();
});

afterEach(() => {
  stopPages();
  vi.restoreAllMocks();
});

describe('the supporters page', () => {
  it('sums up the gifts and puts the top three on the podium', async () => {
    await bootPage(async () => jsonReply(samplePayload()));
    expect(byId('notice').hidden).toBe(true);
    expect(byId('total').textContent).toBe('$500.50');
    expect(byId('count').textContent).toBe('5');
    expect(texts('.podium__name')).toEqual(['Sok Dara', 'Chan Bopha', 'Arun Kim']);
    expect(texts('.podium__amount')).toEqual(['$250', '$120', '$75.50']);
    const medals = [...document.querySelectorAll('.podium__place')].map(
      (place) => place.dataset.medal,
    );
    expect(medals).toEqual(['gold', 'silver', 'bronze']);
  });

  it('lists everyone by place, with the anonymous gift and its message', async () => {
    await bootPage(async () => jsonReply(samplePayload()));
    expect(texts('.roll__name')).toEqual([
      'Sok Dara',
      'Chan Bopha',
      'Arun Kim',
      'Anonymous',
      'Srey Pov',
    ]);
    expect(texts('.roll__rank')).toEqual(['1', '2', '3', '4', '5']);
    expect(texts('.roll__message')).toEqual(['Keep it free!']);
    expect(byId('roll').dataset.order).toBe('top');
  });

  it('switches to the newest gifts first with a click', async () => {
    const context = createFakeAudioContext();
    await bootPage(async () => jsonReply(samplePayload()), {
      createAudioContext: vi.fn(() => context),
    });
    click(sortOption('recent'));
    expect(texts('.roll__name')).toEqual([
      'Srey Pov',
      'Arun Kim',
      'Anonymous',
      'Chan Bopha',
      'Sok Dara',
    ]);
    expect(byId('roll').dataset.order).toBe('recent');
    expect(sortOption('recent').getAttribute('aria-pressed')).toBe('true');
    expect(sortOption('top').getAttribute('aria-pressed')).toBe('false');
    expect(byId('sort').style.getPropertyValue('--segment')).toBe('1');
    expect(context.started).toHaveLength(CUES.switch.length);

    click(sortOption('recent'));
    expect(context.started).toHaveLength(CUES.switch.length);
  });

  it('opens the donate link in a new tab, and hides the button without one', async () => {
    await bootPage(async () => jsonReply(samplePayload()));
    const donate = byId('donate');
    expect(donate.hidden).toBe(false);
    expect(donate.getAttribute('href')).toBe('https://ko-fi.com/retro-arcade');
    expect(donate.target).toBe('_blank');
    expect(donate.rel).toContain('noopener');

    stopPages();
    await loadSupportersMarkup();
    await bootPage(async () => jsonReply({ ...samplePayload(), donateUrl: '' }));
    expect(byId('donate').hidden).toBe(true);
  });

  it('writes names as text, never as markup', async () => {
    const payload = { supporters: [{ name: '<img src=x onerror=alert(1)>', amount: 1 }] };
    await bootPage(async () => jsonReply(payload));
    expect(document.querySelector('.roll__row img')).toBeNull();
    expect(texts('.roll__name')).toEqual(['<img src=x onerror=alert(1)>']);
  });

  it('says so when the list fails to load, and tries again on request', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonReply({}, 503))
      .mockResolvedValueOnce(jsonReply(samplePayload()));
    await bootPage(fetchFn);
    expect(byId('notice').dataset.tone).toBe('error');
    expect(byId('status').textContent).toBe(ERROR_MESSAGE);
    expect(byId('roll').hidden).toBe(true);

    click(byId('retry'));
    await vi.waitFor(() => expect(byId('roll').hidden).toBe(false));
    expect(byId('notice').hidden).toBe(true);
  });
});

describe('the shipped supporter list', () => {
  it('is valid: the page shows every entry the file holds', async () => {
    const payload = JSON.parse(await readFile(SUPPORTERS_DATA, 'utf8'));
    expect(readSupporters(payload).supporters).toHaveLength(payload.supporters.length);
    await bootPage(async () => jsonReply(payload));
    expect(byId('notice').hidden).toBe(true);
    expect(document.querySelectorAll('.roll__row')).toHaveLength(payload.supporters.length);
    expect(byId('empty').hidden).toBe(payload.supporters.length > 0);
  });

  it('shows a friendly empty state when no one is listed', async () => {
    await bootPage(async () => jsonReply({ supporters: [] }));
    expect(byId('empty').hidden).toBe(false);
    expect(byId('stats').hidden).toBe(true);
    expect(byId('podium-section').hidden).toBe(true);
    expect(byId('roll').hidden).toBe(true);
  });
});
