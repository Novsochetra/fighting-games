import { describe, expect, it } from 'vitest';
import { bossHpOn, ultDamageToBoss } from '../../../src/data/boss-toughness.js';

describe("a boss's health", () => {
  it('stays as it is on the first road', () => {
    expect(bossHpOn(0, 200)).toBe(200);
  });

  it('grows a little on each road after it', () => {
    expect(bossHpOn(1, 200)).toBe(208);
    expect(bossHpOn(5, 250)).toBe(300);
    expect(bossHpOn(11, 360)).toBe(518);
  });
});

describe('an ultimate blow on a boss', () => {
  it('takes exactly half, small blows too', () => {
    expect(ultDamageToBoss(24)).toBe(12);
    expect(ultDamageToBoss(3)).toBe(1.5);
  });
});
