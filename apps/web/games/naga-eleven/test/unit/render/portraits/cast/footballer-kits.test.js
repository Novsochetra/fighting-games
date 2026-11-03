import { describe, expect, it } from 'vitest';
import { KEEPER_SPARES, KITS, PLAIN_KITS } from '../../../../../src/art/kits.js';
import { GLOVES, NATIONAL_PIPING, SHIRTS } from '../../../../../src/art/portraits/clothes.js';
import { isKeeperWear, kitLook } from '../../../../../src/render/portraits/cast/footballer-kits.js';

describe('a footballer’s kit in his portrait', () => {
  it('is his side’s keeper kit, with gloves, for a keeper', () => {
    const look = kitLook({ kit: 'royal-kids', wear: 'keeper', neck: 5 });

    expect(look.clothes.cloth).toBe(KITS['royal-kids'].keeper.shirt[2]);
    expect(look.clothes.clothDeep).toBe(KITS['royal-kids'].keeper.shirt[0]);
    expect(look.colours).toBe(GLOVES);
    expect(look.frontProps).toHaveLength(1);
  });

  it('is the spare a keeper changes into when his own shirt clashes', () => {
    const look = kitLook({ kit: 'battambang-high', wear: 'keeper-2', neck: 5 });

    expect(look.clothes.cloth).toBe(KEEPER_SPARES[2].shirt[2]);
  });

  it('is the cloth the named players of his side already wear, at home', () => {
    expect(kitLook({ kit: 'royal-kids', wear: 'home', neck: 5 }).clothes).toBe(SHIRTS.royalKids);
    expect(kitLook({ kit: 'germany', wear: 'home', neck: 7 }).clothes).toBe(SHIRTS.germany);
  });

  it('is shaded from the pitch kit for a side no named player wears, and for an away kit', () => {
    const home = kitLook({ kit: 'nigeria', wear: 'home', neck: 7 });
    const away = kitLook({ kit: 'korea', wear: 'away', neck: 6 });

    expect(home.clothes).toMatchObject({
      cloth: KITS.nigeria.home.shirt[2],
      clothLight: KITS.nigeria.home.shirt[3],
      trim: KITS.nigeria.home.trim[2],
    });
    expect(away.clothes.cloth).toBe(KITS.korea.away.shirt[2]);
  });

  it('puts Cambodia’s men in the national kit’s vee and seams, as Sochetra and Rithy', () => {
    const look = kitLook({ kit: 'cambodia', wear: 'home', neck: 6 });

    expect(look.clothes).toBe(SHIRTS.cambodia);
    expect(look.collar).toBe('vee');
    expect(look.colours).toBe(NATIONAL_PIPING);
    expect(look.chestProps).toHaveLength(1);
  });

  it('dresses a side with no kit of its own in a plain one', () => {
    const look = kitLook({ kit: 'plain-1', wear: 'home', neck: 6 });

    expect(look.clothes.cloth).toBe(PLAIN_KITS[1].home.shirt[2]);
    expect(look.collar).toBe('crew');
  });

  it('tells a keeper’s wear from an outfield one', () => {
    expect(['keeper', 'keeper-0'].every(isKeeperWear)).toBe(true);
    expect(['home', 'away'].some(isKeeperWear)).toBe(false);
  });
});
