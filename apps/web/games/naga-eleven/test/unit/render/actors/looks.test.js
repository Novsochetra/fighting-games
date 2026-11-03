import { describe, expect, it } from 'vitest';
import { HAIRS, SKINS } from '../../../../src/art/actors.js';
import { KITS } from '../../../../src/art/kits.js';
import { looksOf } from '../../../../src/render/actors/looks.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

describe('each player look', () => {
  const match = fixtureMatch({ format: '11' });
  const { players } = looksOf(match);

  it('wears the side kit, and the keeper the keeper kit', () => {
    expect(players[1].shirt).toBe(KITS.cambodia.home.shirt);
    expect(players[0].shirt).toBe(KITS.cambodia.keeper.shirt);
    expect(players[12].shirt).toBe(KITS.korea.away.shirt);
    expect(players[11].shirt).toBe(KITS.korea.keeper.shirt);
  });

  it('gives a team a few faces, so it is not a side of twins', () => {
    const outfield = players.slice(1, 11);
    const faces = new Set(outfield.map((look) => `${look.skin}|${look.hair}`));

    expect(faces.size).toBeGreaterThan(1);
    expect(faces.size).toBeLessThanOrEqual(4);
  });

  it('draws a star as the story tells', () => {
    const sochetra = players[match.players.findIndex((player) => player.star === 'sochetra')];

    expect(sochetra.skin).toBe(SKINS.khmer);
    expect(sochetra.hair).toBe(HAIRS.black);
  });

  it('works out the looks once a match', () => {
    expect(looksOf(match)).toBe(looksOf(match));
    expect(new Set(players.map((look) => look.key)).size).toBeLessThan(players.length);
  });
});
