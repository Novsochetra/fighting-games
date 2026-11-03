import { describe, expect, it } from 'vitest';
import { CITY_SCHOOL_STADIUM } from '../../../src/art/venues/city-school-stadium.js';
import { PROVINCIAL_GROUND } from '../../../src/art/venues/provincial-ground.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { keyOf, layoutOf } from '../../../src/render/venues/layout.js';
import { bannersOf } from '../../../src/render/venues/shared/team-banners.js';
import { createMatch } from '../../../src/sim/create-match.js';

// The city school stadium's banners said CHREY SCHOOL, ROYAL KIDS, SCHOOLS CUP and FINAL in every
// match there, the chapter 2 high school semi-final against Kampot High too, and the provincial
// ground's GO HIGH hung at the chapter 1 primary schools' semi-final. The two sides' banners now
// follow the match, in their own kits' colours, among words of the venue's own that fit any match.
const STALE = ['CHREY SCHOOL', 'ROYAL KIDS', 'SCHOOLS CUP', 'FINAL', 'GO HIGH'];

const matchOf = (format, ids) =>
  createMatch({ seed: 1, format, teams: ids.map((id) => TEAMS[id]) });

const textsAt = (match, art) => bannersOf(layoutOf(match), art).map((banner) => banner.text);

describe('the fans’ banners at a ground', () => {
  it('name the two sides of the match, and no cup or side that is not there', () => {
    const semi = matchOf('11', ['kampong-cham-high', 'kampot-high']);
    const texts = textsAt(semi, CITY_SCHOOL_STADIUM);

    expect(texts).toEqual(expect.arrayContaining(['KAMPONG CHAM HIGH', 'KAMPOT HIGH']));
    expect(texts.filter((text) => STALE.includes(text))).toEqual([]);
  });

  it('hang nothing of a high school at a primary schools’ match', () => {
    const texts = textsAt(matchOf('7', ['chrey-school', 'riverside-school']), PROVINCIAL_GROUND);

    expect(texts).toEqual(expect.arrayContaining(['CHREY SCHOOL', 'RIVERSIDE SCHOOL']));
    expect(texts.filter((text) => /HIGH|CUP|FINAL/.test(text))).toEqual([]);
  });

  it('are painted again for another pair of sides', () => {
    const final = matchOf('7', ['chrey-school', 'royal-kids']);
    const semi = matchOf('7', ['chrey-school', 'riverside-school']);

    expect(keyOf(layoutOf(final))).not.toBe(keyOf(layoutOf(semi)));
  });
});
