import { describe, expect, it } from 'vitest';
import { KITS, PLAIN_KITS } from '../../../../src/art/kits.js';
import { PLAIN_TEAMS } from '../../../../src/ui/screens/quick-picks.js';
import { kitColoursOf } from '../../../../src/ui/screens/team-kits.js';
import { venueName } from '../../../../src/ui/screens/venue-names.js';
import { CHREY, ROYAL } from '../../../support/screen-fixtures.js';

const shirt = (kit) => kit.shirt[2];

describe('the kit chips', () => {
  it('shows the home kits of two teams that do not clash', () => {
    const [home, away] = kitColoursOf([CHREY, ROYAL]);

    expect(home.shirt).toBe(shirt(KITS['chrey-school'].home));
    expect(away.shirt).toBe(shirt(KITS['royal-kids'].home));
    expect(home.shorts).toBe(KITS['chrey-school'].home.shorts[2]);
  });

  it('changes the second team into its away kit when the shirts look alike', () => {
    const twin = { ...CHREY, id: 'chrey-twin' };
    const [, away] = kitColoursOf([CHREY, twin]);

    expect(away.shirt).toBe(shirt(KITS['chrey-school'].away));
  });

  it('dresses the plain teams red and blue', () => {
    const [red, blue] = kitColoursOf(PLAIN_TEAMS);

    expect(red.shirt).toBe(shirt(PLAIN_KITS[0].home));
    expect(blue.shirt).toBe(shirt(PLAIN_KITS[1].home));
  });
});

describe('a venue’s name', () => {
  it('comes from its id, or is the text given', () => {
    expect(venueName('national-stadium')).toEqual({
      en: 'National Stadium',
      km: 'ពហុកីឡដ្ឋានជាតិ',
    });
    expect(venueName({ en: 'Back Lot' })).toEqual({ en: 'Back Lot' });
    expect(venueName('unknown-ground')).toBe('unknown-ground');
    expect(venueName(undefined)).toBe(null);
  });
});
