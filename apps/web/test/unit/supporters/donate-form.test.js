import { describe, expect, it } from 'vitest';
import { DONATION_LIMITS as SERVER_LIMITS } from '../../../../server/src/supporters/read-donation.js';
import {
  DONATION_LIMITS,
  QUICK_AMOUNTS,
  readAmount,
  readDonationForm,
} from '../../../src/supporters/donate-form.js';

describe('readAmount', () => {
  it.each([
    ['5', 5],
    ['$12.50', 12.5],
    ['1,000', 1000],
    [' 7.5 ', 7.5],
  ])('reads %j as %s', (typed, amount) => {
    expect(readAmount(typed)).toBe(amount);
  });

  it.each(['', '0.99', '10000.01', '1.005', 'five', '-3', '1e3'])('refuses %j', (typed) => {
    expect(readAmount(typed)).toBeNull();
  });
});

describe('readDonationForm', () => {
  it('tidies the name and message', () => {
    expect(readDonationForm({ name: ' Sok   Dara ', amount: '5', message: '' })).toEqual({
      donation: { name: 'Sok Dara', amount: 5, message: '' },
    });
  });

  it('points at the field to fix', () => {
    expect(readDonationForm({ name: '', amount: '', message: '' }).field).toBe('amount');
    expect(readDonationForm({ name: 'x'.repeat(41), amount: '5', message: '' }).field).toBe('name');
    expect(readDonationForm({ name: '', amount: '5', message: 'x'.repeat(141) }).field).toBe(
      'message',
    );
  });

  it('holds the same limits as the server, which has the last word', () => {
    expect(DONATION_LIMITS).toEqual(SERVER_LIMITS);
  });

  it('offers only quick amounts the server takes', () => {
    for (const amount of QUICK_AMOUNTS) {
      expect(readAmount(String(amount))).toBe(amount);
    }
  });
});
