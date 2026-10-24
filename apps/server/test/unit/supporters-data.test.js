import { describe, expect, it } from 'vitest';
import { onRailway, railwayProblem, withRailwayDefaults } from '../../src/railway.js';
import { DONATION_LIMITS, readDonation, toCents } from '../../src/supporters/read-donation.js';
import {
  presentSupporter,
  serializeSupporters,
  toArcadeDay,
} from '../../src/supporters/serialize-supporters.js';

describe('readDonation', () => {
  it('cleans the name and message and keeps the amount in cents', () => {
    const body = { name: '  Sok\tDara\n', amount: 12.5, message: ' Keep\u0000it free ' };
    expect(readDonation(body)).toEqual({
      donation: { name: 'Sok Dara', amountCents: 1250, message: 'Keep it free' },
    });
  });

  it('keeps an empty name, which the page shows as Anonymous', () => {
    expect(readDonation({ amount: 5 }).donation).toEqual({
      name: '',
      amountCents: 500,
      message: '',
    });
  });

  it.each([0, 0.99, 10000.01, 1.005, -5, 'five', '', null, Number.NaN, Infinity])(
    'refuses the amount %s',
    (amount) => {
      expect(readDonation({ amount }).error).toMatch(/amount must be from \$1 to \$10000/);
    },
  );

  it('takes an amount typed as text', () => {
    expect(toCents('7.25')).toBe(725);
    expect(toCents(10000)).toBe(1000000);
  });

  it('counts Khmer letters by code point, as Postgres does', () => {
    const name = 'ក'.repeat(DONATION_LIMITS.nameLength);
    expect(readDonation({ name, amount: 1 }).donation.name).toBe(name);
    expect(readDonation({ name: `${name}ក`, amount: 1 }).error).toMatch(/at most 40/);
    const message = 'x'.repeat(DONATION_LIMITS.messageLength + 1);
    expect(readDonation({ message, amount: 1 }).error).toMatch(/at most 140/);
  });

  it('reads a body that is not an object as no gift', () => {
    expect(readDonation(null).error).toBeDefined();
    expect(readDonation([5]).error).toBeDefined();
  });
});

describe('serializeSupporters', () => {
  it('dates a gift by the day in Phnom Penh', () => {
    expect(toArcadeDay(new Date('2026-10-24T18:30:00Z'))).toBe('2026-10-25');
    expect(toArcadeDay(new Date('2026-10-24T16:59:00Z'))).toBe('2026-10-24');
  });

  it('turns cents back into dollars in the shape the page reads', () => {
    const supporter = {
      name: 'Mey',
      amountCents: 1999,
      message: '',
      createdAt: new Date('2026-10-01T03:00:00Z'),
    };
    expect(presentSupporter(supporter)).toEqual({
      name: 'Mey',
      amount: 19.99,
      date: '2026-10-01',
      message: '',
    });
    expect(JSON.parse(serializeSupporters([supporter]))).toEqual({
      currency: 'USD',
      supporters: [presentSupporter(supporter)],
    });
  });
});

describe('Railway defaults', () => {
  const railway = { RAILWAY_ENVIRONMENT_ID: 'env-1' };
  const postgres = 'postgresql://user:secret@postgres.railway.internal:5432/railway';

  it('leaves the environment alone off Railway', () => {
    expect(onRailway({})).toBe(false);
    expect(withRailwayDefaults({ PORT: '1' })).toEqual({ PORT: '1' });
  });

  it('listens on every interface and trusts the proxy on Railway', () => {
    const env = withRailwayDefaults({ ...railway, DATABASE_URL: postgres });
    expect(env).toMatchObject({ HOST: '0.0.0.0', TRUST_PROXY: '1' });
    expect(withRailwayDefaults({ ...railway, DATABASE_URL: postgres, HOST: '::' }).HOST).toBe('::');
  });

  it.each([undefined, '', '"postgres://x"', 'file:arcade.db'])(
    'refuses to start on Railway with DATABASE_URL %j, without showing it',
    (url) => {
      const env = { ...railway, DATABASE_URL: url };
      expect(railwayProblem(env)).toMatch(/DATABASE_URL is not a postgres:\/\/ URL/);
      expect(() => withRailwayDefaults(env)).toThrow(/its value is not shown/);
      expect(railwayProblem(env)).not.toContain('x"');
    },
  );
});
