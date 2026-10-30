import { describe, expect, it } from 'vitest';
import { supportersPage } from '@/screens/supporters/view-model.js';

const data = {
  currency: 'USD',
  supporters: [
    { name: 'Mey', isAnonymous: false, amount: 10, date: '2026-10-20', message: '' },
    { name: 'Sok Dara', isAnonymous: false, amount: 120.5, date: '2026-09-01', message: 'Hi' },
    { name: 'Anonymous', isAnonymous: true, amount: 25, date: '', message: '' },
    { name: 'Arun', isAnonymous: false, amount: 10, date: '2026-10-01', message: '' },
  ],
};
const page = (order = 'top') => supportersPage(data, { order, locale: 'en-US' });

describe('supportersPage', () => {
  it('sums the gifts and counts the supporters', () => {
    expect(page()).toMatchObject({ isEmpty: false, totalLabel: '$165.50', countLabel: '4' });
  });

  it('puts the top three on the podium with gold, silver and bronze', () => {
    const podium = page().podium.map(({ name, medal, rank }) => [name, medal, rank]);
    expect(podium).toEqual([
      ['Sok Dara', 'gold', 1],
      ['Anonymous', 'silver', 2],
      ['Arun', 'bronze', 3],
    ]);
  });

  it('gives a shared place the same medal', () => {
    const tied = page().rows.filter(({ amount }) => amount === 10);
    expect(tied.map(({ medal }) => medal)).toEqual(['bronze', 'bronze']);
  });

  it('labels every row for the screen', () => {
    expect(page().rows[0]).toMatchObject({
      amountLabel: '$120.50',
      dateLabel: 'Sep 1, 2026',
      initials: 'SD',
    });
  });

  it('lists the rows by place or by day', () => {
    expect(page('top').rows.map(({ name }) => name)).toEqual([
      'Sok Dara',
      'Anonymous',
      'Arun',
      'Mey',
    ]);
    expect(page('recent').rows.map(({ name }) => name)).toEqual([
      'Mey',
      'Arun',
      'Sok Dara',
      'Anonymous',
    ]);
  });

  it('names the tier of each gift by its amount', () => {
    const tiers = page().rows.map(({ amount, tier, tierName }) => [amount, tier, tierName]);
    expect(tiers).toEqual([
      [120.5, 'diamond', 'Diamond'],
      [25, 'diamond', 'Diamond'],
      [10, 'gold', 'Gold'],
      [10, 'gold', 'Gold'],
    ]);
  });

  it('says when there is no one yet', () => {
    const empty = supportersPage({ ...data, supporters: [] }, { order: 'top', locale: 'en-US' });
    expect(empty).toMatchObject({ isEmpty: true, totalLabel: '$0', podium: [], rows: [] });
  });
});
