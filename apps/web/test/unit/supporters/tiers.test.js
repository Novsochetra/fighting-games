import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QUICK_AMOUNTS } from '../../../src/supporters/donate-form.js';
import { createPayWait, PAY_WAIT_SECONDS, sentLabel } from '../../../src/supporters/pay-wait.js';
import { nextTierOf, presentTier, TIERS, tierOf } from '../../../src/supporters/tiers.js';

const money = { currency: 'USD', locale: 'en-US' };

describe('tierOf', () => {
  it.each([
    [1, 'bronze'],
    [4.99, 'bronze'],
    [5, 'silver'],
    [9.99, 'silver'],
    [10, 'gold'],
    [24.99, 'gold'],
    [25, 'diamond'],
    [10000, 'diamond'],
  ])('puts $%s in %s', (amount, id) => {
    expect(tierOf(amount).id).toBe(id);
  });

  it('starts a tier at each quick amount', () => {
    expect(QUICK_AMOUNTS.map((amount) => tierOf(amount).id)).toEqual(TIERS.map((tier) => tier.id));
  });

  it('knows the next tier, and that Diamond has none', () => {
    expect(nextTierOf(7).id).toBe('gold');
    expect(nextTierOf(25)).toBeNull();
  });
});

describe('presentTier', () => {
  it('names the tier and how much more reaches the next one', () => {
    expect(presentTier(12.3, money)).toEqual({
      id: 'gold',
      label: 'Gold supporter',
      nudge: '$12.70 more for Diamond',
    });
    expect(presentTier(1, money).nudge).toBe('$4 more for Silver');
  });

  it('says Diamond is the top', () => {
    expect(presentTier(40, money)).toMatchObject({ id: 'diamond', nudge: 'The top tier' });
  });
});

describe('createPayWait', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const button = () => ({
    textContent: '',
    disabled: false,
    classList: { toggle: vi.fn() },
  });

  it('counts down each second, then lets the button go', () => {
    const sent = button();
    const wait = createPayWait({ button: sent, seconds: 3 });
    wait.start();
    expect([sent.textContent, sent.disabled, wait.isWaiting()]).toEqual([
      'I sent it (3)',
      true,
      true,
    ]);
    vi.advanceTimersByTime(1000);
    expect(sent.textContent).toBe('I sent it (2)');
    vi.advanceTimersByTime(2000);
    expect([sent.textContent, sent.disabled, wait.isWaiting()]).toEqual([
      'I sent it',
      false,
      false,
    ]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops at once when the supporter leaves the code', () => {
    const sent = button();
    const wait = createPayWait({ button: sent });
    wait.start();
    wait.stop();
    expect(sent.disabled).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('waits ten seconds by default', () => {
    expect(PAY_WAIT_SECONDS).toBe(10);
    expect(sentLabel(0)).toBe('I sent it');
  });
});
