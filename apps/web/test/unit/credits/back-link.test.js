import { describe, expect, it } from 'vitest';
import { cameFrom } from '../../../src/credits/back-link.js';

const ARCADE = new URL('https://www.khmerarcade.games/');
const visit = (referrer, historyLength = 2) => cameFrom(ARCADE, { referrer, historyLength });

describe('cameFrom', () => {
  it('knows a visit from the arcade, whatever query or fragment it carried', () => {
    expect(visit('https://www.khmerarcade.games/')).toBe(true);
    expect(visit('https://www.khmerarcade.games/?from=share#library')).toBe(true);
  });

  it('turns down another page of the arcade, or the same path on another site', () => {
    expect(visit('https://www.khmerarcade.games/supporters/')).toBe(false);
    expect(visit('https://khmerarcade.games/')).toBe(false);
    expect(visit('https://example.com/')).toBe(false);
  });

  it('turns down a page opened on its own, or as the first page of its tab', () => {
    expect(visit('')).toBe(false);
    expect(visit('https://www.khmerarcade.games/', 1)).toBe(false);
  });
});
