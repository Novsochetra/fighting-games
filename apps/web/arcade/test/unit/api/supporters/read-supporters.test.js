import { describe, expect, it } from 'vitest';
import { ANONYMOUS, DEFAULT_CURRENCY, readSupporters } from '@/api/supporters/read-supporters.js';

const one = (entry) => readSupporters({ supporters: [entry] }).supporters;

describe('readSupporters', () => {
  it('keeps a supporter with a name, an amount, a day and a message', () => {
    const entry = { name: ' Sok Dara ', amount: 25, date: '2026-10-20', message: ' Keep going! ' };
    expect(one(entry)).toEqual([
      {
        name: 'Sok Dara',
        isAnonymous: false,
        amount: 25,
        date: '2026-10-20',
        message: 'Keep going!',
      },
    ]);
  });

  it('shows a supporter without a name as anonymous', () => {
    expect(one({ name: '  ', amount: 5 })).toEqual([
      { name: ANONYMOUS, isAnonymous: true, amount: 5, date: '', message: '' },
    ]);
  });

  it('reads an amount written as text', () => {
    expect(one({ name: 'Mey', amount: '4.99' })[0].amount).toBe(4.99);
  });

  it('drops entries without a positive amount', () => {
    const entries = [{ name: 'Zero', amount: 0 }, { name: 'Minus', amount: -3 }, { name: 'None' }];
    expect(readSupporters({ supporters: [...entries, null] }).supporters).toEqual([]);
  });

  it('forgets a day that is not written as YYYY-MM-DD', () => {
    expect(one({ name: 'Mey', amount: 1, date: 'last week' })[0].date).toBe('');
  });

  it('takes a three letter currency code and falls back to dollars', () => {
    expect(readSupporters({ currency: 'khr', supporters: [] }).currency).toBe('KHR');
    expect(readSupporters({ currency: 'riel', supporters: [] }).currency).toBe(DEFAULT_CURRENCY);
    expect(readSupporters({ supporters: [] }).currency).toBe(DEFAULT_CURRENCY);
  });

  it('reads a missing list as no supporters', () => {
    expect(readSupporters({}).supporters).toEqual([]);
  });
});
