import { describe, expect, it } from 'vitest';
import { checkGame, checkName, checkPlayerId } from '../../../src/parties/checks.js';

describe('names', () => {
  it('take Khmer and Latin letters, tidied', () => {
    expect(checkName('  ដារ៉ា  ')).toBe('ដារ៉ា');
    expect(checkName('Sok   Dara')).toBe('Sok Dara');
  });

  it('count Khmer letters as a reader sees them', () => {
    expect(checkName('សុខសុភាពល្អណាស់')).toBe('សុខសុភាពល្អណាស់');
  });

  it.each(['a', 'x'.repeat(17), 'call 0123456', 'www.site', 'Admin', 'hi<b>', 'my.com', 'Mod'])(
    'refuse %s',
    (name) => {
      expect(() => checkName(name)).toThrow('bad-name');
    },
  );
});

describe('player ids and games', () => {
  it('take a random id from the device', () => {
    expect(checkPlayerId('p_3f9K-2aZ')).toBe('p_3f9K-2aZ');
  });

  it.each(['short', 'has space in it', 'x'.repeat(65), null])('refuse the id %s', (id) => {
    expect(() => checkPlayerId(id)).toThrow('bad-id');
  });

  it('take only the games the service is set up for', () => {
    expect(checkGame('morodok-angkor', ['morodok-angkor'])).toBe('morodok-angkor');
    expect(() => checkGame('kit-luy', ['morodok-angkor'])).toThrow('bad-game');
    expect(() => checkGame(undefined, ['morodok-angkor'])).toThrow('bad-game');
  });
});
