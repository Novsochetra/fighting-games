import { describe, expect, it } from 'vitest';
import { TIERS as SERVER_TIERS } from '../../../../server/src/supporters/tiers.js';
import { QUICK_AMOUNTS } from '../../../src/supporters/donate-form.js';
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

describe('the tiers the server names', () => {
  // the sheet shows a tier while an amount is typed; the list names each gift's from the server
  it('start at the same amounts as the server, which has the last word', () => {
    const steps = TIERS.map(({ id, min }) => ({ id, minCents: Math.round(min * 100) }));

    expect(steps).toEqual(SERVER_TIERS);
  });
});
